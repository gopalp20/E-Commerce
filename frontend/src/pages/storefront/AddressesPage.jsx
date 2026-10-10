import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, Check, ArrowLeft } from "lucide-react";
import { addressesApi } from "../../api/addresses";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Drawer, PageState } from "../../components/forme/UI";
import {
  AddressFields,
  AddressText,
  emptyAddress,
} from "../../components/forme/AddressFields";
export const AddressesPage = () => {
  const { user } = useAuth(),
    toast = useToast();
  const [addresses, setAddresses] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(null),
    [deleting, setDeleting] = useState(null),
    [form, setForm] = useState(emptyAddress),
    [busy, setBusy] = useState(false),
    [formError, setFormError] = useState("");
  const load = useCallback(async () => {
    try {
      const data = await addressesApi.list();
      setAddresses(data.addresses);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const edit = (address) => {
    setForm(address ? { ...address } : { ...emptyAddress, name: user.name });
    setFormError("");
    setEditing(address || { new: true });
  };
  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFormError("");
    try {
      if (editing.id) await addressesApi.update(editing.id, form);
      else await addressesApi.create(form);
      setEditing(null);
      toast.success("Ready to use at checkout.", "Address saved");
      await load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setFormError("");
    try {
      await addressesApi.remove(deleting.id);
      setDeleting(null);
      toast.success(
        "Your past orders keep their original delivery details.",
        "Address removed",
      );
      await load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const makeDefault = async (address) => {
    setBusy(true);
    try {
      await addressesApi.makeDefault(address.id);
      await load();
      toast.success(
        `${address.label} will be selected at checkout.`,
        "Default address updated",
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="wrap address-page">
      <div className="breadcrumbs">
        <Link to="/shop">Your shop</Link>
        <span>/</span>
        <Link to="/profile">Account</Link>
        <span>/</span>
        <span>Addresses</span>
      </div>
      <header className="account-page-heading">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h1>Saved addresses.</h1>
          <p>Save the details once. Choose where it goes next time.</p>
        </div>
        <button className="store-button" onClick={() => edit(null)}>
          <Plus size={17} />
          Add an address
        </button>
      </header>
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="We couldn't load your addresses."
          description={error}
          retry={load}
        />
      ) : addresses.length ? (
        <div className="address-grid">
          {addresses.map((address) => (
            <article
              className={`address-card ${address.isDefault ? "default-address" : ""}`}
              key={address.id}
            >
              <header>
                <span>
                  <MapPin size={16} />
                  {address.label}
                </span>
                {address.isDefault && (
                  <small>
                    <Check size={12} />
                    Default
                  </small>
                )}
              </header>
              <AddressText address={address} />
              <div className="address-actions">
                <button
                  className="text-button"
                  onClick={() => edit(address)}
                  disabled={busy}
                  aria-label={`Edit ${address.label} address`}
                >
                  Edit
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setDeleting(address);
                    setFormError("");
                  }}
                  disabled={busy}
                  aria-label={`Remove ${address.label} address`}
                >
                  Remove
                </button>
                {!address.isDefault && (
                  <button
                    className="text-button"
                    onClick={() => makeDefault(address)}
                    disabled={busy}
                    aria-label={`Make ${address.label} the default address`}
                  >
                    Make default
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="address-empty">
          <span>
            <MapPin size={28} strokeWidth={1.4} />
          </span>
          <h2>A place for your deliveries.</h2>
          <p>Add a home or work address to make your next checkout quicker.</p>
          <button className="store-button secondary" onClick={() => edit(null)}>
            Add your first address
            <Plus size={16} />
          </button>
        </div>
      )}
      <Link to="/profile" className="arrow-link">
        <ArrowLeft size={16} />
        Back to your account
      </Link>
      <Drawer
        title={editing?.id ? "Edit address" : "Add an address"}
        open={!!editing}
        onClose={() => {
          if (!busy) setEditing(null);
        }}
        className="address-dialog"
      >
        <form onSubmit={save}>
          <fieldset disabled={busy}>
            <AddressFields
              value={form}
              onChange={setForm}
              includeLabel
              prefix="address"
            />
            <label className="forme-checkbox">
              <input
                type="checkbox"
                checked={form.isDefault}
                disabled={editing?.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
              />
              <span>
                {editing?.isDefault
                  ? "Your current default address"
                  : "Use as my default address"}
              </span>
            </label>
          </fieldset>
          {formError && (
            <p className="error-message" role="alert">
              {formError}
            </p>
          )}
          <div className="confirmation-actions">
            <button
              type="button"
              className="store-button secondary"
              onClick={() => setEditing(null)}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="store-button" disabled={busy}>
              {busy ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      </Drawer>
      <Drawer
        title="Remove this address?"
        open={!!deleting}
        onClose={() => {
          if (!busy) setDeleting(null);
        }}
      >
        {deleting && <AddressText address={deleting} />}
        <p className="field-help">
          This removes it from your address book. Existing orders keep their
          delivery details.
        </p>
        {formError && (
          <p className="error-message" role="alert">
            {formError}
          </p>
        )}
        <div className="confirmation-actions">
          <button
            className="store-button secondary"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Keep address
          </button>
          <button className="store-button" disabled={busy} onClick={remove}>
            {busy ? "Removing…" : "Remove address"}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
