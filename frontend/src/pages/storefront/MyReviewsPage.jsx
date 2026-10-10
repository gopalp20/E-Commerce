import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { reviewsApi } from "../../api/reviews";
import { useResource } from "../../components/management/UI";
import {
  ReviewRow,
  ReviewPagination,
  ReviewEditor,
} from "../../components/forme/Reviews";
import { PageState } from "../../components/forme/UI";
export function MyReviewsPage() {
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState(null);
  const loader = useCallback(
    () => reviewsApi.workspace("mine", { page }),
    [page],
  );
  const { data, loading, error, reload } = useResource(loader);
  return (
    <div className="wrap my-reviews">
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1>Your reviews.</h1>
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState description={error} retry={reload} />
      ) : (
        <>
          <p className="review-result-count">
            {data.pagination.total}{" "}
            {data.pagination.total === 1 ? "review" : "reviews"}. Your
            experience helps others choose.
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
                  <button
                    className="text-button"
                    onClick={() => setSelected(review)}
                  >
                    Edit your review
                  </button>
                  <span className="review-helpful-count">
                    {review.helpfulCount} found this helpful
                  </span>
                </ReviewRow>
              </div>
            ))}
          </div>
          {!data.reviews.length && (
            <div className="review-empty">
              <h3>You haven’t written a review yet.</h3>
              <p>
                Once an order is delivered, share your thoughts from its order
                details or the product page.
              </p>
              <Link className="arrow-link" to="/orders">
                View your orders
              </Link>
            </div>
          )}
          <ReviewPagination pagination={data.pagination} onChange={setPage} />
        </>
      )}
      <ReviewEditor
        open={!!selected}
        review={selected}
        product={selected?.product}
        onClose={() => setSelected(null)}
        onSaved={() => {
          setPage(1);
          reload();
        }}
      />
    </div>
  );
}
