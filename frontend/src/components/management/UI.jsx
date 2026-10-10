import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  X,
  Package,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Drawer } from "../forme/UI";
import { titleCase } from "../../lib/format";
export function useResource(loader) {
  const [state, setState] = useState({ data: null, loading: true, error: "" }),
    [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    setState((previous) => ({
      ...previous,
      loading: !previous.data,
      error: "",
    }));
    loader()
      .then((data) => {
        if (active) setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (active)
          setState((s) => ({
            ...s,
            loading: false,
            error: error.message || "Please try again.",
          }));
      });
    return () => {
      active = false;
    };
  }, [loader, version]);
  return { ...state, reload };
}
export function WorkState({ loading, error, retry }) {
  if (error)
    return (
      <div className="work-state" role="alert">
        <p className="eyebrow">LET’S TRY THAT AGAIN</p>
        <h2>We couldn’t load this page.</h2>
        <p>{error}</p>
        <button className="work-button" onClick={retry}>
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  return loading ? (
    <div className="work-loading" role="status" aria-label="Loading workspace">
      <div />
      <div />
      <div />
      <span>Loading your workspace…</span>
    </div>
  ) : null;
}
export function PageHeading({ eyebrow, title, description, children }) {
  return (
    <header className="work-page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="work-description">{description}</p>}
      </div>
      {children && <div className="work-page-actions">{children}</div>}
    </header>
  );
}
export function MetricStrip({ items }) {
  return (
    <dl className="work-metrics">
      {items.map(({ label, value, note, to }) => (
        <div key={label}>
          <dt>
            {label}
            {to && (
              <Link to={to} aria-label={`View ${label.toLowerCase()}`}>
                <ArrowRight size={15} />
              </Link>
            )}
          </dt>
          <dd>{value}</dd>
          {note && <p>{note}</p>}
        </div>
      ))}
    </dl>
  );
}
export function Status({ value }) {
  return (
    <span className={`work-status status-${String(value).toLowerCase()}`}>
      <i />
      {titleCase(value)}
    </span>
  );
}
export function WorkSearch({ value, onChange, placeholder = "Search", label }) {
  return (
    <div className="work-search">
      <Search size={17} />
      <input
        type="search"
        aria-label={label || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}
export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="work-tabs" role="group" aria-label="Filter records">
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={value === option.value}
          className={value === option.value ? "selected" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <span>{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
export function Empty({ title = "Nothing here yet.", description, children }) {
  return (
    <div className="work-empty">
      <span className="work-empty-rule" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
export function DataTable({ columns, rows, empty, caption = "Records" }) {
  return (
    <div
      className="work-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="work-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className={col.className || ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col, i) => (
                <td key={i} className={col.className || ""}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length &&
        (empty || (
          <Empty
            title="No matching records."
            description="Try another search or clear your filters."
          />
        ))}
    </div>
  );
}
export function usePage(rows, size = 8) {
  const [requestedPage, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const page = Math.min(requestedPage, totalPages);
  return {
    page,
    setPage,
    totalPages,
    total: rows.length,
    size,
    rows: rows.slice((page - 1) * size, page * size),
  };
}
export function Pagination({ page, setPage, totalPages, total, size }) {
  return (
    <div className="work-pagination">
      <span>
        {total
          ? `${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}`
          : "0 results"}
      </span>
      <div>
        <button
          className="icon-button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <ArrowLeft size={16} />
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="icon-button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
export function Thumbnail({ src, alt = "", className = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`work-thumbnail ${className}`}>
      {src && !failed ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <Package size={22} strokeWidth={1} />
      )}
    </span>
  );
}
export function Person({ name, email }) {
  return (
    <div className="work-person">
      <span className="work-avatar">{name?.[0] || "F"}</span>
      <div>
        <strong>{name || "Customer"}</strong>
        {email && <small>{email}</small>}
      </div>
    </div>
  );
}
export function Panel({
  title,
  description,
  children,
  action,
  className = "",
}) {
  return (
    <section className={`work-panel ${className}`}>
      <header>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
export function WorkDrawer({ open, onClose, title, children }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      className="management-drawer"
    >
      {open && children}
    </Drawer>
  );
}
export function Confirm({
  target,
  title,
  description,
  onClose,
  onConfirm,
  busy,
  label = "Confirm",
  danger = false,
  error,
}) {
  return (
    <WorkDrawer
      open={!!target}
      onClose={() => !busy && onClose()}
      title={title}
    >
      <div className="work-confirm">
        <p>{description}</p>
        {error && (
          <p className="work-error" role="alert">
            {error}
          </p>
        )}
        <div className="work-form-actions">
          <button
            className="work-button secondary"
            disabled={busy}
            onClick={onClose}
          >
            Keep it
          </button>
          <button
            className={`work-button ${danger ? "danger" : ""}`}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Saving…" : label}
          </button>
        </div>
      </div>
    </WorkDrawer>
  );
}
export function AddLink({ to, children }) {
  return (
    <Link to={to} className="work-button">
      <Plus size={17} />
      {children}
    </Link>
  );
}
