import { money, shippingCost } from "../../lib/format";
export function OrderSummary({
  subtotal,
  deliveryMethod = "STANDARD",
  children,
  before,
  note,
}) {
  const shipping = shippingCost(subtotal, deliveryMethod);
  return (
    <aside className="order-summary">
      <h2>Order summary</h2>
      {before}
      {subtotal < 2500 && deliveryMethod === "STANDARD" && (
        <div className="delivery-progress">
          You're {money(2500 - subtotal)} away from free delivery.
          <div className="delivery-progress-bar">
            <span style={{ width: `${(subtotal / 2500) * 100}%` }} />
          </div>
        </div>
      )}
      <div className="summary-line">
        <span>Subtotal</span>
        <span>{money(subtotal)}</span>
      </div>
      <div className="summary-line">
        <span>
          {deliveryMethod === "EXPRESS"
            ? "Express delivery"
            : "Standard delivery"}
        </span>
        <span>{shipping ? money(shipping) : "On us"}</span>
      </div>
      <div className="summary-line total">
        <span>Total</span>
        <span>{money(subtotal + shipping)}</span>
      </div>
      {children}
      <p className="order-summary-note">
        {note || "Delivery within India. Pay on delivery."}
      </p>
    </aside>
  );
}
