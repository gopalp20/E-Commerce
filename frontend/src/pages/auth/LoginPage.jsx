import { useState, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Field, PageState } from "../../components/forme/UI";
import { DemoAccounts } from "../../components/forme/DemoAccounts";
import { finishSignIn, signInDestination } from "../../lib/authNavigation";
export const LoginPage = () => {
  const { login, user, isLoading, sessionError } = useAuth(),
    toast = useToast(),
    location = useLocation(),
    navigate = useNavigate();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    submitting = useRef(false);
  const pending = location.state?.pendingAdd;
  const bagEntry = ["/cart", "/checkout"].includes(
    location.state?.from?.pathname,
  );
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const account = await login(email.trim(), password);
      const destination = await finishSignIn(
        account,
        pending,
        toast,
        location.state?.reviewReturn,
        location.state?.pendingSave,
      );
      navigate(destination, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  if (isLoading) return <PageState loading />;
  if (user && !busy)
    return (
      <Navigate
        to={signInDestination(user, location.state?.reviewReturn)}
        replace
      />
    );
  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <img src="/images/forme-studio.jpg" alt="A sunlit reading corner" />
        <div>
          <p className="eyebrow">MAKE YOURSELF AT HOME</p>
          <h2>
            A place for
            <br />
            your everyday.
          </h2>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <p className="eyebrow">WELCOME TO FORME</p>
          <h1>
            {location.state?.pendingSave
              ? "Keep it for later."
              : pending
                ? "Save it to your bag."
                : bagEntry
                  ? "Your bag starts here."
                  : "Good to see you."}
          </h1>
          <p>
            {location.state?.pendingSave
              ? "Sign in to save this product and find it on any device."
              : pending
                ? "Sign in or create an account. We’ll add your chosen item to your bag."
                : bagEntry
                  ? "Sign in to use your bag, save addresses and keep track of your orders."
                  : "Sign in to your shop, saved addresses and orders."}
          </p>
          {pending && (
            <div className="auth-pending-item">
              {pending.imageUrl && <img src={pending.imageUrl} alt="" />}
              <div>
                <strong>{pending.name}</strong>
                <span>Quantity {pending.quantity} · added after sign-in</span>
              </div>
            </div>
          )}
          <form onSubmit={submit}>
            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={busy}
            />
            {(error || sessionError) && (
              <p className="error-message" role="alert">
                {error || sessionError}
              </p>
            )}
            <button className="store-button full" disabled={busy}>
              {busy && <Loader2 className="spin" size={16} />}{" "}
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="auth-footer">
            New around here?{" "}
            <Link to="/register" state={location.state}>
              Create an account
            </Link>
          </div>
          <DemoAccounts
            onSelect={(nextEmail, nextPassword) => {
              setEmail(nextEmail);
              setPassword(nextPassword);
            }}
          />
        </div>
      </div>
    </div>
  );
};
