import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Star, ThumbsUp, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { reviewsApi } from "../../api/reviews";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Drawer, Field } from "./UI";
import { FormeSelect } from "./Select";
import "./reviews.css";

import { reviewSortOptions, ratingOptions } from "../../lib/reviewOptions";
export function Stars({ value = 0 }) {
  return (
    <span
      className="review-stars"
      role="img"
      aria-label={`${Number(value).toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true">
          <Star size={16} />
          <span
            style={{
              width: `${Math.max(0, Math.min(1, value - n + 1)) * 100}%`,
            }}
          >
            <Star size={16} fill="currentColor" />
          </span>
        </span>
      ))}
    </span>
  );
}
export function ReviewRow({ review, children }) {
  return (
    <article className="review-row">
      <div className="review-byline">
        <strong>
          {review.author}
          {review.isOwn ? " · You" : ""}
        </strong>
        <span>
          <Check size={13} />
          Verified purchase
        </span>
      </div>
      <div className="review-rating-date">
        <Stars value={review.rating} />
        <time dateTime={review.createdAt}>
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>
      <h3>{review.title}</h3>
      <p className="review-body">{review.body}</p>
      {review.status === "HIDDEN" && (
        <p className="review-moderation">
          Hidden from the store: {review.moderationReason}
        </p>
      )}
      {children && <div className="review-row-actions">{children}</div>}
    </article>
  );
}
export function ReviewPagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <nav className="review-pagination" aria-label="Review pages">
      <button
        className="icon-button"
        aria-label="Previous reviews"
        disabled={pagination.page === 1}
        onClick={() => onChange(pagination.page - 1)}
      >
        <ArrowLeft size={17} />
      </button>
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        className="icon-button"
        aria-label="Next reviews"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => onChange(pagination.page + 1)}
      >
        <ArrowRight size={17} />
      </button>
    </nav>
  );
}
export function ReviewEditor({ open, review, product, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ rating: 0, title: "", body: "" });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [removing, setRemoving] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm({
        rating: review?.rating || 0,
        title: review?.title || "",
        body: review?.body || "",
      });
      setError("");
      setRemoving(false);
    }
  }
  const save = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      setError("Choose a star rating.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (review) await reviewsApi.update(review.id, form);
      else await reviewsApi.create(product.id, form);
      toast.success(
        review
          ? "Your review has been updated."
          : "Your review is now published.",
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await reviewsApi.remove(review.id);
      toast.success("Your review has been deleted.");
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Drawer
      open={open}
      onClose={() => !busy && onClose()}
      title={review ? "Edit your review" : "Write a review"}
      className="review-dialog"
    >
      <p className="review-product-name">{product?.name}</p>
      {removing ? (
        <div className="review-delete">
          <h3>Delete your review?</h3>
          <p>
            This removes your rating and helpful votes. You can write a new
            review later.
          </p>
          <div className="review-row-actions">
            <button className="store-button" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Delete review"}
            </button>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => setRemoving(false)}
            >
              Keep review
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={save} className="review-form">
          <fieldset disabled={busy}>
            <legend>Your rating</legend>
            <div className="review-rating-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n}>
                  <input
                    type="radio"
                    name="review-rating"
                    value={n}
                    checked={form.rating === n}
                    onChange={() => setForm({ ...form, rating: n })}
                    aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                    required
                  />
                  <Star
                    size={29}
                    fill={form.rating >= n ? "currentColor" : "none"}
                  />
                </label>
              ))}
              <span>
                {
                  [
                    "Select a rating",
                    "Poor",
                    "Fair",
                    "Good",
                    "Very good",
                    "Excellent",
                  ][form.rating]
                }
              </span>
            </div>
          </fieldset>
          <Field
            name="review-title"
            label="Review title"
            required
            minLength={3}
            maxLength={100}
            value={form.title}
            disabled={busy}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What stood out?"
          />
          <div className="store-field">
            <label htmlFor="review-body">Your experience *</label>
            <textarea
              id="review-body"
              required
              minLength={20}
              maxLength={3000}
              rows={6}
              value={form.body}
              disabled={busy}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="How does it feel to use? Tell other shoppers what worked for you."
              aria-describedby="review-guidance"
            />
            <small id="review-guidance">
              20–3,000 characters. Keep it about the product; leave out personal
              details.
            </small>
          </div>
          {review?.status === "HIDDEN" && (
            <p className="review-moderation">
              Editing a hidden review does not republish it. An administrator
              must restore it.
            </p>
          )}
          <div className="review-editor-actions">
            <button className="store-button" disabled={busy}>
              {busy ? "Saving…" : review ? "Save changes" : "Publish review"}
              <ArrowRight size={16} />
            </button>
            {review && (
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={() => setRemoving(true)}
              >
                Delete review
              </button>
            )}
          </div>
        </form>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </Drawer>
  );
}

export function ProductReviews({ product, onSummary }) {
  const { user } = useAuth(),
    toast = useToast(),
    location = useLocation();
  const [data, setData] = useState(null),
    [eligibility, setEligibility] = useState(null);
  const [rating, setRating] = useState(""),
    [sort, setSort] = useState("newest"),
    [page, setPage] = useState(1);
  const [version, setVersion] = useState(0),
    [failure, setFailure] = useState(null),
    [loadedKey, setLoadedKey] = useState(null),
    [editor, setEditor] = useState(false),
    [voting, setVoting] = useState(null);
  const requestKey = [
    product.id,
    user?.id,
    user?.role,
    rating,
    sort,
    page,
    version,
  ].join(":");
  const loading = loadedKey !== requestKey;
  const error = failure?.key === requestKey ? failure.message : "";
  useEffect(() => {
    let active = true;
    Promise.all([
      reviewsApi.list(product.id, { rating: rating || undefined, sort, page }),
      user?.role === "CUSTOMER"
        ? reviewsApi.eligibility(product.id)
        : Promise.resolve(null),
    ])
      .then(([result, mine]) => {
        if (active) {
          setData(result);
          setEligibility(mine);
          onSummary?.(result.summary);
        }
      })
      .catch((e) => {
        if (active) setFailure({ key: requestKey, message: e.message });
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [
    product.id,
    user?.id,
    user?.role,
    rating,
    sort,
    page,
    version,
    onSummary,
    requestKey,
  ]);
  useEffect(() => {
    if (location.hash === "#reviews")
      document.getElementById("reviews")?.scrollIntoView({ block: "start" });
  }, [location.key, location.hash]);
  const filter = (next) => {
    setRating(next);
    setPage(1);
  };
  const refresh = () => {
    setPage(1);
    setVersion((v) => v + 1);
  };
  const vote = async (review) => {
    setVoting(review.id);
    try {
      const result = await reviewsApi.helpful(review.id, !review.helpful);
      setData((previous) => ({
        ...previous,
        reviews: previous.reviews.map((r) =>
          r.id === review.id
            ? {
                ...r,
                helpful: result.helpful,
                helpfulCount: result.helpfulCount,
              }
            : r,
        ),
      }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setVoting(null);
    }
  };
  const summary = data?.summary;
  return (
    <section
      className="product-reviews"
      id="reviews"
      aria-labelledby="reviews-heading"
    >
      <header className="section-heading">
        <div>
          <p className="eyebrow">FROM PEOPLE WHO BOUGHT IT</p>
          <h2 id="reviews-heading">Ratings & reviews</h2>
        </div>
      </header>
      {error ? (
        <div role="alert" className="review-empty">
          <p>{error}</p>
          <button className="text-button" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !data ? (
        <p role="status" className="review-empty">
          Loading reviews…
        </p>
      ) : (
        <div className="reviews-layout">
          <aside className="review-summary">
            <div className="review-score">
              <strong>
                {summary.average ? summary.average.toFixed(1) : "—"}
              </strong>
              <span>out of 5</span>
            </div>
            <Stars value={summary.average || 0} />
            <p>
              {summary.count}{" "}
              {summary.count === 1 ? "verified review" : "verified reviews"}
            </p>
            <div className="review-distribution" aria-label="Rating breakdown">
              {[5, 4, 3, 2, 1].map((n) => (
                <button
                  key={n}
                  aria-label={`Filter ${n} star reviews (${summary.distribution[n]})`}
                  aria-pressed={rating === String(n)}
                  onClick={() => filter(rating === String(n) ? "" : String(n))}
                >
                  <span>
                    {n} <Star size={12} />
                  </span>
                  <span className="review-bar">
                    <span
                      style={{
                        width: `${summary.count ? (summary.distribution[n] / summary.count) * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span>{summary.distribution[n]}</span>
                </button>
              ))}
            </div>
            <div className="review-invitation">
              <h3>Share your experience</h3>
              <p>
                Reviews are open to customers once their order is delivered.
              </p>
              {!user ? (
                <Link
                  className="store-button secondary"
                  to="/login"
                  state={{ reviewReturn: `/products/${product.id}#reviews` }}
                >
                  Sign in to review
                </Link>
              ) : user.role === "CUSTOMER" && eligibility?.eligible ? (
                <button
                  className="store-button secondary"
                  onClick={() => setEditor(true)}
                >
                  {eligibility.review ? "Edit your review" : "Write a review"}
                </button>
              ) : (
                <p className="review-eligibility">
                  {user.role === "CUSTOMER"
                    ? "No delivered purchase of this product yet."
                    : "Reviews are written by customers."}
                </p>
              )}
              {eligibility?.review?.status === "HIDDEN" && (
                <p className="review-moderation">
                  Your review is hidden: {eligibility.review.moderationReason}
                </p>
              )}
            </div>
          </aside>
          <div className="review-results" aria-busy={loading}>
            <div className="review-filters">
              <FormeSelect
                label="Rating"
                value={rating}
                onValueChange={filter}
                options={ratingOptions}
              />
              <FormeSelect
                label="Sort reviews"
                value={sort}
                onValueChange={(v) => {
                  setSort(v);
                  setPage(1);
                }}
                options={reviewSortOptions}
              />
            </div>
            <p className="review-result-count" role="status">
              {data.pagination.total}{" "}
              {data.pagination.total === 1 ? "review" : "reviews"}
              {rating
                ? ` with ${rating} ${rating === "1" ? "star" : "stars"}`
                : ""}
            </p>
            {data.reviews.length ? (
              data.reviews.map((review) => (
                <ReviewRow key={review.id} review={review}>
                  {review.isOwn ? (
                    <button
                      className="text-button"
                      onClick={() => setEditor(true)}
                    >
                      Edit your review
                    </button>
                  ) : user?.role === "CUSTOMER" ? (
                    <button
                      className="review-helpful"
                      aria-pressed={review.helpful}
                      disabled={voting !== null || loading}
                      onClick={() => vote(review)}
                    >
                      <ThumbsUp size={14} />
                      {review.helpful ? "Marked helpful" : "Helpful"} (
                      {review.helpfulCount})
                    </button>
                  ) : !user ? (
                    <Link
                      className="review-helpful"
                      to="/login"
                      state={{
                        reviewReturn: `/products/${product.id}#reviews`,
                      }}
                    >
                      <ThumbsUp size={14} />
                      Helpful ({review.helpfulCount})
                    </Link>
                  ) : (
                    <span className="review-helpful-count">
                      {review.helpfulCount} found this helpful
                    </span>
                  )}
                </ReviewRow>
              ))
            ) : (
              <div className="review-empty">
                <h3>
                  {summary.count
                    ? "No reviews with this rating."
                    : "A fresh addition. Your opinion matters."}
                </h3>
                <p>
                  {summary.count
                    ? "Try another rating to read what customers think."
                    : "There are no customer reviews yet. The first delivered buyer can start the conversation."}
                </p>
                {rating && (
                  <button className="text-button" onClick={() => filter("")}>
                    Show all reviews
                  </button>
                )}
              </div>
            )}
            <ReviewPagination pagination={data.pagination} onChange={setPage} />
          </div>
        </div>
      )}
      <ReviewEditor
        open={editor}
        review={eligibility?.review}
        product={product}
        onClose={() => setEditor(false)}
        onSaved={refresh}
      />
    </section>
  );
}
