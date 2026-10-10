import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { productsApi } from "../../api/products";
import { categoriesApi } from "../../api/categories";
import { useToast } from "../../context/ToastContext";
import { Field } from "../../components/forme/UI";
import { FormeSelect } from "../../components/forme/Select";
import {
  PageHeading,
  WorkState,
  useResource,
} from "../../components/management/UI";
import { money, productPhotos } from "../../lib/format";
import { ProductPhotosEditor } from "../../components/management/ProductPhotosEditor";
import { ProductDetailsEditor } from "../../components/management/ProductDetailsEditor";
import { ProductPhoto } from "../../components/forme/ProductGallery";
const blank = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  images: [],
  specifications: [],
  status: "DRAFT",
};
export const VendorProductFormPage = ({ role = "vendor" }) => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const backTo = `/${role}/products${role === "admin" && params.get("vendor") ? `?vendor=${encodeURIComponent(params.get("vendor"))}` : ""}`;
  const loader = useCallback(async () => {
    const [categories, products] = await Promise.all([
      categoriesApi.getCategories(),
      id ? productsApi.getMyProducts() : Promise.resolve({ products: [] }),
    ]);
    const product = id
      ? products.products.find((p) => p.id === Number(id))
      : null;
    if (id && !product) throw Error("This product could not be found.");
    if (product?.deleted)
      throw Error(
        "This product is archived. Restore it from Products → Archived before editing.",
      );
    return { categories: categories.categories, product };
  }, [id]);
  const resource = useResource(loader);
  if (resource.loading || resource.error)
    return <WorkState {...resource} retry={resource.reload} />;
  return (
    <ProductEditor
      key={id || "new"}
      id={id}
      product={resource.data.product}
      categories={resource.data.categories}
      role={role}
      backTo={backTo}
    />
  );
};
function ProductEditor({ id, product: p, categories, role, backTo }) {
  const navigate = useNavigate(),
    toast = useToast();
  const [form, setForm] = useState(() =>
    p
      ? {
          name: p.name,
          description: p.description,
          price: String(p.price),
          stock: String(p.stock),
          categoryId: String(p.categoryId),
          images: productPhotos(p),
          specifications: p.specifications || [],
          status: p.status,
        }
      : blank,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [initial] = useState(() => JSON.stringify(form));
  const dirty = initial !== JSON.stringify(form);
  useEffect(() => {
    if (!dirty && !uploading) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploading]);
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    if (busy || uploading) return;
    if (!form.categoryId) {
      setError("Choose a category for this product.");
      return;
    }
    if (
      ["ACTIVE", "OUT_OF_STOCK"].includes(form.status) &&
      !form.images.length
    ) {
      setError(
        "Add at least one product photo before publishing, or save as a draft.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.status === "OUT_OF_STOCK" ? "ACTIVE" : form.status,
        categoryId: Number(form.categoryId),
        images: form.images,
        specifications: form.specifications.map(({ label, value }) => ({
          label: label.trim(),
          value: value.trim(),
        })),
      };
      if (id) await productsApi.updateProduct(id, payload);
      else await productsApi.createProduct(payload);
      toast.success(
        form.status === "DRAFT"
          ? "Saved as a draft. You can publish it when it’s ready."
          : `${form.name} has been saved.`,
        "Product saved",
      );
      navigate(backTo);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Link to={backTo} className="work-back-link">
        <ArrowLeft size={15} />
        Back to products
      </Link>
      <PageHeading
        eyebrow={role === "admin" ? "THE WHOLE COLLECTION" : "YOUR COLLECTION"}
        title={id ? "Edit product" : "Add product"}
        description="Set up the details, price and availability for your listing."
      />
      <form onSubmit={save} className="work-editor">
        <div className="work-form">
          <section className="work-form-section">
            <h2>01 · The essentials</h2>
            <Field
              id="product-name"
              label="Product name"
              required
              minLength={2}
              maxLength={200}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Daybreak cup"
            />
            <div>
              <label className="work-label" htmlFor="product-description">
                Description *
              </label>
              <textarea
                id="product-description"
                required
                maxLength={5000}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Materials, dimensions, care and what’s included."
              />
              <p className="work-form-help">
                Include materials, dimensions, care instructions and what’s
                included.
              </p>
            </div>
            <FormeSelect
              label="Category"
              required
              placeholder="Choose a category"
              value={form.categoryId}
              onValueChange={(value) => update("categoryId", value)}
              options={categories.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
          </section>
          <section className="work-form-section">
            <h2>02 · Price & availability</h2>
            <div className="work-form-grid">
              <Field
                id="product-price"
                label="Price (₹)"
                max="99999999.99"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="890"
              />
              <Field
                id="product-stock"
                label="Available units"
                type="number"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                placeholder="20"
              />
            </div>
            <FormeSelect
              label="Visibility"
              value={form.status === "OUT_OF_STOCK" ? "ACTIVE" : form.status}
              onValueChange={(value) => update("status", value)}
              options={[
                { value: "DRAFT", label: "Draft · hidden from the store" },
                { value: "ACTIVE", label: "Live · available in the store" },
                {
                  value: "ARCHIVED",
                  label: "Archived · hidden from the store",
                },
              ]}
            />
            <p className="work-form-help">
              A live product with zero available units is marked out of stock
              automatically.
            </p>
          </section>
          <section className="work-form-section">
            <h2>03 · Product photos</h2>
            <ProductPhotosEditor
              images={form.images}
              onChange={(images) => update("images", images)}
              onBusyChange={setUploading}
            />
          </section>
          <section className="work-form-section">
            <h2>04 · The details that matter</h2>
            <ProductDetailsEditor
              value={form.specifications}
              onChange={(details) => update("specifications", details)}
            />
          </section>
          {error && (
            <p className="work-error" role="alert">
              {error}
            </p>
          )}
          <div className="work-form-actions">
            <Link to={backTo} className="work-button secondary">
              Cancel
            </Link>
            <button
              className="work-button"
              disabled={busy || uploading}
              aria-busy={busy || uploading}
            >
              {uploading
                ? "Uploading photos…"
                : busy
                  ? "Saving…"
                  : form.status === "DRAFT"
                    ? "Save draft"
                    : "Save product"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <aside className="work-product-preview">
          <p className="eyebrow">STOREFRONT PREVIEW</p>
          <div className="work-preview-cover">
            <ProductPhoto
              src={form.images[0]?.url}
              alt={form.images[0]?.alt || "Cover preview"}
            />
          </div>
          {form.images.length > 1 && (
            <div className="work-preview-thumbnails">
              {form.images.slice(1, 5).map((image) => (
                <ProductPhoto
                  key={image.url}
                  src={image.url}
                  alt={image.alt || "Gallery preview"}
                />
              ))}
              <span>{form.images.length} photos</span>
            </div>
          )}
          <strong>{form.name || "Your product name"}</strong>
          <span>{money(form.price)}</span>
          <p style={{ marginTop: 15 }}>
            {categories.find((c) => String(c.id) === form.categoryId)?.name ||
              "Choose a category"}
            <br />
            {Number(form.stock) || 0} units in stock
          </p>
        </aside>
      </form>
    </>
  );
}
