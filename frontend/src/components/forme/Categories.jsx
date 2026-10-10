import { Link } from "react-router-dom";
import { ArrowUpRight, Package } from "lucide-react";
import { useCategories } from "../../context/CategoryContext";
export function CategoryCollection({ editorial = false }) {
  const { categories, loading, error, refresh } = useCategories();
  if (error)
    return (
      <div className="inline-error" role="alert">
        <p>We couldn't load categories.</p>
        <button className="text-button" onClick={refresh}>
          Try again
        </button>
      </div>
    );
  if (loading)
    return (
      <div className="category-collection" aria-label="Loading categories">
        {[0, 1, 2, 3].map((i) => (
          <div className="category-tile category-skeleton" key={i} />
        ))}
      </div>
    );
  if (!categories.length)
    return (
      <p className="empty-inline">
        Categories will appear here when the store adds them.
      </p>
    );
  return (
    <div
      id="categories"
      className={`category-collection ${editorial ? "editorial-categories" : ""}`}
    >
      {categories.map((category) => (
        <Link
          className="category-tile"
          key={category.id}
          to={`/products?category=${encodeURIComponent(category.slug)}`}
        >
          <div className="category-tile-image">
            {category.imageUrl ? (
              <img src={category.imageUrl} alt="" loading="lazy" />
            ) : (
              <Package size={34} strokeWidth={1} />
            )}
          </div>
          <div>
            <span>
              <strong>{category.name}</strong>
              <small>
                {category._count.products}{" "}
                {category._count.products === 1 ? "product" : "products"}
              </small>
            </span>
            <ArrowUpRight size={18} />
          </div>
        </Link>
      ))}
    </div>
  );
}
