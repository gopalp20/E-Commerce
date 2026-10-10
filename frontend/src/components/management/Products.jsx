import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  Archive,
  ArrowUpRight,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { productsApi } from "../../api/products";
import { adminApi } from "../../api/admin";
import { categoriesApi } from "../../api/categories";
import { useToast } from "../../context/ToastContext";
import { ProductGallery } from "../forme/ProductGallery";
import { Field } from "../forme/UI";
import { FormeSelect } from "../forme/Select";
import { money } from "../../lib/format";
import {
  PageHeading,
  MetricStrip,
  WorkState,
  WorkSearch,
  FilterTabs,
  DataTable,
  Thumbnail,
  Status,
  WorkDrawer,
  Confirm,
  useResource,
  usePage,
  Pagination,
  AddLink,
} from "./UI";
import { VendorFilter } from "./VendorFilter";
const loaders = {
  admin: async (vendorId) => {
    const [p, c, v] = await Promise.all([
      adminApi.getAdminProducts(vendorId ? { vendorId } : {}),
      categoriesApi.getCategories(),
      adminApi.getVendors(),
    ]);
    return { ...p, categories: c.categories, vendors: v.vendors };
  },
  vendor: async () => {
    const [p, c] = await Promise.all([
      productsApi.getMyProducts(),
      categoriesApi.getCategories(),
    ]);
    return { ...p, categories: c.categories };
  },
};
export function Products({ role }) {
  const [params, setParams] = useSearchParams();
  const vendorId = role === "admin" ? params.get("vendor") || "" : "";
  const loader = useCallback(() => loaders[role](vendorId), [role, vendorId]);
  const resource = useResource(loader),
    toast = useToast();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [category, setCategory] = useState(""),
    [target, setTarget] = useState(null),
    [stock, setStock] = useState(null),
    [quantity, setQuantity] = useState("10"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [detail, setDetail] = useState(null);
  const products = resource.data?.products || [],
    live = products.filter((p) => !p.deleted),
    categories = resource.data?.categories || [];
  const matches = (p) =>
    filter === "archived"
      ? p.deleted || p.status === "ARCHIVED"
      : !p.deleted &&
        (filter === "all" ||
          (filter === "low"
            ? p.stock > 0 && p.stock <= 5 && p.status === "ACTIVE"
            : p.status === filter));
  const filtered = products.filter(
    (p) =>
      matches(p) &&
      (!category || String(p.categoryId) === category) &&
      `${p.name} ${p.vendor?.name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const page = usePage(filtered);
  const restore = async (product) => {
    if (busy) return;
    setBusy(true);
    try {
      await productsApi.restoreProduct(product.id);
      toast.success(
        `${product.name} is a draft again. Review it before publishing.`,
        "Product restored",
      );
      setDetail(null);
      setFilter("DRAFT");
      page.setPage(1);
      resource.reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const archive = async () => {
    setBusy(true);
    setError("");
    try {
      await productsApi.deleteProduct(target.id);
      toast.success(
        `${target.name} is no longer in the storefront.`,
        "Product archived",
      );
      setTarget(null);
      setDetail(null);
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const restock = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await productsApi.increaseStock(stock.id, Number(quantity));
      toast.success(
        `Added ${quantity} units to ${stock.name}.`,
        "Stock updated",
      );
      setStock(null);
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (resource.loading || resource.error)
    return <WorkState {...resource} retry={resource.reload} />;
  return (
    <>
      <PageHeading
        eyebrow={
          role === "admin" ? "THE WHOLE COLLECTION" : "MADE BY YOUR STUDIO"
        }
        title="Products"
        description={
          role === "admin"
            ? "Browse listings, check stock and manage visibility."
            : "Keep your collection, pricing and stock in good order."
        }
      >
        {role === "vendor" && (
          <AddLink to="/vendor/products/new">Add product</AddLink>
        )}
      </PageHeading>
      <MetricStrip
        items={[
          {
            label: "In your catalogue",
            value: live.length,
            note: "All current listings",
          },
          {
            label: "Live in store",
            value: live.filter((p) => p.status === "ACTIVE").length,
            note: "Available for customers",
          },
          {
            label: "Low stock",
            value: live.filter(
              (p) => p.stock > 0 && p.stock <= 5 && p.status === "ACTIVE",
            ).length,
            note: "5 units or fewer",
          },
          {
            label: "Out of stock",
            value: live.filter((p) => p.status === "OUT_OF_STOCK").length,
            note: "Ready for a restock",
          },
        ]}
      />
      <FilterTabs
        value={filter}
        onChange={(value) => {
          setFilter(value);
          page.setPage(1);
        }}
        options={[
          { value: "all", label: "All products", count: live.length },
          { value: "ACTIVE", label: "Live" },
          { value: "DRAFT", label: "Drafts" },
          { value: "low", label: "Low stock" },
          { value: "OUT_OF_STOCK", label: "Sold out" },
          { value: "archived", label: "Archived" },
        ]}
      />
      <div className="work-toolbar">
        <WorkSearch
          value={search}
          onChange={(value) => {
            setSearch(value);
            page.setPage(1);
          }}
          placeholder={
            role === "admin" ? "Find a product or vendor" : "Find a product"
          }
        />
        <div className="work-toolbar-filters">
          {role === "admin" && (
            <VendorFilter
              value={vendorId}
              vendors={resource.data?.vendors || []}
              onChange={(value) => {
                const next = new URLSearchParams(params);
                if (value) next.set("vendor", value);
                else next.delete("vendor");
                setParams(next);
                page.setPage(1);
              }}
            />
          )}
          <FormeSelect
            label="Category"
            placeholder="Filter by category"
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              page.setPage(1);
            }}
            options={[
              { value: "", label: "All categories" },
              ...categories.map((c) => ({
                value: String(c.id),
                label: c.name,
              })),
            ]}
          />
        </div>
      </div>
      <DataTable
        caption="Products"
        rows={page.rows}
        columns={[
          {
            label: "Product",
            render: (p) => (
              <div className="work-product-cell">
                <Thumbnail src={p.imageUrl || p.images?.[0]?.url} />
                <div>
                  {role === "vendor" && !p.deleted ? (
                    <Link
                      className="work-row-button"
                      to={`/vendor/products/${p.id}/edit`}
                    >
                      {p.name}
                    </Link>
                  ) : (
                    <button
                      className="work-row-button"
                      onClick={() => setDetail(p)}
                    >
                      {p.name}
                    </button>
                  )}
                  <small>
                    {role === "admin" ? p.vendor?.name : p.category?.name}
                  </small>
                  <div className="work-mobile-product-facts">
                    <span>
                      {money(p.price)} · {p.stock} units
                    </span>
                    <Status value={p.deleted ? "ARCHIVED" : p.status} />
                  </div>
                </div>
              </div>
            ),
          },
          {
            label: "Price",
            className: "nowrap hide-phone",
            render: (p) => money(p.price),
          },
          {
            label: "Stock",
            className: "hide-small nowrap",
            render: (p) => (
              <span className={p.stock <= 5 ? "work-stock-low" : ""}>
                {p.stock} units
              </span>
            ),
          },
          {
            label: "Status",
            className: "hide-phone",
            render: (p) => <Status value={p.deleted ? "ARCHIVED" : p.status} />,
          },
          {
            label: "Actions",
            className: "right",
            render: (p) => (
              <div className="work-row-actions">
                {p.deleted || p.status === "ARCHIVED" ? (
                  <button
                    disabled={busy}
                    aria-label={`Restore ${p.name} as draft`}
                    onClick={() => restore(p)}
                  >
                    <RotateCcw size={17} />
                  </button>
                ) : role === "vendor" ? (
                  <>
                    <Link
                      aria-label={`Edit ${p.name}`}
                      to={`/vendor/products/${p.id}/edit`}
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      aria-label={`Add stock to ${p.name}`}
                      onClick={() => {
                        setStock(p);
                        setQuantity("10");
                        setError("");
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      aria-label={`Edit ${p.name}`}
                      to={`/admin/products/${p.id}/edit${vendorId ? `?vendor=${vendorId}` : ""}`}
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      aria-label={`View ${p.name}`}
                      onClick={() => setDetail(p)}
                    >
                      <ArrowRight size={17} />
                    </button>
                  </>
                )}
                {!p.deleted && p.status !== "ARCHIVED" && (
                  <button
                    aria-label={`Archive ${p.name}`}
                    onClick={() => {
                      setTarget(p);
                      setError("");
                    }}
                  >
                    <Archive size={15} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />
      <Pagination {...page} />
      <WorkDrawer
        open={!!stock}
        onClose={() => !busy && setStock(null)}
        title="Add stock"
      >
        <form className="work-form" onSubmit={restock}>
          <div className="work-product-cell">
            <Thumbnail src={stock?.imageUrl} />
            <div>
              <strong>{stock?.name}</strong>
              <p className="work-form-help">
                {stock?.stock} units available now
              </p>
            </div>
          </div>
          <Field
            label="Units to add"
            id="restock-quantity"
            type="number"
            min="1"
            max="100000"
            step="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <p className="work-drawer-note">
            New stock: {(stock?.stock || 0) + (Number(quantity) || 0)} units.
            Sold-out products become available again after restocking.
          </p>
          {error && (
            <p className="work-error" role="alert">
              {error}
            </p>
          )}
          <div className="work-form-actions">
            <button
              type="button"
              className="work-button secondary"
              disabled={busy}
              onClick={() => setStock(null)}
            >
              Cancel
            </button>
            <button className="work-button" disabled={busy}>
              {busy ? "Saving…" : "Add stock"}
            </button>
          </div>
        </form>
      </WorkDrawer>
      <WorkDrawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Product details"
      >
        {detail && (
          <>
            <ProductGallery key={detail.id} product={detail} />
            <div className="work-detail-section">
              <Status value={detail.deleted ? "ARCHIVED" : detail.status} />
              <h2 className="work-section-title" style={{ marginTop: 20 }}>
                {detail.name}
              </h2>
              <p style={{ marginTop: 15 }}>{detail.description}</p>
            </div>
            <dl className="work-product-facts">
              <div>
                <dt>Price</dt>
                <dd>{money(detail.price)}</dd>
              </div>
              {role === "admin" && (
                <div>
                  <dt>Vendor</dt>
                  <dd>{detail.vendor?.name}</dd>
                </div>
              )}
              <div>
                <dt>Category</dt>
                <dd>{detail.category?.name}</dd>
              </div>
              <div>
                <dt>In stock</dt>
                <dd>{detail.stock} units</dd>
              </div>
            </dl>
            {detail.specifications?.length > 0 && (
              <dl className="product-specifications">
                {detail.specifications.map((item, index) => (
                  <div key={index}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {(detail.deleted || detail.status === "ARCHIVED") && (
              <button
                className="work-button secondary"
                disabled={busy}
                onClick={() => restore(detail)}
              >
                <RotateCcw size={16} />
                Restore as draft
              </button>
            )}
            {!detail.deleted &&
              ["ACTIVE", "OUT_OF_STOCK"].includes(detail.status) && (
                <Link className="work-text-link" to={`/products/${detail.id}`}>
                  View in store
                  <ArrowUpRight size={15} />
                </Link>
              )}
          </>
        )}
      </WorkDrawer>
      <Confirm
        target={target}
        title="Archive this product?"
        description={`“${target?.name}” will be removed from the storefront. Existing orders keep their purchased item details.`}
        label="Archive product"
        danger
        busy={busy}
        error={error}
        onClose={() => setTarget(null)}
        onConfirm={archive}
      />
    </>
  );
}
