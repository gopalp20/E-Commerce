import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImageOff, Maximize2 } from "lucide-react";
import { GalleryViewer } from "./GalleryViewer";
import { productPhotos } from "../../lib/format";

export function ProductPhoto({ src, alt = "", ...props }) {
  return <Photo key={src} src={src} alt={alt} {...props} />;
}
function Photo({ src, alt, ...props }) {
  const [failed, setFailed] = useState(false);
  return !src || failed ? (
    <span
      className="photo-unavailable"
      role="img"
      aria-label={alt ? `${alt} — photo unavailable` : "Photo unavailable"}
    >
      <ImageOff size={24} aria-hidden="true" />
      <span>Photo unavailable</span>
    </span>
  ) : (
    <img {...props} src={src} alt={alt} onError={() => setFailed(true)} />
  );
}

export function ProductGallery({ product }) {
  const images = productPhotos(product);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const dialog = useRef(null),
    touch = useRef(null),
    swiped = useRef(false),
    thumbnails = useRef(null);
  const total = images.length,
    image = images[index];
  const select = (next) => {
    setIndex((next + total) % total);
  };
  useEffect(() => {
    const node = dialog.current;
    if (expanded && !node.open) node.showModal();
    else if (!expanded && node.open) node.close();
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);
  useEffect(() => {
    const strip = thumbnails.current,
      button = strip?.children[index];
    if (button)
      strip.scrollTo({
        left:
          button.offsetLeft -
          strip.offsetLeft -
          (strip.clientWidth - button.clientWidth) / 2,
        behavior: "instant",
      });
  }, [index]);
  const keyboard = (event) => {
    if (total < 2) return;
    const next = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: total - 1,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      select(next);
    }
  };
  const gestures = {
    onTouchStart: (event) => {
      swiped.current = false;
      if (event.touches.length === 1)
        touch.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
    },
    onTouchEnd: (event) => {
      if (!touch.current || total < 2) return;
      const dx = event.changedTouches[0].clientX - touch.current.x,
        dy = event.changedTouches[0].clientY - touch.current.y;
      touch.current = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        swiped.current = true;
        select(index + (dx < 0 ? 1 : -1));
      }
    },
    onTouchCancel: () => {
      touch.current = null;
    },
  };
  const controls = (prefix = "") =>
    total > 1 && (
      <div className="gallery-navigation">
        <button
          type="button"
          onClick={() => select(index - 1)}
          aria-label={`${prefix}Previous photo`}
        >
          <ArrowLeft size={19} />
        </button>
        <span aria-live="polite" aria-atomic="true">
          {index + 1} <span aria-hidden="true">/</span>
          <span className="sr-only">of</span> {total}
        </span>
        <button
          type="button"
          onClick={() => select(index + 1)}
          aria-label={`${prefix}Next photo`}
        >
          <ArrowRight size={19} />
        </button>
      </div>
    );
  return (
    <div
      className="product-gallery"
      role="region"
      aria-label={`${product.name} photos`}
      aria-roledescription={total > 1 ? "carousel" : undefined}
      onKeyDown={keyboard}
    >
      <div className="product-gallery-main" {...gestures}>
        <button
          type="button"
          className="gallery-open"
          disabled={!image}
          onClick={(event) => {
            if (swiped.current && event.detail !== 0) {
              swiped.current = false;
              return;
            }
            setHasOpened(true);
            setExpanded(true);
          }}
          aria-label={`Enlarge photo ${index + 1} of ${product.name}`}
        >
          <ProductPhoto
            src={image?.url}
            alt={image?.alt || `${product.name}, view ${index + 1}`}
            width="1000"
            height="1100"
          />
          {image && (
            <span className="gallery-enlarge">
              <Maximize2 size={17} />
              <span>View larger</span>
            </span>
          )}
        </button>
        {controls()}
      </div>
      {total > 1 && (
        <div
          className="product-thumbnails"
          ref={thumbnails}
          aria-label="Choose a product photo"
        >
          {images.map((photo, i) => (
            <button
              key={photo.url}
              type="button"
              className={index === i ? "selected" : ""}
              aria-pressed={index === i}
              aria-label={`View photo ${i + 1} of ${product.name}`}
              onClick={() => select(i)}
            >
              <ProductPhoto
                src={photo.url}
                alt=""
                loading="lazy"
                width="100"
                height="100"
              />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-label={`${product.name} enlarged photos`}
        onCancel={(event) => {
          event.preventDefault();
          setExpanded(false);
        }}
      >
        {hasOpened && (
          <GalleryViewer
            open={expanded}
            images={images}
            index={index}
            onSelect={select}
            name={product.name}
            onClose={() => setExpanded(false)}
          />
        )}
      </dialog>
    </div>
  );
}
