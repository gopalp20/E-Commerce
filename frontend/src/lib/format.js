export const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number(amount) % 1 ? 2 : 0,
  }).format(Number(amount) || 0);
export const shippingCost = (subtotal, method = "STANDARD") =>
  method === "EXPRESS" ? 299 : subtotal >= 2500 ? 0 : 149;
export const orderNumber = (id) => `FM-${String(id).padStart(5, "0")}`;
export const dateLabel = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export const productImage = (product) =>
  product?.imageUrl || product?.images?.[0]?.url || "/images/forme-studio.jpg";
export const productPhotos = (product) => {
  const photos = [...(product?.images || [])].sort(
    (a, b) => (a.position || 0) - (b.position || 0),
  );
  if (product?.imageUrl) {
    const existing = photos.find((photo) => photo.url === product.imageUrl);
    photos.unshift(existing || { url: product.imageUrl, alt: "" });
  }
  return photos
    .filter(
      (photo, index) =>
        photo.url &&
        photos.findIndex((other) => other.url === photo.url) === index,
    )
    .map(({ url, alt }) => ({ url, alt: alt || "" }));
};
export const titleCase = (text) =>
  text
    ? text[0].toUpperCase() + text.slice(1).toLowerCase().replaceAll("_", " ")
    : "";
