import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { productsApi } from "../../api/products";
import { ProductPhoto } from "../forme/ProductGallery";
import { Field } from "../forme/UI";

export function ProductPhotosEditor({ images, onChange, onBusyChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false),
    [progress, setProgress] = useState("");
  const [error, setError] = useState(""),
    [link, setLink] = useState("");
  const change = (next) => {
    onChange(next);
    setError("");
  };
  const upload = async (files) => {
    if (busy || !files.length) return;
    const selected = Array.from(files);
    if (selected.length + images.length > 10) {
      setError("You can add up to 10 photos. Remove a photo to make room.");
      return;
    }
    if (
      selected.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 8 * 1024 * 1024,
      )
    ) {
      setError("Choose JPG, PNG or WebP photos, up to 8 MB each.");
      return;
    }
    setBusy(true);
    onBusyChange(true);
    setError("");
    const next = [...images],
      failures = [];
    for (const [i, file] of selected.entries()) {
      setProgress(`Uploading photo ${i + 1} of ${selected.length}…`);
      try {
        const result = await productsApi.uploadImage(file);
        next.push({ url: result.image.url, alt: "" });
      } catch (e) {
        failures.push(`${file.name}: ${e.message}`);
      }
    }
    onChange(next);
    setError(failures.join(" "));
    setProgress("");
    setBusy(false);
    onBusyChange(false);
    if (input.current) input.current.value = "";
  };
  const addLink = () => {
    const url = link.trim();
    if (!/^https?:\/\//.test(url) && !/^\/images\/[a-zA-Z0-9._-]+$/.test(url)) {
      setError("Paste a full HTTP or HTTPS image link.");
      return;
    }
    try {
      if (!url.startsWith("/images/")) new URL(url);
    } catch {
      setError("Enter a valid image link.");
      return;
    }
    if (images.some((image) => image.url === url)) {
      setError("This photo is already in your gallery.");
      return;
    }
    change([...images, { url, alt: "" }]);
    setLink("");
  };
  const move = (from, to) => {
    const next = [...images],
      [image] = next.splice(from, 1);
    next.splice(to, 0, image);
    change(next);
  };
  return (
    <div className="work-photos-editor" aria-busy={busy}>
      <div className="work-section-intro">
        <p>
          The first photo is your cover. Add other angles, close-ups and a sense
          of scale.
        </p>
        <span>{images.length}/10</span>
      </div>
      <div
        className={`work-photo-drop ${busy ? "is-busy" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          upload(event.dataTransfer.files);
        }}
      >
        <Upload size={23} aria-hidden="true" />
        <div>
          <strong>{busy ? progress : "Bring your product into focus"}</strong>
          <p>
            Drop photos here, or choose files. JPG, PNG or WebP · 8 MB each.
          </p>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Upload product photos"
          onChange={(event) => upload(event.target.files)}
        />
        <button
          type="button"
          className="work-button secondary"
          disabled={busy || images.length >= 10}
          onClick={() => input.current.click()}
        >
          <ImagePlus size={17} />
          Choose photos
        </button>
      </div>
      <p className="sr-only" role="status">
        {busy ? progress : `${images.length} photos in gallery`}
      </p>
      <fieldset disabled={busy} className="work-photo-fields">
        <ol className="work-photo-list">
          {images.map((image, index) => (
            <li key={image.url}>
              <div className="work-photo-preview">
                <ProductPhoto
                  src={image.url}
                  alt={image.alt || `Product photo ${index + 1}`}
                />
                <span>
                  {index === 0 ? "Cover" : String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="work-photo-information">
                <Field
                  id={`photo-alt-${index}`}
                  label={`Photo ${index + 1} description`}
                  maxLength={200}
                  placeholder="e.g. Side view showing the oak frame"
                  value={image.alt}
                  onChange={(event) =>
                    change(
                      images.map((item, i) =>
                        i === index
                          ? { ...item, alt: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <div className="work-photo-actions">
                  <button
                    type="button"
                    className="work-photo-cover"
                    disabled={index === 0}
                    onClick={() => move(index, 0)}
                  >
                    <Star size={14} />
                    {index === 0 ? "Cover photo" : "Make cover"}
                  </button>
                  <div>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      aria-label={`Move photo ${index + 1} earlier`}
                    >
                      <ArrowUp size={17} />
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => move(index, index + 1)}
                      aria-label={`Move photo ${index + 1} later`}
                    >
                      <ArrowDown size={17} />
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() =>
                        change(images.filter((_, i) => i !== index))
                      }
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <details className="work-photo-link">
          <summary>Or add a photo by link</summary>
          <div>
            <Field
              id="product-image-link"
              label="Image link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://…"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (link.trim() && images.length < 10) addLink();
                }
              }}
            />
            <button
              className="work-button secondary"
              type="button"
              disabled={!link.trim() || images.length >= 10}
              onClick={addLink}
            >
              <Plus size={16} />
              Add photo
            </button>
          </div>
        </details>
      </fieldset>
      {error && (
        <p className="work-error" role="alert">
          {error}
        </p>
      )}
      <p className="work-form-help">
        Describe what each view shows for customers using screen readers.
        Gallery changes are saved with the product.
      </p>
    </div>
  );
}
