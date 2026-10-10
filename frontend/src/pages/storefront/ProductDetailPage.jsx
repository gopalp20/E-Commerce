import { SaveButton } from "../../components/forme/SaveButton";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, ShoppingBag, Truck, Loader2 } from "lucide-react";
import { productsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { money } from "../../lib/format";
import { PageState, Quantity } from "../../components/forme/UI";
import { ProductGallery } from "../../components/forme/ProductGallery";
import { roleHome } from "../../lib/authNavigation";
import { useAuth } from "../../context/AuthContext";
import { ProductCard } from "../../components/customer/ProductCard";
import { ProductReviews, Stars } from "../../components/forme/Reviews";
export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [retry, setRetry] = useState(0);
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const updateRating = useCallback(
    (summary) =>
      setProduct((p) => ({
        ...p,
        ratingAverage: summary.average,
        reviewCount: summary.count,
      })),
    [],
  );
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setQuantity(1);
    setAdded(false);
    productsApi
      .getProductById(id)
      .then((r) => {
        if (!active) return;
        setProduct(r.product);
        return productsApi
          .getProducts({ category: r.product.category.slug, limit: 5 })
          .catch(() => ({ products: [] }));
      })
      .then((r) => {
        if (active && r)
          setRelated(r.products.filter((p) => p.id !== Number(id)).slice(0, 4));
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
  }, [id, retry]);
  if (loading) return <PageState loading />;
  if (error || !product)
    return (
      <PageState
        title="This object is out of reach."
        description={error}
        retry={() => setRetry((x) => x + 1)}
      >
        <Link className="arrow-link" to="/products">
          Back to the collection
          <ArrowRight size={16} />
        </Link>
      </PageState>
    );
  const unavailable = product.stock < 1 || product.status !== "ACTIVE";
  const inBag =
    cart?.items?.find((item) => item.productId === product.id)?.quantity || 0;
  const remaining = Math.max(0, product.stock - inBag);
  const selectedQuantity = Math.max(1, Math.min(quantity, remaining));
  const add = async () => {
    setAdding(true);
    const ok = await addToCart(product, selectedQuantity);
    setAdding(false);
    setAdded(ok);
  };
  return (
    <div className="wrap product-detail">
      <div className="breadcrumbs">
        <Link to={user ? roleHome(user) : "/"}>
          {user
            ? user.role === "CUSTOMER"
              ? "Your shop"
              : "Dashboard"
            : "Home"}
        </Link>
        <span>/</span>
        <Link to="/products">The collection</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="product-layout">
        <ProductGallery key={product.id} product={product} />
        <section className="product-info">
          <p className="eyebrow">
            {product.vendor?.name} / {product.category?.name}
          </p>
          <h1>{product.name}</h1>
          <a className="detail-rating" href="#reviews">
            {product.reviewCount ? (
              <>
                <Stars value={product.ratingAverage} />
                <span>
                  {product.ratingAverage.toFixed(1)} · {product.reviewCount}{" "}
                  {product.reviewCount === 1 ? "review" : "reviews"}
                </span>
              </>
            ) : (
              "No reviews yet"
            )}
          </a>
          <p className="detail-price">{money(product.price)}</p>
          <p className="detail-caption">Delivery calculated at checkout.</p>
          <p className="product-description">{product.description}</p>
          <p className={`stock-status ${unavailable ? "sold-out" : ""}`}>
            {unavailable
              ? "Currently out of stock"
              : product.stock < 10
                ? `${product.stock} available — ready for a new home`
                : "In stock, ready for your everyday"}
          </p>
          <div className="purchase-controls">
            <Quantity
              value={selectedQuantity}
              onChange={(value) => {
                setQuantity(value);
                setAdded(false);
              }}
              max={remaining}
              disabled={adding || unavailable || remaining === 0}
            />
            <button
              className="store-button"
              disabled={adding || unavailable || remaining === 0}
              onClick={add}
            >
              {adding ? (
                <Loader2 className="spin" size={17} />
              ) : added ? (
                <Check size={17} />
              ) : (
                <ShoppingBag size={17} />
              )}{" "}
              {unavailable
                ? "Sold out"
                : remaining === 0
                  ? "All available units in your bag"
                  : adding
                    ? "Adding…"
                    : added
                      ? "Added to your bag"
                      : "Add to bag"}
            </button>
          </div>
          <SaveButton product={product} />
          {inBag > 0 && (
            <p className="detail-bag-note">
              {inBag} {inBag === 1 ? "is" : "are"} already in your bag.
            </p>
          )}
          {(added || inBag > 0) && (
            <Link className="arrow-link" to="/cart" style={{ marginTop: 18 }}>
              View your bag
              <ArrowRight size={16} />
            </Link>
          )}
          <div className="product-delivery">
            <Truck size={19} />
            <span>
              Free standard delivery on orders ₹2,500+.
              <br />
              Pay when your order arrives.
            </span>
          </div>
          <div className="product-accordions">
            {product.specifications?.length > 0 && (
              <details open>
                <summary>Product details</summary>
                <dl className="product-specifications">
                  {product.specifications.map((detail, i) => (
                    <div key={i}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            <details>
              <summary>Delivery & cancellations</summary>
              <p>
                Standard delivery is ₹149, or free on orders of ₹2,500 or more.
                Express delivery is ₹299. You can cancel a pending or confirmed
                order from your account.{" "}
                <Link to="/delivery" className="text-button">
                  Read the details
                </Link>
              </p>
            </details>
            <details>
              <summary>A note on the collection</summary>
              <p>
                This is a demonstration catalogue for the FORME college project.
                Product names, prices and descriptions are sample data; no real
                payment or shipment is made.
              </p>
            </details>
          </div>
        </section>
      </div>
      <ProductReviews
        key={product.id}
        product={product}
        onSummary={updateRating}
      />
      {related.length > 0 && (
        <section className="related-products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GOOD THINGS GO TOGETHER</p>
              <h2>A little more to explore.</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
