const { v2: cloudinary } = require("cloudinary");
const AppError = require("../utils/AppError");

function storageError(message, statusCode) {
  const error = new AppError(message, statusCode);
  // Only these fixed, credential-free messages may be returned for 5xx errors.
  error.expose = true;
  return error;
}

function cloudinaryConfig(env = process.env) {
  const values = [
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
  ];
  if (
    values.some(
      (value) => !value?.trim() || /^(your_|replace_)/i.test(value),
    ) ||
    !/^[a-z0-9_-]+$/i.test(values[0])
  )
    throw storageError(
      "Photo uploads are not configured yet. Ask the store administrator to connect Cloudinary.",
      503,
    );
  return {
    cloud_name: values[0],
    api_key: values[1],
    api_secret: values[2],
    secure: true,
  };
}

function isCloudinaryImageUrl(value, cloudName) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/");
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      !url.username &&
      !url.password &&
      !url.port &&
      /^[a-z0-9_-]+$/i.test(parts[1]) &&
      (!cloudName || parts[1] === cloudName) &&
      parts[2] === "image" &&
      parts[3] === "upload" &&
      parts.length > 4
    );
  } catch {
    return false;
  }
}

async function uploadProductImage(data, { id, ownerId }) {
  const config = cloudinaryConfig();
  const publicId = `forme/products/${ownerId}/${id}`;
  let result;
  try {
    result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          ...config,
          resource_type: "image",
          type: "upload",
          public_id: publicId,
          overwrite: false,
          format: "webp",
          timeout: 20000,
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.once("error", reject);
      stream.end(data);
    });
  } catch {
    // Provider errors may include request details. Do not expose or log them.
    throw storageError(
      "Photo upload failed. Please try again in a moment.",
      502,
    );
  }
  if (
    result?.public_id !== publicId ||
    !isCloudinaryImageUrl(result?.secure_url, config.cloud_name)
  ) {
    await removeProductImage(publicId);
    throw storageError(
      "Photo upload could not be completed. Please try again.",
      502,
    );
  }
  return { cloudinaryPublicId: publicId, cloudinaryUrl: result.secure_url };
}

async function removeProductImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      ...cloudinaryConfig(),
      resource_type: "image",
      type: "upload",
      invalidate: true,
      timeout: 10000,
    });
    if (!["ok", "not found"].includes(result?.result)) throw new Error();
  } catch {
    // Retain the generated identifier for manual cleanup, never SDK errors/keys.
    console.error(`Cloudinary cleanup needs a retry for ${publicId}.`);
    return false;
  }
  return true;
}

module.exports = {
  cloudinaryConfig,
  isCloudinaryImageUrl,
  uploadProductImage,
  removeProductImage,
};
