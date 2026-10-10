import { useState, useEffect } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { ordersApi } from "../../api/orders";
import { useAuth } from "../../context/AuthContext";
import { Drawer, PageState } from "../../components/forme/UI";
import {
  money,
  dateLabel,
  orderNumber,
  productImage,
  titleCase,
} from "../../lib/format";
const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
export const OrderDetailPage = () => {
  const { id } = useParams(),
    location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [cancelError, setCancelError] = useState("");
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError("");
    ordersApi
      .getOrderById(id)
      .then((data) => {
        if (active) setOrder(data.order);
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
  }, [id, user, retry]);
  const cancel = async () => {
    setBusy(true);
    setCancelError("");
    try {
      const data = await ordersApi.cancelOrder(id);
      setOrder(data.order);
      setConfirm(false);
    } catch (e) {
      setCancelError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (authLoading) return <PageState loading />;
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  if (loading) return <PageState loading />;
  if (error || !order)
    return (
      <PageState
        title="We couldn't find your order."
        description={error}
        retry={() => setRetry(retry + 1)}
      >
        <Link to="/orders" className="arrow-link">
          Back to your orders
        </Link>
      </PageState>
    );
  const address = order.shippingAddress,
    cancelled = order.status === "CANCELLED";
  return (
    <div className="wrap">
      <div className="breadcrumbs">
        <Link to="/orders">Your orders</Link>
        <span>/</span>
        <span>{orderNumber(order.id)}</span>
      </div>
      <header className="order-success">
        {location.state?.justPlaced && !cancelled && (
          <div className="success-icon">
            <Check size={25} />
          </div>
        )}
        <p className="eyebrow">
          {orderNumber(order.id)} · {dateLabel(order.createdAt)}
        </p>
        <h1>
          {cancelled
            ? "A change of plans."
            : location.state?.justPlaced
              ? "Good things are coming."
              : "Your order, at a glance."}
        </h1>
        <p>
          {cancelled
            ? "Your order has been cancelled. No payment is due."
            : "Your order is saved. You can come back here for every detail."}
          <br />
          This is a demo order. No payment or physical delivery will take place.
        </p>
      </header>
      <div className="order-detail-layout">
        <div>
          <section className="order-status-panel">
            <header>
              <strong>Order status</strong>
              <span className={`status-badge ${cancelled ? "cancelled" : ""}`}>
                {titleCase(order.status)}
              </span>
            </header>
            {cancelled ? (
              <p style={{ fontSize: 13 }}>
                The items have been returned to available stock.
              </p>
            ) : (
              <ol className="status-track">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className={`status-step ${index <= steps.indexOf(order.status) ? "done" : ""}`}
                    aria-current={step === order.status ? "step" : undefined}
                  >
                    <i />
                    {titleCase(step)}
                  </li>
                ))}
              </ol>
            )}
          </section>
          <div>
            {order.items.map((item) => (
              <article className="bag-item" key={item.id}>
                <img
                  className="bag-item-image"
                  src={item.productImage || productImage(item.product)}
                  alt=""
                />
                <div className="bag-item-info">
                  <h2>{item.productName || item.product?.name}</h2>
                  <p>
                    Quantity {item.quantity} · {money(item.price)} each
                  </p>
                  <Link
                    to={`/products/${item.productId}${order.status === "DELIVERED" ? "#reviews" : ""}`}
                    className="arrow-link"
                  >
                    {order.status === "DELIVERED"
                      ? "Review this item"
                      : "View item"}
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <strong className="bag-item-total">
                  {money(Number(item.price) * item.quantity)}
                </strong>
              </article>
            ))}
          </div>
          <div className="order-address">
            <h3>Delivery details</h3>
            {address ? (
              <address style={{ fontStyle: "normal" }}>
                {address.name}
                <br />
                {address.line1}
                <br />
                {address.line2 && (
                  <>
                    {address.line2}
                    <br />
                  </>
                )}
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
                <br />
                {address.phone}
              </address>
            ) : (
              <p>No address was recorded for this earlier order.</p>
            )}
            <p style={{ marginTop: 14 }}>
              {titleCase(order.deliveryMethod)} delivery · Pay on delivery
            </p>
          </div>
        </div>
        <aside className="order-summary">
          <p className="eyebrow">THE DETAILS</p>
          <h2>Order summary</h2>
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>Delivery</span>
            <span>
              {Number(order.shippingAmount)
                ? money(order.shippingAmount)
                : "Free"}
            </span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <strong>{money(order.totalAmount)}</strong>
          </div>
          <p className="checkout-terms">
            {cancelled
              ? "Cancelled · Nothing to pay"
              : "Pay on delivery · No payment collected"}
          </p>
          <Link to="/products" className="store-button full">
            Keep exploring
            <ArrowRight size={16} />
          </Link>
          {["PENDING", "CONFIRMED"].includes(order.status) && (
            <button
              className="arrow-link"
              style={{ marginTop: 22 }}
              onClick={() => setConfirm(true)}
            >
              Cancel this order
            </button>
          )}
        </aside>
      </div>
      <Drawer
        title="Cancel this order?"
        open={confirm}
        onClose={() => {
          if (!busy) setConfirm(false);
        }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.8 }}>
          All items in {orderNumber(order.id)} will be cancelled and returned to
          stock. You can always place a new order later.
        </p>
        {cancelError && (
          <p className="error-message" role="alert">
            {cancelError}
          </p>
        )}
        <div className="confirmation-actions">
          <button
            className="store-button secondary"
            disabled={busy}
            onClick={() => setConfirm(false)}
          >
            Keep order
          </button>
          <button className="store-button" disabled={busy} onClick={cancel}>
            {busy ? "Cancelling…" : "Yes, cancel order"}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
