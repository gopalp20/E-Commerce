import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { ordersApi } from "../../api/orders";
import { useAuth } from "../../context/AuthContext";
import { ArrowLink, PageState } from "../../components/forme/UI";
import {
  dateLabel,
  money,
  orderNumber,
  productImage,
  titleCase,
} from "../../lib/format";
export const OrdersPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError("");
    ordersApi
      .getMyOrders()
      .then((data) => {
        if (active) setOrders(data.orders);
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
  }, [user, retry]);
  if (authLoading) return <PageState loading />;
  if (!user)
    return (
      <Navigate to="/login" replace state={{ from: { pathname: "/orders" } }} />
    );
  return (
    <div className="wrap">
      <div className="breadcrumbs">
        <Link to="/profile">Your account</Link>
        <span>/</span>
        <span>Orders</span>
      </div>
      <header className="page-heading">
        <p className="eyebrow">GOOD THINGS, ON THEIR WAY</p>
        <h1>Your orders.</h1>
        <p>Every order, all the little details, in one place.</p>
      </header>
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState description={error} retry={() => setRetry(retry + 1)} />
      ) : !orders.length ? (
        <PageState
          title="Your story starts here."
          description="Once you place an order, you'll find it here."
        >
          <ArrowLink to="/products">Find your first good thing</ArrowLink>
        </PageState>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-list-card" key={order.id}>
              <header>
                <div>
                  <strong>{orderNumber(order.id)}</strong>
                  <small>{dateLabel(order.createdAt)}</small>
                </div>
                <span
                  className={`status-badge ${order.status === "CANCELLED" ? "cancelled" : ""}`}
                >
                  {titleCase(order.status)}
                </span>
              </header>
              <div className="order-list-bottom">
                <div className="order-list-images">
                  {order.items.slice(0, 3).map((item) => (
                    <img
                      key={item.id}
                      src={item.productImage || productImage(item.product)}
                      alt={item.productName || item.product?.name}
                    />
                  ))}
                  {order.items.length > 3 && (
                    <span>+{order.items.length - 3}</span>
                  )}
                </div>
                <div>
                  <strong>{money(order.totalAmount)}</strong>
                  <ArrowLink to={`/orders/${order.id}`}>View order</ArrowLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
