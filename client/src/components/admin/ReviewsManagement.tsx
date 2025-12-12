// components/admin/ReviewsManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Review } from './utils/types';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';
const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchReviews();
          alert('Review deleted successfully!');
        } else {
          throw new Error('Failed to delete review');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px' }}>
      <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        Reviews Management
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            animation: 'spin 1s linear infinite',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ color: '#b0b0b0' }}>Loading reviews...</div>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '8px', 
          overflow: 'hidden',
          border: '1px solid #333333'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#333333' }}>
              <tr>
                <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>User</th>
                <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Activity</th>
                <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Rating</th>
                <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Comment</th>
                <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} style={{ borderBottom: '1px solid #333333' }}>
                  <td style={{ padding: '12px', color: '#ffffff' }}>{review.userName}</td>
                  <td style={{ padding: '12px', color: '#ffffff' }}>
                    {review.activityId.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ 
                          color: i < review.rating ? '#FFD700' : '#666666',
                          fontSize: '16px'
                        }}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#ffffff', maxWidth: '300px' }}>
                    <div style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {review.comment}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#ffffff' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;