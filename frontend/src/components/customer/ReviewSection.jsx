import React, { useState, useEffect } from 'react';
import { RatingStars } from '../common/RatingStars';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reviewsApi } from '../../api/reviews';
import { MessageSquare, Edit3, Trash2, CheckCircle, ThumbsUp } from 'lucide-react';

export const ReviewSection = ({ productId, averageRating = 4.8, reviewCount = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await reviewsApi.getProductReviews(productId);
      if (res.reviews) setReviews(res.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to share your verified review.');
      return;
    }
    setEditingReview(null);
    setRating(5);
    setTitle('');
    setComment('');
    setModalOpen(true);
  };

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setRating(rev.rating);
    setTitle(rev.title || '');
    setComment(rev.comment);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write some details for your review.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingReview) {
        await reviewsApi.updateReview(editingReview.id, { rating, title, comment });
        toast.success('Your review was updated.');
      } else {
        await reviewsApi.addReview(productId, { rating, title, comment });
        toast.success('Thank you for submitting your review!');
      }
      setModalOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Could not save review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await reviewsApi.deleteReview(deleteTargetId);
      toast.info('Review deleted.');
      setDeleteTargetId(null);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle mt-10">
      {/* Header / Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Customer Reviews</h3>
          <div className="flex items-center gap-3 mt-2">
            <RatingStars rating={averageRating} size="lg" />
            <span className="text-base font-bold text-slate-900">
              {Number(averageRating).toFixed(1)} out of 5
            </span>
            <span className="text-xs text-slate-500">
              ({reviews.length} verified {reviews.length === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          leftIcon={MessageSquare}
          onClick={handleOpenCreate}
        >
          Write a Review
        </Button>
      </div>

      {/* Review List */}
      <div className="pt-6 divide-y divide-slate-100">
        {isLoading ? (
          <p className="text-sm text-slate-500 py-6 text-center">Loading customer feedback...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
            <p className="text-xs text-slate-500 mt-1">Be the first to share your experience with this item!</p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isOwner = user && (user.id === rev.userId || rev.userName === user.name);

            return (
              <div key={rev.id} className="py-6 first:pt-2 last:pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{rev.userName}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Buyer
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(rev)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit your review"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(rev.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete your review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <RatingStars rating={rev.rating} size="sm" />
                  {rev.title && (
                    <h5 className="text-sm font-bold text-slate-900 mt-1.5">{rev.title}</h5>
                  )}
                  <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{rev.comment}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write / Edit Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReview ? 'Edit Your Review' : 'Write a Product Review'}
        description="Share your genuine impressions of build quality, aesthetics, and performance."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Overall Rating
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block">
              <RatingStars
                rating={rating}
                interactive
                size="xl"
                onChange={(newR) => setRating(newR)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Review Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Exceptional acoustics, pristine industrial design"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Your Review
            </label>
            <textarea
              rows="4"
              required
              placeholder="What did you like or dislike? How does it fit into your daily workflow?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {editingReview ? 'Save Changes' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message="Are you sure you want to remove your product review? This action cannot be reversed."
        confirmText="Delete Review"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};
