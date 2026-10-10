import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { categoriesApi } from "../../api/categories";
import { useToast } from "../../context/ToastContext";
import { Field } from "../../components/forme/UI";
import {
  PageHeading,
  WorkState,
  WorkSearch,
  DataTable,
  Thumbnail,
  WorkDrawer,
  Confirm,
  useResource,
  usePage,
  Pagination,
} from "../../components/management/UI";
const loadCategories = () => categoriesApi.getCategories();
const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const AdminCategoriesPage = () => {
  const resource = useResource(loadCategories),
    toast = useToast();
  const [search, setSearch] = useState(""),
    [editing, setEditing] = useState(null),
    [target, setTarget] = useState(null),
    [form, setForm] = useState({ name: "", slug: "" }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const categories = resource.data?.categories || [];
  const page = usePage(
    categories.filter((c) =>
      `${c.name} ${c.slug}`.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const open = (category) => {
    setEditing(category || { new: true });
    setForm(
      category
        ? { name: category.name, slug: category.slug }
        : { name: "", slug: "" },
    );
    setError("");
  };
  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (editing.id) await categoriesApi.updateCategory(editing.id, form);
      else await categoriesApi.createCategory(form);
      setEditing(null);
      resource.reload();
      toast.success(`${form.name} is ready in the store.`, "Category saved");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await categoriesApi.deleteCategory(target.id);
      toast.success(`${target.name} has been removed.`, "Category removed");
      setTarget(null);
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
        eyebrow="THE COLLECTION"
        title="Categories"
        description="Organise the collection customers browse."
      >
        <button className="work-button" onClick={() => open()}>
          <Plus size={17} />
          New category
        </button>
      </PageHeading>
      <div className="work-split">
        <section>
          <div className="work-toolbar">
            <span className="work-secondary">
              {categories.length} categories in your store
            </span>
            <WorkSearch
              value={search}
              onChange={(value) => {
                setSearch(value);
                page.setPage(1);
              }}
              placeholder="Find a category"
            />
          </div>
          <DataTable
            caption="Store categories"
            rows={page.rows}
            columns={[
              {
                label: "Category",
                render: (row) => (
                  <div className="work-product-cell">
                    <Thumbnail src={row.imageUrl} className="category-thumb" />
                    <div>
                      <button
                        className="work-row-button"
                        onClick={() => open(row)}
                      >
                        {row.name}
                      </button>
                      <small>/{row.slug}</small>
                      <Link
                        className="work-mobile-only work-category-count"
                        to={`/products?category=${encodeURIComponent(row.slug)}`}
                      >
                        {row._count.products}{" "}
                        {row._count.products === 1 ? "product" : "products"}{" "}
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ),
              },
              {
                label: "In the collection",
                className: "nowrap hide-phone",
                render: (row) => (
                  <Link
                    className="work-row-button"
                    to={`/products?category=${encodeURIComponent(row.slug)}`}
                  >
                    {row._count.products}{" "}
                    {row._count.products === 1 ? "product" : "products"}
                    <ArrowUpRight size={13} />
                  </Link>
                ),
              },
              {
                label: "Actions",
                className: "right",
                render: (row) => (
                  <div className="work-row-actions">
                    <button
                      aria-label={`Edit ${row.name}`}
                      onClick={() => open(row)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      aria-label={`Delete ${row.name}`}
                      onClick={() => {
                        setTarget(row);
                        setError("");
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination {...page} />
        </section>
        <aside className="work-aside">
          <p className="eyebrow">IN YOUR STOREFRONT</p>
          <h2>
            Categories in
            <br />
            your store
          </h2>
          <p>
            Your categories appear in the shopping home and collection filters.
            Add or rename one here, and the store follows.
          </p>
          <dl>
            <div>
              <dt>Categories</dt>
              <dd>{categories.length}</dd>
            </div>
            <div>
              <dt>Live products</dt>
              <dd>{categories.reduce((n, c) => n + c._count.products, 0)}</dd>
            </div>
            <div>
              <dt>Empty categories</dt>
              <dd>{categories.filter((c) => !c._count.products).length}</dd>
            </div>
          </dl>
          <Link to="/products" className="work-text-link">
            View the collection
            <ArrowUpRight size={15} />
          </Link>
        </aside>
      </div>
      <WorkDrawer
        open={!!editing}
        onClose={() => !busy && setEditing(null)}
        title={editing?.id ? "Edit category" : "New category"}
      >
        <form className="work-form" onSubmit={save}>
          <p className="work-form-help">
            A clear name makes your collection easier to explore.
          </p>
          <Field
            id="category-name"
            label="Category name"
            value={form.name}
            minLength={2}
            maxLength={100}
            required
            placeholder="e.g. Lighting"
            onChange={(event) =>
              setForm((f) => ({
                ...f,
                name: event.target.value,
                ...(!editing.id && { slug: slugify(event.target.value) }),
              }))
            }
          />
          <div>
            <Field
              id="category-slug"
              label="URL name"
              value={form.slug}
              minLength={2}
              maxLength={100}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              onChange={(event) =>
                setForm((f) => ({ ...f, slug: event.target.value }))
              }
            />
            <p className="work-form-help">
              Lowercase words separated by dashes. This is used in collection
              links.
            </p>
          </div>
          <div className="work-drawer-note">
            Store preview
            <br />
            <strong>{form.name || "Your category name"}</strong>
            <p className="work-form-help">
              /products?category={form.slug || "category-name"}
            </p>
          </div>
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
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button className="work-button" disabled={busy}>
              {busy ? "Saving…" : "Save category"}
            </button>
          </div>
        </form>
      </WorkDrawer>
      <Confirm
        target={target}
        title="Remove this category?"
        description={`“${target?.name}” will disappear from the store navigation. Move its products to another category before removing it.`}
        label="Remove category"
        danger
        busy={busy}
        error={error}
        onClose={() => setTarget(null)}
        onConfirm={remove}
      />
    </>
  );
};
