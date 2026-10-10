import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImageOff,
  Minus,
  Plus,
  Scan,
  X,
} from "lucide-react";
import { constrainView, zoomAt } from "../../lib/galleryView.mjs";
import "./gallery-viewer.css";

const fitView = { scale: 1, x: 0, y: 0 };
export function GalleryViewer({
  open,
  images,
  index,
  onSelect,
  name,
  onClose,
}) {
  const stageRef = useRef(null),
    pointers = useRef(new Map()),
    gesture = useRef(null),
    moved = useRef(false),
    previousTap = useRef(0),
    inputType = useRef("mouse"),
    thumbnailStrip = useRef(null);
  const [stage, setStage] = useState({ width: 0, height: 0 }),
    [natural, setNatural] = useState({ width: 1, height: 1 }),
    [view, setView] = useState(fitView),
    [dragging, setDragging] = useState(false),
    [failed, setFailed] = useState(false);
  const photo = images[index];
  const [source, setSource] = useState(photo?.url),
    [loadedSource, setLoadedSource] = useState(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setView(fitView);
  }
  if (source !== photo?.url) {
    setSource(photo?.url);
    setView(fitView);
    setFailed(false);
    setDragging(false);
    setLoadedSource(null);
  }
  useEffect(() => {
    pointers.current.clear();
    gesture.current = null;
  }, [source, open]);
  useEffect(() => {
    const strip = thumbnailStrip.current,
      button = strip?.children[index];
    if (button)
      strip.scrollTo({
        left:
          button.offsetLeft -
          strip.offsetLeft -
          (strip.clientWidth - button.clientWidth) / 2,
        behavior: "instant",
      });
  }, [index, open]);
  const ratio = Math.min(
    Math.max(1, stage.width - 32) / natural.width,
    Math.max(1, stage.height - 32) / natural.height,
  );
  const image = {
    width: natural.width * ratio,
    height: natural.height * ratio,
  };
  const clamp = useCallback(
    (next) =>
      constrainView(
        next,
        { width: natural.width * ratio, height: natural.height * ratio },
        stage,
      ),
    [natural, ratio, stage],
  );
  const zoom = useCallback(
    (scale, point = { x: 0, y: 0 }) =>
      setView((current) =>
        zoomAt(
          current,
          typeof scale === "function" ? scale(current.scale) : scale,
          point,
          { width: natural.width * ratio, height: natural.height * ratio },
          stage,
        ),
      ),
    [natural, ratio, stage],
  );
  useEffect(() => {
    const node = stageRef.current;
    const observer = new ResizeObserver(([entry]) =>
      setStage({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = stageRef.current;
    const wheel = (event) => {
      if (failed) return;
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.height : 1);
      zoom((scale) => scale * Math.exp(-delta * 0.002), {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      });
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, [zoom, failed, stage.height]);
  const point = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
  };
  const beginGesture = () => {
    const values = [...pointers.current.values()];
    if (values.length >= 2) {
      const [a, b] = values;
      gesture.current = {
        view,
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
      moved.current = true;
    } else if (values.length === 1)
      gesture.current = { view, start: values[0], last: values[0] };
  };
  const pointerDown = (event) => {
    if (failed || event.button !== 0) return;
    inputType.current = event.pointerType;
    stageRef.current.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, point(event));
    if (pointers.current.size === 1) moved.current = false;
    beginGesture();
    setDragging(true);
  };
  const pointerMove = (event) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, point(event));
    const values = [...pointers.current.values()],
      g = gesture.current;
    if (values.length >= 2 && g.distance) {
      const [a, b] = values,
        center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const next = zoomAt(
        g.view,
        (g.view.scale * Math.hypot(a.x - b.x, a.y - b.y)) / g.distance,
        g.center,
        image,
        stage,
      );
      setView(
        clamp({
          ...next,
          x: next.x + center.x - g.center.x,
          y: next.y + center.y - g.center.y,
        }),
      );
    } else if (g.start) {
      const current = values[0],
        dx = current.x - g.start.x,
        dy = current.y - g.start.y;
      g.last = current;
      if (Math.hypot(dx, dy) > 5) moved.current = true;
      if (g.view.scale > 1)
        setView(clamp({ ...g.view, x: g.view.x + dx, y: g.view.y + dy }));
    }
  };
  const pointerUp = (event) => {
    const g = gesture.current;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size) {
      beginGesture();
      return;
    }
    setDragging(false);
    gesture.current = null;
    if (event.type === "pointercancel") return;
    if (
      moved.current &&
      g?.start &&
      view.scale === 1 &&
      event.pointerType === "touch"
    ) {
      const dx = g.last.x - g.start.x,
        dy = g.last.y - g.start.y;
      if (
        Math.abs(dx) > 60 &&
        Math.abs(dx) > Math.abs(dy) * 1.5 &&
        images.length > 1
      )
        onSelect(index + (dx < 0 ? 1 : -1));
    } else if (!moved.current && event.pointerType === "touch") {
      const now = Date.now();
      if (now - previousTap.current < 300) {
        zoom(view.scale > 1 ? 1 : 2, point(event));
        previousTap.current = 0;
      } else previousTap.current = now;
    }
  };
  const shown = clamp(view);
  return (
    <div
      className="photo-viewer"
      onKeyDown={(event) => {
        if (["+", "="].includes(event.key)) {
          event.preventDefault();
          zoom((s) => s + 0.5);
        } else if (event.key === "-") {
          event.preventDefault();
          zoom((s) => s - 0.5);
        } else if (event.key === "0") {
          event.preventDefault();
          setView(fitView);
        } else if (
          event.shiftKey &&
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
            event.key,
          )
        ) {
          event.preventDefault();
          event.stopPropagation();
          setView((current) =>
            clamp({
              ...current,
              x:
                current.x +
                (event.key === "ArrowLeft"
                  ? 60
                  : event.key === "ArrowRight"
                    ? -60
                    : 0),
              y:
                current.y +
                (event.key === "ArrowUp"
                  ? 60
                  : event.key === "ArrowDown"
                    ? -60
                    : 0),
            }),
          );
        }
      }}
    >
      <header className="photo-viewer-header">
        <div>
          <strong>{name}</strong>
          <span>
            Photo {index + 1} of {images.length}
          </span>
        </div>
        <button
          type="button"
          className="photo-viewer-close"
          autoFocus
          aria-label="Close enlarged photos"
          onClick={onClose}
        >
          <span>Close</span>
          <X size={20} />
        </button>
      </header>
      <div className="photo-viewer-canvas">
        <div
          ref={stageRef}
          className={`photo-viewer-stage ${shown.scale > 1 ? "zoomed" : ""} ${dragging ? "dragging" : ""}`}
          role="region"
          tabIndex={0}
          aria-label="Product photo viewer"
          aria-describedby="photo-viewer-help"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          onDoubleClick={(event) => {
            if (!failed && inputType.current !== "touch")
              zoom(view.scale > 1 ? 1 : 2, point(event));
          }}
        >
          {!failed && loadedSource !== photo?.url && (
            <div className="photo-viewer-loading" role="status">
              <span className="forme-loader" />
              <span>Loading photo…</span>
            </div>
          )}
          {failed ? (
            <div className="photo-viewer-error">
              <ImageOff size={28} />
              <p>This photo couldn’t load.</p>
              <button className="text-button" onClick={() => setFailed(false)}>
                Try again
              </button>
            </div>
          ) : (
            <img
              src={photo?.url}
              alt={photo?.alt || `${name}, view ${index + 1}`}
              draggable={false}
              onError={() => setFailed(true)}
              onLoad={(event) => {
                setLoadedSource(photo?.url);
                setNatural({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                });
              }}
              style={{
                width: image.width,
                height: image.height,
                opacity: stage.width && loadedSource === photo?.url ? 1 : 0,
                transform: `translate(-50%, -50%) translate(${shown.x}px, ${shown.y}px) scale(${shown.scale})`,
              }}
            />
          )}
        </div>
        {images.length > 1 && (
          <>
            <button
              className="photo-viewer-arrow previous"
              aria-label="Enlarged view: Previous photo"
              onClick={() => onSelect(index - 1)}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              className="photo-viewer-arrow next"
              aria-label="Enlarged view: Next photo"
              onClick={() => onSelect(index + 1)}
            >
              <ArrowRight size={20} />
            </button>
          </>
        )}
      </div>
      <footer className="photo-viewer-footer">
        <div
          className="photo-viewer-tools"
          role="group"
          aria-label="Photo zoom controls"
        >
          <button
            aria-label="Zoom out"
            title="Zoom out (−)"
            disabled={shown.scale <= 1 || failed}
            onClick={() => zoom((s) => s - 0.5)}
          >
            <Minus size={18} />
          </button>
          <output aria-label="Zoom level">
            {Math.round(shown.scale * 100)}%
          </output>
          <button
            aria-label="Zoom in"
            title="Zoom in (+)"
            disabled={shown.scale >= 4 || failed}
            onClick={() => zoom((s) => s + 0.5)}
          >
            <Plus size={18} />
          </button>
          <span className="photo-tool-divider" />
          <button
            className="photo-fit"
            aria-label="Fit photo to view"
            title="Fit photo (0)"
            disabled={shown.scale === 1 || failed}
            onClick={() => setView(fitView)}
          >
            <Scan size={16} />
            <span>Fit</span>
          </button>
        </div>
        {images.length > 1 && (
          <div
            ref={thumbnailStrip}
            className="photo-viewer-thumbnails"
            aria-label="Enlarged photo selection"
          >
            {images.map((photo, i) => (
              <button
                key={photo.url}
                aria-label={`Enlarged view: Photo ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => onSelect(i)}
              >
                <img src={photo.url} alt="" draggable={false} />
              </button>
            ))}
          </div>
        )}
        <p id="photo-viewer-help">
          <span className="photo-desktop-help">
            Scroll to zoom · drag to move · ← → for photos · Esc to close
          </span>
          <span className="photo-touch-help">
            Pinch or double-tap to zoom · drag to move
          </span>
        </p>
      </footer>
    </div>
  );
}
