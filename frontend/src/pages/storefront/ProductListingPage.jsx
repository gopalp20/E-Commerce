import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { roleHome } from "../../lib/authNavigation";
import { productsApi } from "../../api/products";
import { useCategories } from "../../context/CategoryContext";
import { useAuth } from "../../context/AuthContext";
import { ProductCard } from "../../components/customer/ProductCard";
import { FormeSelect } from "../../components/forme/Select";
export const ProductListingPage = () => {
  const [params, setParams] = useSearchParams(),
    query = params.toString();
  const { user } = useAuth();
  const {
    categories,
    loading: categoriesLoading,
    error: categoryError,
    refresh,
  } = useCategories();
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    productsApi
      .getProducts({
        ...Object.fromEntries(new URLSearchParams(query)),
        limit: 12,
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, retry]);
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
    if (key === "page") window.scrollTo({ top: 0, behavior: "instant" });
  };
  const activeCategory = categories.find(
    (category) => category.slug === params.get("category"),
  );
  const categoryOptions = [
    { value: "", label: "All products" },
    ...categories.map((category) => ({
      value: category.slug,
      label: category.name,
    })),
  ];
  const title = params.get("search")
    ? `Results for “${params.get("search")}”`
    : activeCategory?.name || "All products";
  const resultCount = data?.pagination.total || 0;
  return (
    <div className="wrap browse-page">
      <div className="breadcrumbs">
        <Link to={user ? roleHome(user) : "/"}>
          {user
            ? user.role === "CUSTOMER"
              ? "Your shop"
              : "Dashboard"
            : "Home"}
        </Link>
        <span>/</span>
        <span>
          {params.get("search")
            ? "Search"
            : activeCategory?.name || "All products"}
        </span>
      </div>
      <header className="browse-heading">
        <div>
          <p className="eyebrow">THE COLLECTION</p>
          <h1>{title}</h1>
        </div>
        <p>Useful things. Beautifully considered.</p>
      </header>
      <div className="browse-layout">
        <aside className="category-sidebar">
          <h2>Categories</h2>
          {categoriesLoading ? (
            <p className="field-help">Loading categories…</p>
          ) : categoryError ? (
            <div className="inline-error">
              <p>Couldn't load categories.</p>
              <button className="text-button" onClick={refresh}>
                Try again
              </button>
            </div>
          ) : (
            <nav aria-label="Product categories">
              {categoryOptions.map((category) => (
                <button
                  key={category.value}
                  aria-current={
                    (params.get("category") || "") === category.value
                      ? "true"
                      : undefined
                  }
                  className={
                    (params.get("category") || "") === category.value
                      ? "selected"
                      : ""
                  }
                  onClick={() => update("category", category.value)}
                >
                  <span>{category.label}</span>
                </button>
              ))}
            </nav>
          )}
          <p>
            Free standard delivery
            <br />
            on orders ₹2,500+.
          </p>
        </aside>
        <section
          className="browse-results"
          aria-label="Product results"
          aria-busy={loading}
        >
          <div className="browse-toolbar">
            <span aria-live="polite">
              {loading
                ? "Finding products…"
                : `${resultCount} ${resultCount === 1 ? "product" : "products"}`}
            </span>
            <div className="browse-controls">
              <FormeSelect
                compact
                className="mobile-category-select"
                label="Category"
                value={params.get("category") || ""}
                options={categoryOptions}
                onValueChange={(value) => update("category", value)}
              />
              <FormeSelect
                compact
                label="Price"
                value={params.get("maxPrice") || ""}
                onValueChange={(value) => update("maxPrice", value)}
                options={[
                  { value: "", label: "Any price" },
                  { value: "1000", label: "Up to ₹1,000" },
                  { value: "3000", label: "Up to ₹3,000" },
                  { value: "5000", label: "Up to ₹5,000" },
                ]}
              />
              <FormeSelect
                compact
                label="Sort by"
                value={params.get("sort") || "newest"}
                onValueChange={(value) => update("sort", value)}
                options={[
                  { value: "newest", label: "Recently added" },
                  { value: "rating_desc", label: "Highest rated" },
                  { value: "best_selling", label: "Best selling" },
                  { value: "price_asc", label: "Price: low to high" },
                  { value: "price_desc", label: "Price: high to low" },
                  { value: "name_asc", label: "Name: A to Z" },
                ]}
              />
            </div>
          </div>
          <div className="browse-refinements">
            <label className="stock-filter">
              <input
                type="checkbox"
                checked={params.get("availability") === "in_stock"}
                onChange={(event) =>
                  update("availability", event.target.checked ? "in_stock" : "")
                }
              />
              <span>In stock only</span>
            </label>
            <FormeSelect
              compact
              label="Customer rating"
              value={params.get("minRating") || ""}
              onValueChange={(value) => update("minRating", value)}
              options={[
                { value: "", label: "All ratings" },
                { value: "4", label: "4 stars & up" },
                { value: "3", label: "3 stars & up" },
                { value: "2", label: "2 stars & up" },
              ]}
            />
          </div>
          {params.get("sort") === "best_selling" && (
            <p className="sort-explanation">
              Ordered by units in delivered orders. Cancelled and unfulfilled
              orders don’t count.
            </p>
          )}
          {(params.get("search") ||
            params.get("maxPrice") ||
            params.get("minPrice") ||
            params.get("category") ||
            params.get("availability") ||
            params.get("minRating")) && (
            <div className="active-filters">
              {params.get("category") && (
                <button
                  onClick={() => update("category", "")}
                  aria-label="Remove category filter"
                >
                  {activeCategory?.name || "Category"}
                  <X size={13} />
                </button>
              )}
              {params.get("availability") && (
                <button
                  onClick={() => update("availability", "")}
                  aria-label="Remove in stock filter"
                >
                  In stock
                  <X size={13} />
                </button>
              )}
              {params.get("minRating") && (
                <button
                  onClick={() => update("minRating", "")}
                  aria-label="Remove rating filter"
                >
                  {params.get("minRating")} stars & up
                  <X size={13} />
                </button>
              )}
              {params.get("minPrice") && (
                <button
                  onClick={() => update("minPrice", "")}
                  aria-label="Remove minimum price filter"
                >
                  From ₹{Number(params.get("minPrice")).toLocaleString("en-IN")}
                  <X size={13} />
                </button>
              )}
              {params.get("search") && (
                <button onClick={() => update("search", "")}>
                  Search: {params.get("search")}
                  <X size={13} />
                </button>
              )}
              {params.get("maxPrice") && (
                <button onClick={() => update("maxPrice", "")}>
                  Up to ₹
                  {Number(params.get("maxPrice")).toLocaleString("en-IN")}
                  <X size={13} />
                </button>
              )}
              <button
                className="clear-filters"
                onClick={() => {
                  const next = new URLSearchParams();
                  if (params.get("sort")) next.set("sort", params.get("sort"));
                  setParams(next);
                }}
              >
                Clear all
              </button>
            </div>
          )}
          {loading && !data ? (
            <div className="product-grid">
              {[0, 1, 2].map((i) => (
                <div className="product-skeleton" key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="browse-empty" role="alert">
              <h2>We couldn't load the collection.</h2>
              <p>{error}</p>
              <button
                className="store-button secondary"
                onClick={() => setRetry((n) => n + 1)}
              >
                Try again
              </button>
            </div>
          ) : !data?.products.length ? (
            <div className="browse-empty">
              <p className="eyebrow">A LITTLE MORE ROOM</p>
              <h2>No matching products.</h2>
              <p>
                Try another search or clear your filters to see the full
                collection.
              </p>
              <button className="store-button" onClick={() => setParams({})}>
                Show all products
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              <div
                className={`product-grid${loading ? " updating" : ""}`}
                inert={loading || undefined}
              >
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {data.pagination.totalPages > 1 && (
                <nav className="pagination-row" aria-label="Collection pages">
                  <button
                    className="icon-button"
                    aria-label="Previous page"
                    disabled={!data.pagination.hasPreviousPage}
                    onClick={() =>
                      update("page", String(data.pagination.page - 1))
                    }
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span>
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Next page"
                    disabled={!data.pagination.hasNextPage}
                    onClick={() =>
                      update("page", String(data.pagination.page + 1))
                    }
                  >
                    <ArrowRight size={18} />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
