import { useState, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { finishSignIn, signInDestination } from "../../lib/authNavigation";
import { Field, PageState } from "../../components/forme/UI";
export const RegisterPage = () => {
  const { register, user, isLoading } = useAuth();
  const toast = useToast();
  const submitting = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = location.state?.pendingAdd;
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    setBusy(true);
    try {
      const account = await register(form);
      navigate(
        await finishSignIn(
          account,
          pending,
          toast,
          location.state?.reviewReturn,
          location.state?.pendingSave,
        ),
        { replace: true },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      submitting.current = false;
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
        <img src="/images/forme-living.jpg" alt="A warm reading corner" />
        <div>
          <p className="eyebrow">A FEW GOOD THINGS AWAIT</p>
          <h2>
            Here's to
            <br />
            the everyday.
          </h2>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <p className="eyebrow">YOUR LITTLE CORNER OF FORME</p>
          <h1>Make yourself at home.</h1>
          <p>
            Save addresses, keep track of orders, and find your next everyday
            favourite.
          </p>
          {location.state?.pendingSave && (
            <p className="auth-pending-note">
              {location.state.pendingSave.name} will be saved after you create
              your account.
            </p>
          )}
          {pending && (
            <p className="auth-pending-note">
              {pending.name} will be added to your bag after registration.
            </p>
          )}
          <form onSubmit={submit}>
            <Field
              label="Full name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              maxLength={100}
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              maxLength={128}
            />
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <button className="store-button full" disabled={busy}>
              {busy ? <Loader2 className="spin" size={16} /> : null}
              {busy ? "Creating your account…" : "Create account"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="checkout-terms">
            Your information is used to manage your account and orders.{" "}
            <Link to="/privacy">Read our privacy note.</Link>
          </p>
          <div className="auth-footer">
            Already at home here?{" "}
            <Link to="/login" state={location.state}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
