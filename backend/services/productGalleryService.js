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
  const uploads = images.filter((image) =>
    image.url.startsWith("/api/media/images/"),
  );
  if (!uploads.length) return;
  const count = await prisma.mediaAsset.count({
    where: {
      url: { in: uploads.map((image) => image.url) },
      ownerId: { in: ownerIds },
    },
  });
  if (count !== uploads.length)
    throw new AppError("Use photos uploaded by your own store.", 403);
}

module.exports = { galleryFromInput, validateGallery, imageOrder };
