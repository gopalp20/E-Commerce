import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useSaved } from "../../context/SavedContext";
import { PageState, Quantity } from "../../components/forme/UI";
import { money, productImage } from "../../lib/format";
function SavedRow({ item }) {
  const { busy, remove, moveToBag } = useSaved();
  const { items: bagItems } = useCart();
  const inBag =
    bagItems.find((row) => row.productId === item.productId)?.quantity || 0;
  const p = item.product,
    available = item.available && p.status === "ACTIVE" && p.stock > 0;
  const [quantity, setQuantity] = useState(item.quantity);
  const changed = item.available && Number(p.price) !== Number(item.savedPrice);
  return (
    <article className="saved-row">
      <Link
        to={item.available ? `/products/${p.id}` : "/products"}
        className="saved-photo"
        aria-label={
          item.available ? `View ${p.name}` : "Browse available products"
        }
      >
        <img src={productImage(p)} alt="" loading="lazy" />
      </Link>
      <div className="saved-description">
        <p className="product-maker">{p.vendor?.name || "SAVED ITEM"}</p>
        <h2>
          {item.available ? (
            <Link to={`/products/${p.id}`}>{p.name}</Link>
          ) : (
            p.name
          )}
        </h2>
        <p className="saved-price">
          {item.available ? money(p.price) : "No longer listed"}
        </p>
        {changed && (
          <p className="saved-price-change">
            {Number(p.price) < Number(item.savedPrice)
              ? "Price decreased"
              : "Price changed"}{" "}
            · {money(item.savedPrice)} when saved
          </p>
        )}
        {item.available && !available && (
          <p className="field-help">
            Currently sold out. It can stay in your list.
          </p>
        )}
        {available && quantity > p.stock && (
          <p className="field-error">
            Only {p.stock} available. Choose a lower quantity.
          </p>
        )}
        <button
          className="text-button"
          disabled={busy}
          onClick={() => remove(p.id)}
          aria-label={`Remove ${p.name} from saved items`}
        >
          Remove
        </button>
      </div>
      <div className="saved-actions">
        {inBag > 0 ? (
          <div className="saved-in-bag">
            <span>{inBag} already in your bag</span>
            <Link className="store-button secondary" to="/cart">
              View bag
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {available && (
              <Quantity
                value={quantity}
                max={p.stock}
                onChange={setQuantity}
                disabled={busy}
                name={`${p.name} saved quantity`}
              />
            )}
            <button
              className="store-button secondary"
              disabled={busy || !available || quantity > p.stock}
              onClick={() => moveToBag(item, quantity)}
            >
              {available
                ? "Move to bag"
                : item.available
                  ? "Sold out"
                  : "Unavailable"}
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
export function SavedItemsPage() {
  const { items, loading, error, refresh } = useSaved();
  const [page, setPage] = useState(1);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) refresh();
    });
    return () => {
      active = false;
    };
  }, [refresh]);
  const changePage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const pages = Math.max(1, Math.ceil(items.length / 12)),
    current = Math.min(page, pages);
  if (loading) return <PageState loading />;
  if (error)
    return (
      <PageState
        title="Your saved items need a moment."
        description={error}
        retry={refresh}
      />
    );
  return (
    <div className="wrap saved-page">
      <div className="breadcrumbs">
        <Link to="/shop">Your shop</Link>
        <span>/</span>
        <span>Saved items</span>
      </div>
      <header className="page-heading saved-heading">
        <div>
          <p className="eyebrow">KEEP IT IN MIND</p>
          <h1>Saved for later.</h1>
          <p>
            {items.length
              ? `${items.length} ${items.length === 1 ? "item" : "items"}, ready when you are. Saving does not reserve stock or prices.`
              : "A place for the things you’re still thinking about."}
          </p>
        </div>
        <Link className="arrow-link" to="/products">
          Explore the collection
          <ArrowRight size={17} />
        </Link>
      </header>
      {!items.length ? (
        <div className="saved-empty">
          <p>
            Tap the heart on a product to keep it here, or save an item from
            your bag.
          </p>
          <Link className="store-button" to="/products">
            Find something you like
            <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <>
          <div className="saved-list" aria-busy={loading}>
            {items.slice((current - 1) * 12, current * 12).map((item) => (
              <SavedRow key={item.productId} item={item} />
            ))}
          </div>
          {pages > 1 && (
            <nav className="pagination-row" aria-label="Saved item pages">
              <button
                className="icon-button"
                aria-label="Previous page"
                disabled={current === 1}
                onClick={() => changePage(current - 1)}
              >
                <ArrowLeft size={18} />
              </button>
              <span>
                Page {current} of {pages}
              </span>
              <button
                className="icon-button"
                aria-label="Next page"
                disabled={current === pages}
                onClick={() => changePage(current + 1)}
              >
                <ArrowRight size={18} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
