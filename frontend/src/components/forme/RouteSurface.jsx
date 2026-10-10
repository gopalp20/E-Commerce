import { Suspense, useLayoutEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

// Keep navigation mounted while a lazy page loads. Animate only a new page's
// content, including content that arrives after its data request completes.
export function RouteSurface() {
  const { pathname, key } = useLocation();
  const [initialKey] = useState(key);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <Suspense
      fallback={
        <div className="route-loading" role="status" aria-label="Loading page">
          <span />
        </div>
      }
    >
      <div
        key={pathname}
        className={`route-surface${initialKey !== key ? " route-enter" : ""}`}
      >
        <Outlet />
      </div>
    </Suspense>
  );
}
