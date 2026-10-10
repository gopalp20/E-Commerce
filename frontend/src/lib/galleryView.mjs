export const limitZoom = (scale) => Math.max(1, Math.min(4, scale));
export function constrainView(view, image, stage) {
  const scale = limitZoom(view.scale);
  const maxX = Math.max(0, (image.width * scale - stage.width) / 2);
  const maxY = Math.max(0, (image.height * scale - stage.height) / 2);
  return {
    scale,
    x: Math.max(-maxX, Math.min(maxX, view.x)),
    y: Math.max(-maxY, Math.min(maxY, view.y)),
  };
}
// Preserve the image detail beneath the pointer as the zoom level changes.
export function zoomAt(view, scale, point, image, stage) {
  const next = limitZoom(scale),
    ratio = next / view.scale;
  return constrainView(
    {
      scale: next,
      x: point.x - (point.x - view.x) * ratio,
      y: point.y - (point.y - view.y) * ratio,
    },
    image,
    stage,
  );
}
