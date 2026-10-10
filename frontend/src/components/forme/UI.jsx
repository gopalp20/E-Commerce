import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  X,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom";
export function ArrowLink({ to, children, className = "" }) {
  return (
    <Link className={`arrow-link ${className}`} to={to}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export function Quantity({
  value,
  onChange,
  max = 99,
  disabled = false,
  name = "Quantity",
}) {
  return (
    <div className="quantity-control" role="group" aria-label={name}>
      <button
        type="button"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.min(value - 1, Math.max(1, max)))}
        aria-label={`Decrease ${name.toLowerCase()}`}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${name.toLowerCase()}`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function PageState({
  loading,
  title = "Something went wrong",
  description,
  retry,
  children,
}) {
  return (
    <div className="page-state" role={loading ? "status" : "region"}>
      {loading ? (
        <>
          <span className="forme-loader" />
          <p>Finding the good things…</p>
        </>
      ) : (
        <>
          <p className="eyebrow">FORME / A MOMENT</p>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
          {retry && (
            <button className="store-button" onClick={retry}>
              <RefreshCw size={16} />
              Try again
            </button>
          )}
          {children}
        </>
      )}
    </div>
  );
}
export function Field({ label, error, className = "", ...props }) {
  const id = props.id || props.name;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";
  const input = (
    <input
      {...props}
      type={isPassword && showPassword ? "text" : props.type}
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : props["aria-describedby"]}
    />
  );
  return (
    <div className={`store-field ${className}`}>
      <label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      {isPassword ? (
        <div className="password-input">
          {input}
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-controls={id}
            aria-pressed={showPassword}
            disabled={props.disabled}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      ) : (
        input
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function Drawer({ open, onClose, title, children, className = "" }) {
  const dialog = useRef(null);
  const [lastOpen, setLastOpen] = useState({ title, children });
  if (open && (lastOpen.title !== title || lastOpen.children !== children)) {
    setLastOpen({ title, children });
  }
  // Native dialog exit transitions retain the last open content; clearing a
  // form while closing should not flash an empty panel or its default title.
  const content = open ? { title, children } : lastOpen;
  useEffect(() => {
    const node = dialog.current;
    if (open && !node.open) node.showModal();
    else if (!open && node.open) node.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <dialog
      ref={dialog}
      aria-label={content.title}
      className={`store-dialog ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-body">
        <header>
          <h2>{content.title}</h2>
          <button
            className="icon-button"
            aria-label={`Close ${content.title.toLowerCase()}`}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </header>
        {content.children}
      </div>
    </dialog>
  );
}
