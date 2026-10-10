const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const imageOrder = [{ position: "asc" }, { id: "asc" }];

// First image is the cover everywhere, including old imageUrl consumers.
function galleryFromInput({ images, imageUrl }, current) {
  if (images === undefined && imageUrl === undefined && current)
    return undefined;
  const gallery = (images ?? current?.images ?? []).map((image) =>
    typeof image === "string"
      ? { url: image, alt: "" }
      : { url: image.url, alt: image.alt || "" },
  );
  if (images === undefined && imageUrl) {
    const cover = gallery.find((image) => image.url === imageUrl) || {
      url: imageUrl,
      alt: "",
    };
    return [cover, ...gallery.filter((image) => image.url !== imageUrl)];
  }
  if (
    !gallery.length &&
    images === undefined &&
    current?.imageUrl &&
    imageUrl === undefined
  )
    return [{ url: current.imageUrl, alt: "" }];
  return gallery;
}

async function validateGallery(images, ownerIds) {
  if (images.length > 10)
    throw new AppError("A product can have up to 10 photos.", 400);
  if (new Set(images.map((image) => image.url)).size !== images.length)
    throw new AppError("Each product photo must be different.", 400);
  const urls = images.map((image) => image.url);
  if (!urls.length) return;
  const assets = await prisma.mediaAsset.findMany({
    where: {
      OR: [{ url: { in: urls } }, { cloudinaryUrl: { in: urls } }],
    },
    select: { url: true, cloudinaryUrl: true, ownerId: true },
  });
  for (const url of urls) {
    const asset = assets.find(
      (asset) => asset.url === url || asset.cloudinaryUrl === url,
    );
    // The stable app URL and its CDN URL share the same ownership boundary.
    // Do not allow transformed or invented CDN links to bypass this check.
    let managedCloudImage = false;
    try {
      const parsed = new URL(url);
      managedCloudImage =
        parsed.hostname === "res.cloudinary.com" &&
        decodeURIComponent(parsed.pathname).includes("/forme/products/");
    } catch {
      /* Local image reference. */
    }
    if (
      (asset && !ownerIds.includes(asset.ownerId)) ||
      (!asset && (url.startsWith("/api/media/images/") || managedCloudImage))
    )
      throw new AppError("Use photos uploaded by your own store.", 403);
  }
}

module.exports = { galleryFromInput, validateGallery, imageOrder };
