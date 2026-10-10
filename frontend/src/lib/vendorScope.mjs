// Vendor totals use purchased prices, and never attribute another vendor's
// items or an order-level delivery charge to the selected seller.
export const vendorItemTotal = (order, vendorId) =>
  order.items.reduce(
    (sum, item) =>
      !vendorId || String(item.product?.vendorId) === String(vendorId)
        ? sum + Math.round(Number(item.price) * 100) * item.quantity
        : sum,
    0,
  ) / 100;
