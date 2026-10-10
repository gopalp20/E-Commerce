import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Banknote, Loader2, Plus, MapPin } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ordersApi } from "../../api/orders";
import { addressesApi } from "../../api/addresses";
import { Field, PageState } from "../../components/forme/UI";
import {
  AddressFields,
  AddressText,
  emptyAddress,
  deliveryFields,
} from "../../components/forme/AddressFields";
import { OrderSummary } from "../../components/forme/OrderSummary";
import {
  money,
  productImage,
  shippingCost,
  orderNumber,
} from "../../lib/format";
export const CheckoutPage = () => {
  const {
    items,
    subtotal,
    isLoading: cartLoading,
    error: cartError,
    refreshCart,
  } = useCart();
  const { user } = useAuth(),
    toast = useToast(),
    navigate = useNavigate();
  const [address, setAddress] = useState({ ...emptyAddress, name: user.name }),
    [addresses, setAddresses] = useState([]),
    [addressLoading, setAddressLoading] = useState(true),
    [addressError, setAddressError] = useState(""),
    [selected, setSelected] = useState("new"),
    [saveAddress, setSaveAddress] = useState(false),
    [delivery, setDelivery] = useState("STANDARD"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useRef(crypto.randomUUID()),
    pending = useRef(null),
    submitting = useRef(false);
  useEffect(() => {
    let active = true;
    addressesApi
      .list()
      .then((data) => {
        if (active) {
          setAddresses(data.addresses);
          const preferred =
            data.addresses.find((a) => a.isDefault) || data.addresses[0];
          setSelected(preferred ? String(preferred.id) : "new");
        }
      })
      .catch(() => {
        if (active)
          setAddressError(
            "Your address book could not load. You can still enter a delivery address below.",
          );
      })
      .finally(() => {
        if (active) setAddressLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || addressLoading) return;
    submitting.current = true;
    setError("");
    setBusy(true);
    const input = {
      checkoutKey: key.current,
      expectedTotal: Number(
        (subtotal + shippingCost(subtotal, delivery)).toFixed(2),
      ),
      deliveryMethod: delivery,
      ...(selected === "new"
        ? {
            shippingAddress: deliveryFields(address),
            saveAddress,
            addressLabel: address.label,
            defaultAddress: address.isDefault,
          }
        : { addressId: Number(selected) }),
    };
    const signature = JSON.stringify({ ...input, checkoutKey: undefined });
    if (pending.current && pending.current !== signature) {
      input.checkoutKey = crypto.randomUUID();
      key.current = input.checkoutKey;
    }
    pending.current = signature;
    try {
      const response = await ordersApi.createOrder(input);
      toast.success(
        `${orderNumber(response.order.id)} is ready to review in your orders.`,
        "Order placed",
      );
      navigate(`/orders/${response.order.id}`, {
        replace: true,
        state: { justPlaced: true },
      });
      refreshCart().catch(() => {});
    } catch (e) {
      setError(e.message || "We could not place your order. Please try again.");
      if (e.response?.status && e.response.status < 500) {
        key.current = crypto.randomUUID();
        pending.current = null;
        await refreshCart().catch(() => {});
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  if (cartLoading) return <PageState loading />;
  if (cartError)
    return (
      <PageState
        title="Your bag needs a moment."
        description={cartError}
        retry={() => window.location.reload()}
      />
    );
  if (!items.length)
    return (
      <PageState
        title="Your bag is empty."
        description="Choose something from your shop, then come back to checkout."
      >
        <Link className="store-button" to="/shop">
          Continue shopping
          <ArrowRight size={17} />
        </Link>
      </PageState>
    );
  return (
    <div className="wrap">
      <div className="breadcrumbs">
        <Link to="/shop">Your shop</Link>
        <span>/</span>
        <Link to="/cart">Bag</Link>
        <span>/</span>
        <span>Checkout</span>
      </div>
      <header className="page-heading">
        <p className="eyebrow">THE LAST LITTLE DETAILS</p>
        <h1>Almost yours, {user.name.split(" ")[0]}.</h1>
        <p>Choose a delivery address and review your order.</p>
      </header>
      <form className="checkout-layout" onSubmit={submit}>
        <div>
          <section className="checkout-section">
            <div className="checkout-section-title">
              <h2>
                <span className="step-number">01</span>Delivery address
              </h2>
              <Link to="/addresses" className="text-button">
                Manage addresses
              </Link>
            </div>
            {addressLoading ? (
              <p className="field-help" role="status">
                Loading saved addresses…
              </p>
            ) : (
              <fieldset className="address-fieldset" disabled={busy}>
                {addressError && (
                  <p className="inline-error" role="status">
                    {addressError}
                  </p>
                )}
                {addresses.length > 0 && (
                  <div className="checkout-addresses">
                    {addresses.map((saved) => (
                      <label
                        className={`checkout-address-option ${selected === String(saved.id) ? "selected" : ""}`}
                        key={saved.id}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          value={saved.id}
                          checked={selected === String(saved.id)}
                          onChange={() => {
                            setSelected(String(saved.id));
                            setError("");
                          }}
                        />
                        <div>
                          <header>
                            <span>
                              <MapPin size={15} />
                              {saved.label}
                            </span>
                            {saved.isDefault && <small>Default</small>}
                          </header>
                          <AddressText address={saved} />
                        </div>
                      </label>
                    ))}
                    <label className="checkout-new-address">
                      <input
                        type="radio"
                        name="savedAddress"
                        value="new"
                        checked={selected === "new"}
                        onChange={() => {
                          setSelected("new");
                          setError("");
                        }}
                      />
                      <Plus size={16} />
                      <span>Use a new address</span>
                    </label>
                  </div>
                )}
                {selected === "new" && (
                  <div className="new-delivery-address">
                    <AddressFields value={address} onChange={setAddress} />
                    <label className="forme-checkbox">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                      />
                      <span>Save this address for next time</span>
                    </label>
                    {saveAddress && (
                      <div className="save-address-options">
                        <Field
                          label="Save as"
                          name="addressLabel"
                          value={address.label}
                          onChange={(e) =>
                            setAddress({ ...address, label: e.target.value })
                          }
                          required
                          maxLength={40}
                          placeholder="Home or Work"
                        />
                        {addresses.length > 0 && (
                          <label className="forme-checkbox">
                            <input
                              type="checkbox"
                              checked={address.isDefault}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  isDefault: e.target.checked,
                                })
                              }
                            />
                            <span>Make this my default address</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>
            )}
          </section>
          <section className="checkout-section">
            <h2>
              <span className="step-number">02</span>Choose your delivery
            </h2>
            {[
              ["STANDARD", "Standard delivery", "Estimated 5–7 business days"],
              ["EXPRESS", "Express delivery", "Estimated 2–3 business days"],
            ].map(([value, label, caption]) => (
              <label className="shipping-option" key={value}>
                <input
                  type="radio"
                  name="delivery"
                  value={value}
                  checked={delivery === value}
                  disabled={busy}
                  onChange={() => setDelivery(value)}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{caption}</small>
                </span>
                <span className="option-price">
                  {shippingCost(subtotal, value)
                    ? money(shippingCost(subtotal, value))
                    : "Free"}
                </span>
              </label>
            ))}
            <p className="checkout-terms">
              Delivery estimates are part of this demo. No physical shipment
              will be sent.
            </p>
          </section>
          <section className="checkout-section">
            <h2>
              <span className="step-number">03</span>Payment
            </h2>
            <div className="payment-choice">
              <Banknote size={28} strokeWidth={1.4} />
              <div>
                <strong>Pay on delivery</strong>
                <p>
                  Your order is saved with payment due on delivery. No online
                  payment required.
                </p>
              </div>
            </div>
            <p className="checkout-terms">
              This is a college demo store. No money will be collected.{" "}
              <Link to="/delivery">Delivery and cancellation details</Link>.
            </p>
          </section>
        </div>
        <OrderSummary
          subtotal={subtotal}
          deliveryMethod={delivery}
          note="Your order and delivery details will be saved in your account."
          before={
            <div className="summary-items">
              {items.map((item) => (
                <div className="checkout-mini-item" key={item.id}>
                  <img src={productImage(item.product)} alt="" />
                  <div>
                    <strong>{item.product.name}</strong>
                    <p>Qty {item.quantity}</p>
                  </div>
                  <span>
                    {money(Number(item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          }
        >
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button
            className="store-button full"
            type="submit"
            disabled={busy || addressLoading}
          >
            {busy && <Loader2 className="spin" size={16} />}{" "}
            {busy ? "Placing your order…" : "Place order"}
            <ArrowRight size={17} />
          </button>
          <Link to="/cart" className="checkout-back-link">
            Back to your bag
          </Link>
        </OrderSummary>
      </form>
    </div>
  );
};
