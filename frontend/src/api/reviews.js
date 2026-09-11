import api from './axios';
import { mockStorage } from './mockData';

export const reviewsApi = {
  getProductReviews: async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const reviews = mockStorage.getReviews();
        const productReviews = reviews.filter((r) => r.productId === Number(productId));
        return { success: true, reviews: productReviews };
      }
      throw err;
    }
  },

  addReview: async (productId, { rating, title, comment }) => {
    try {
      const res = await api.post(`/products/${productId}/reviews`, { rating, title, comment });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const reviews = mockStorage.getReviews();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const newReview = {
          id: Date.now(),
          productId: Number(productId),
          userId: user.id || 1,
          userName: user.name || 'Alex Johnson',
          userAvatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          rating: Number(rating),
          title,
          comment,
          createdAt: new Date().toISOString(),
        };

        reviews.unshift(newReview);
        mockStorage.setReviews(reviews);

        // Update product average rating & count
        const products = mockStorage.getProducts();
        const pIdx = products.findIndex((p) => p.id === Number(productId));
        if (pIdx !== -1) {
          const productReviews = reviews.filter((r) => r.productId === Number(productId));
          const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
          products[pIdx].rating = Number(avg.toFixed(1));
          products[pIdx].reviewCount = productReviews.length;
          mockStorage.setProducts(products);
        }

        return { success: true, review: newReview };
      }
      throw err;
    }
  },

  updateReview: async (reviewId, { rating, title, comment }) => {
    try {
      const res = await api.put(`/reviews/${reviewId}`, { rating, title, comment });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const reviews = mockStorage.getReviews();
        const idx = reviews.findIndex((r) => r.id === Number(reviewId));
        if (idx !== -1) {
          reviews[idx] = { ...reviews[idx], rating: Number(rating), title, comment, updatedAt: new Date().toISOString() };
          mockStorage.setReviews(reviews);
          return { success: true, review: reviews[idx] };
        }
        throw new Error('Review not found');
      }
      throw err;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        let reviews = mockStorage.getReviews();
        reviews = reviews.filter((r) => r.id !== Number(reviewId));
        mockStorage.setReviews(reviews);
        return { success: true, message: 'Review deleted successfully' };
      }
      throw err;
    }
  },
};
