import { SaveButton } from "../forme/SaveButton";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check, Loader2, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { money, productImage } from "../../lib/format";
export const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();
  const [state, setState] = useState("idle");
  const add = async () => {
    setState("loading");
    const ok = await addToCart(product);
    setState(ok ? "added" : "idle");
    if (ok) setTimeout(() => setState("idle"), 1800);
  };
  const unavailable = product.stock < 1 || product.status !== "ACTIVE";
  const inBag =
    items.find((item) => item.productId === product.id)?.quantity || 0;
  const atLimit =
    !unavailable &&
    (items.find((item) => item.productId === product.id)?.quantity || 0) >=
      product.stock;
  return (
    <article className="product-card">
      <div className="product-card-image">
        <Link to={`/products/${product.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={productImage(product)}
            alt=""
            loading="lazy"
            width="600"
            height="750"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/forme-studio.jpg";
            }}
          />
        </Link>
        <SaveButton product={product} compact />
        {unavailable && <span className="product-tag">Sold out</span>}
        <button
          className={`quick-add ${state === "added" ? "added" : ""}`}
          disabled={unavailable || atLimit || state === "loading"}
          onClick={add}
          aria-busy={state === "loading"}
          aria-label={
            state === "loading"
              ? `Adding ${product.name} to bag`
              : unavailable
                ? `${product.name} is sold out`
                : atLimit
                  ? `All available units of ${product.name} are in your bag`
                  : `Add ${product.name} to bag`
          }
        >
          {state === "loading" ? (
            <Loader2 className="spin" size={19} />
          ) : state === "added" || atLimit ? (
            <Check size={19} />
          ) : (
            <Plus size={21} />
          )}
        </button>
      </div>
      <div className="product-card-meta">
        <div>
          <p className="product-maker">
            {product.vendor?.name || product.category?.name}
          </p>
          <h3>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </h3>
          {inBag > 0 && (
            <Link className="product-in-bag" to="/cart">
              <Check size={12} />
              {inBag} in your bag
            </Link>
          )}
          {product.reviewCount > 0 && (
            <p
              className="product-card-rating"
              aria-label={`${product.ratingAverage.toFixed(1)} out of 5 from ${product.reviewCount} reviews`}
            >
              <Star size={12} fill="currentColor" />
              {product.ratingAverage.toFixed(1)}{" "}
              <span>({product.reviewCount})</span>
            </p>
          )}
        </div>
        <p className="product-price">{money(product.price)}</p>
      </div>
    </article>
  );
};
