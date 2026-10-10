import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { vendorApi } from "../../api/vendor";
import { PageState, ArrowLink } from "../../components/forme/UI";
export const CustomerProfilePage = () => {
  const { user, logout, isLoading } = useAuth();
  const [applied, setApplied] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const apply = async () => {
    setBusy(true);
    setError("");
    try {
      await vendorApi.applyVendor();
      setApplied(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (isLoading) return <PageState loading />;
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: "/profile" } }}
      />
    );
  return (
    <div className="wrap">
      <div className="breadcrumbs">
        <Link to="/shop">Your shop</Link>
        <span>/</span>
        <span>Your account</span>
      </div>
      <header className="page-heading">
        <p className="eyebrow">YOUR LITTLE CORNER OF FORME</p>
        <h1>Hello, {user.name.split(" ")[0]}.</h1>
        <p>Good to have you here.</p>
      </header>
      <div className="account-grid">
        <section className="account-card">
          <h2>Your details</h2>
          <p>
            {user.name}
            <br />
            {user.email}
            <br />
            {user.role === "CUSTOMER"
              ? "Customer account"
              : `${user.role.toLowerCase()} account`}
          </p>
          <button className="store-button secondary" onClick={logout}>
            Sign out
          </button>
        </section>
        <section className="account-card">
          <h2>{user.role === "CUSTOMER" ? "Your orders" : "Your workspace"}</h2>
          <p>
            {user.role === "CUSTOMER"
              ? "See what you picked, review delivery details or cancel an order before it ships."
              : "Manage your products, orders and store activity."}
          </p>
          <ArrowLink
            to={
              user.role === "CUSTOMER"
                ? "/orders"
                : user.role === "ADMIN"
                  ? "/admin"
                  : "/vendor"
            }
          >
            {user.role === "CUSTOMER" ? "View your orders" : "Open dashboard"}
          </ArrowLink>
        </section>
        <section className="account-card">
          <h2>Saved items</h2>
          <p>
            Keep products you like in one place, and move them to your bag when
            you’re ready.
          </p>
          <ArrowLink to="/saved">View saved items</ArrowLink>
        </section>
        <section className="account-card">
          <h2>Saved addresses</h2>
          <p>
            Keep your delivery details ready. Add an address and choose a
            default for your next order.
          </p>
          <ArrowLink to="/addresses">Manage addresses</ArrowLink>
        </section>
        {user.role === "CUSTOMER" && (
          <section className="account-card">
            <p className="eyebrow">FOR THE MAKERS</p>
            <h2>Make good things?</h2>
            <p>
              Apply to join FORME as a seller. An administrator reviews each
              request before you can list products.
            </p>
            {applied || user.vendorRequest ? (
              <p role="status">
                Application received. Your request is waiting for review.
              </p>
            ) : (
              <button
                className="store-button secondary"
                onClick={apply}
                disabled={busy}
              >
                {busy ? "Sending…" : "Apply to sell"}
              </button>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
