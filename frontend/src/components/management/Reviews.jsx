import { ratingOptions, reviewSortOptions } from "../../lib/reviewOptions";
import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { reviewsApi } from "../../api/reviews";
import { adminApi } from "../../api/admin";
import { useResource, PageHeading, WorkState, Empty } from "./UI";
import { VendorFilter } from "./VendorFilter";
import { FormeSelect } from "../forme/Select";
import { Drawer } from "../forme/UI";
import { ReviewRow, ReviewPagination } from "../forme/Reviews";
import { useToast } from "../../context/ToastContext";
export function Reviews({ role }) {
  const [params, setParams] = useSearchParams(),
    toast = useToast();
  const vendor = params.get("vendor") || "",
    rating = params.get("rating") || "",
    status = params.get("status") || "",
    sort = params.get("sort") || "newest",
    page = Math.max(1, Number(params.get("page")) || 1);
  const [selected, setSelected] = useState(null),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const loader = useCallback(async () => {
    const [data, directory] = await Promise.all([
      reviewsApi.workspace(role, {
        vendorId: role === "admin" ? vendor || undefined : undefined,
        rating: rating || undefined,
        status: status || undefined,
        sort,
        page,
      }),
      role === "admin"
        ? adminApi.getVendors()
        : Promise.resolve({ vendors: [] }),
    ]);
    return { ...data, vendors: directory.vendors };
  }, [role, vendor, rating, status, sort, page]);
  const { data, loading, error: loadError, reload } = useResource(loader);
  const change = (key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  };
  const moderate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await reviewsApi.moderate(selected.id, {
        status: selected.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN",
        reason,
      });
      toast.success(
        selected.status === "HIDDEN"
          ? "Review restored. It now counts towards the product rating."
          : "Review hidden. It no longer counts towards the product rating.",
      );
      setSelected(null);
      reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow={role === "admin" ? "CUSTOMER FEEDBACK" : "FROM YOUR CUSTOMERS"}
        title="Reviews"
        description={
          role === "admin"
            ? "Manage published reviews. Hide only content that breaks review guidelines, never a rating you disagree with."
            : "Verified feedback on your products. Customers can review after delivery."
        }
      />
      <WorkState loading={loading} error={loadError} retry={reload} />
      {data && (
        <>
          <div className="work-toolbar review-work-toolbar">
            {role === "admin" && (
              <VendorFilter
                value={vendor}
                onChange={(v) => change("vendor", v)}
                vendors={data.vendors}
              />
            )}
            <FormeSelect
              label="Rating"
              value={rating}
              options={ratingOptions}
              onValueChange={(v) => change("rating", v)}
            />
            {role === "admin" && (
              <FormeSelect
                label="Visibility"
                value={status}
                options={[
                  { value: "", label: "All reviews" },
                  { value: "PUBLISHED", label: "Published" },
                  { value: "HIDDEN", label: "Hidden" },
                ]}
                onValueChange={(v) => change("status", v)}
              />
            )}
            <FormeSelect
              label="Sort reviews"
              value={sort}
              options={reviewSortOptions}
              onValueChange={(v) => change("sort", v)}
            />
          </div>
          <p className="review-result-count" role="status">
            {data.pagination.total}{" "}
            {data.pagination.total === 1 ? "review" : "reviews"}
          </p>
          <div className="review-management-list">
            {data.reviews.map((review) => (
              <div key={review.id}>
                <div className="review-product-link">
                  <img
                    src={review.product.imageUrl || "/images/forme-studio.jpg"}
                    alt=""
                  />
                  <div>
                    {!review.product.deleted &&
                    ["ACTIVE", "OUT_OF_STOCK"].includes(
                      review.product.status,
                    ) ? (
                      <Link to={`/products/${review.productId}#reviews`}>
                        <strong>{review.product.name}</strong>
                      </Link>
                    ) : (
                      <strong>{review.product.name} · Unlisted</strong>
                    )}
                    <small>{review.product.vendor.name}</small>
                  </div>
                </div>
                <ReviewRow review={review}>
                  <span className="review-helpful-count">
                    {review.helpfulCount} found this helpful
                  </span>
                  {role === "admin" && (
                    <button
                      className="text-button"
                      onClick={() => {
                        setSelected(review);
                        setReason("");
                        setError("");
                      }}
                    >
                      {review.status === "HIDDEN"
                        ? "Restore review"
                        : "Hide review"}
                    </button>
                  )}
                </ReviewRow>
              </div>
            ))}
          </div>
          {!data.reviews.length && (
            <Empty
              title="No reviews to show."
              description="Reviews from delivered purchases will appear here. Try changing your filters."
            />
          )}
          <ReviewPagination
            pagination={data.pagination}
            onChange={(v) => change("page", String(v))}
          />
        </>
      )}
      <Drawer
        open={!!selected}
        title={selected?.status === "HIDDEN" ? "Restore review" : "Hide review"}
        onClose={() => !busy && setSelected(null)}
      >
        {selected && (
          <form onSubmit={moderate} className="review-moderation-form">
            <p>
              <strong>{selected.title}</strong> · {selected.rating}/5
            </p>
            {selected.status === "HIDDEN" ? (
              <p>
                This review will become public and count towards the product’s
                rating again.
              </p>
            ) : (
              <>
                <p>
                  Hide personal information, abuse, spam or unrelated content.
                  Negative product experiences are valid reviews.
                </p>
                <div className="store-field">
                  <label htmlFor="moderation-reason">
                    Reason shown to the customer *
                  </label>
                  <textarea
                    id="moderation-reason"
                    value={reason}
                    required
                    minLength={5}
                    maxLength={500}
                    rows={4}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={busy}
                  />
                </div>
              </>
            )}
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <button className="store-button" disabled={busy}>
              {busy
                ? "Saving…"
                : selected.status === "HIDDEN"
                  ? "Restore review"
                  : "Hide review"}
            </button>
          </form>
        )}
      </Drawer>
    </>
  );
}
