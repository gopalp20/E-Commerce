const resolveProductStatus = ({ currentStatus, stock, requestedStatus }) => {
  const visibility = requestedStatus || currentStatus;
  if (visibility === "DRAFT" || visibility === "ARCHIVED")
    return requestedStatus;
  if (stock === 0) return "OUT_OF_STOCK";

  // Restoring stock makes an out-of-stock listing purchasable again. Archived
  // products remain archived until a vendor or administrator explicitly restores them.
  if (stock > 0 && currentStatus === "OUT_OF_STOCK" && !requestedStatus) {
    return "ACTIVE";
  }

  if (requestedStatus === "ACTIVE" && stock !== undefined && stock < 1) {
    return "OUT_OF_STOCK";
  }

  return requestedStatus;
};

module.exports = { resolveProductStatus };
