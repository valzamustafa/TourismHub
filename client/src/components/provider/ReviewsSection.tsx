// components/provider/ReviewsSection.tsx
'use client';

import React from 'react';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  activityId: string;
  activityName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  recentReviews: Review[];
}

interface ReviewsSectionProps {
  reviews: Review[];
  reviewStats: ReviewStats;
  onRespond: (reviewId: string, response: string) => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ 
  reviews, 
  reviewStats, 
  onRespond 
}) => {
  const ratingDistribution = React.useMemo(() => {
    const dist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach((review) => {
      const roundedRating = Math.round(review.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        dist[roundedRating] = (dist[roundedRating] || 0) + 1;
      }
    });
    
    return dist;
  }, [reviews]);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Star className="w-6 h-6 mr-2 text-amber-400" />
            Customer Reviews
          </h2>
          <p className="text-gray-400 mt-1">Manage and respond to customer feedback</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {reviews.length > 0 ? reviewStats.averageRating.toFixed(1) : "0.0"}
            </div>
            <div className="flex items-center justify-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(reviewStats.averageRating || 0)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-500'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-amber-400 mb-1">{reviewStats.totalReviews}</div>
          <div className="text-sm text-gray-400">Total Reviews</div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {reviewStats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Average Rating</div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {ratingDistribution[5] || 0}
          </div>
          <div className="text-sm text-gray-400">5-Star Reviews</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = reviews.length > 0 
              ? (count / reviews.length) * 100 
              : 0;
            
            return (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-16">
                  <span className="text-gray-300 mr-2">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex-1 ml-4">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-gray-300 w-12 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Reviews</h3>
          <span className="text-gray-400 text-sm">
            Showing {Math.min(reviews.length, 10)} of {reviews.length}
          </span>
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
            <p className="text-gray-400">Customer reviews will appear here once they rate your activities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 10).map((review) => (
              <div key={review.id} className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{review.userName}</h4>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-500'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-400">({review.rating.toFixed(1)})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mb-4 mt-3">
                  <p className="text-gray-300">{review.comment}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Activity: <span className="text-gray-300">{review.activityName}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    const response = prompt('Enter your response to this review:');
                    if (response) {
                      onRespond(review.id, response);
                    }
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Respond to Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;