import { useSaved } from "../../context/SavedContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { PageState, Quantity, Drawer } from "../../components/forme/UI";
import { OrderSummary } from "../../components/forme/OrderSummary";
import { money, productImage } from "../../lib/format";
export const CartPage = () => {
  const {
    items,
    itemCount,
    subtotal,
    isLoading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { saveFromBag, items: savedItems, busy: saving } = useSaved();
  const [busy, setBusy] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const change = async (id, action) => {
    setBusy(id);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };
  if (isLoading) return <PageState loading />;
  if (error)
    return (
      <PageState
        title="Your bag needs a moment."
        description={error}
        retry={() => window.location.reload()}
      ></PageState>
    );
  if (!items.length)
    return (
      <PageState
        title="Good things belong here."
        description="Your bag is empty. Find something that makes your everyday a little better."
      >
        <Link className="store-button" to="/shop">
          Continue shopping
          <ArrowRight size={17} />
        </Link>
        {savedItems.length > 0 && (
          <Link className="arrow-link" to="/saved">
            View saved items ({savedItems.length})<ArrowRight size={17} />
          </Link>
        )}
      </PageState>
    );
  return (
    <div className="wrap">
      <div className="breadcrumbs">
        <Link to="/shop">Your shop</Link>
        <span>/</span>
        <span>Your bag</span>
      </div>
      <header className="page-heading">
        <p className="eyebrow">A FEW GOOD CHOICES</p>
        <h1>
          Your bag.
          <span style={{ color: "var(--muted)", fontSize: 22, marginLeft: 14 }}>
            ({itemCount})
          </span>
        </h1>
        <p>Thoughtful additions to your everyday.</p>
      </header>
      <div className="bag-layout">
        <div>
          <div className="bag-items">
            {items.map((item) => (
              <article
                className="bag-item"
                key={item.id}
                aria-busy={busy === item.id}
              >
                <Link
                  className="bag-item-image"
                  to={`/products/${item.productId}`}
                >
                  <img
                    src={productImage(item.product)}
                    alt={item.product.name}
                  />
                </Link>
                <div className="bag-item-info">
                  <h2>
                    <Link to={`/products/${item.productId}`}>
                      {item.product.name}
                    </Link>
                  </h2>
                  <p>{money(item.product.price)} each</p>
                  {(item.product.status !== "ACTIVE" ||
                    item.quantity > item.product.stock) && (
                    <p className="field-error">
                      Availability changed. Update or remove this item.
                    </p>
                  )}
                  <div className="bag-item-controls">
                    <Quantity
                      value={item.quantity}
                      onChange={(q) =>
                        change(item.id, () => updateQuantity(item.id, q))
                      }
                      max={item.product.stock}
                      disabled={busy !== null || saving}
                      name={`${item.product.name} quantity`}
                    />
                    <button
                      className="remove-button"
                      disabled={busy !== null || saving}
                      onClick={() => change(item.id, () => saveFromBag(item))}
                      aria-label={`Save ${item.product.name} for later`}
                    >
                      Save for later
                    </button>
                    <button
                      className="remove-button"
                      aria-label={`Remove ${item.product.name} from your bag`}
                      disabled={busy !== null || saving}
                      onClick={() =>
                        change(item.id, () => removeFromCart(item.id))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="bag-item-total">
                  {money(Number(item.product.price) * item.quantity)}
                </p>
              </article>
            ))}
          </div>
          <div className="bag-bottom">
            <Link className="arrow-link" to="/shop">
              <ArrowLeft size={15} />
              Continue exploring
            </Link>
            <button
              className="remove-button"
              disabled={busy !== null || saving}
              onClick={() => setConfirmClear(true)}
            >
              Clear bag
            </button>
          </div>
          <p className="bag-reservation-note">
            Items are reserved when you place your order.
          </p>
        </div>
        <OrderSummary subtotal={subtotal}>
          <Link className="store-button full" to="/checkout">
            Continue to checkout
            <ArrowRight size={17} />
          </Link>
        </OrderSummary>
      </div>
      <div className="bag-saved-link">
        <Link className="arrow-link" to="/saved">
          Saved for later{savedItems.length ? ` (${savedItems.length})` : ""}
          <ArrowRight size={17} />
        </Link>
      </div>
      <Drawer
        open={confirmClear}
        onClose={() => busy === null && setConfirmClear(false)}
        title="Clear your bag?"
      >
        <p>Remove all {itemCount} items from your bag?</p>
        <div className="clear-bag-actions">
          <button
            className="store-button secondary"
            disabled={busy !== null || saving}
            onClick={() => setConfirmClear(false)}
          >
            Keep shopping
          </button>
          <button
            className="store-button"
            disabled={busy !== null || saving}
            onClick={() =>
              change("clear", async () => {
                if (await clearCart()) setConfirmClear(false);
              })
            }
          >
            {busy === "clear" ? "Clearing…" : "Clear bag"}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
