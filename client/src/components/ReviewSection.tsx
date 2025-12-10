'use client';

import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, Edit, Trash2 } from 'lucide-react';

interface Review {
  id: string;
  activityId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  activityId: string;
  userId?: string;
  userRole?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

export default function ReviewSection({ activityId, userId, userRole }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [activityId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reviews/activity/${activityId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/activity/${activityId}/average`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAverageRating(data.averageRating);
        }
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Please login to submit a review');
      return;
    }

    if (!formData.comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = editingReviewId 
        ? `${API_BASE_URL}/reviews/${editingReviewId}`
        : `${API_BASE_URL}/reviews`;

      const method = editingReviewId ? 'PUT' : 'POST';
      const body = editingReviewId
        ? JSON.stringify({
            rating: formData.rating,
            comment: formData.comment
          })
        : JSON.stringify({
            activityId,
            userId,
            rating: formData.rating,
            comment: formData.comment
          });

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(editingReviewId ? 'Review updated successfully!' : 'Review submitted successfully!');
          setFormData({ rating: 5, comment: '' });
          setShowReviewForm(false);
          setEditingReviewId(null);
          fetchReviews();
          fetchAverageRating();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Review deleted successfully!');
          fetchReviews();
          fetchAverageRating();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const handleEditReview = (review: Review) => {
    setFormData({
      rating: review.rating,
      comment: review.comment
    });
    setEditingReviewId(review.id);
    setShowReviewForm(true);
  };

  const userHasReviewed = reviews.some(review => {
    return review.userName === userId || (userId && review.id.includes(userId));
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Customer Reviews</h2>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-green-700">{averageRating.toFixed(1)}</div>
            <div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-green-600 text-sm mt-1">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {userId && !userHasReviewed && !editingReviewId && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-green-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-2xl focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-green-700 mb-2">Comment</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Share your experience..."
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors font-semibold"
              >
                {submitting ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReviewId(null);
                  setFormData({ rating: 5, comment: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-green-700 mt-2">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-green-600">
            No reviews yet. Be the first to review this activity!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">{review.userName}</h4>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-green-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <p className="text-green-700 mt-2">{review.comment}</p>
              
              {(userId === review.id.split('-')[0] || userRole === 'Admin') && (
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-green-200">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}