// components/admin/CategoriesManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CategoryModal from './modals/CategoryModal';
import { Category } from './utils/types';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to access admin panel');
      window.location.href = '/';
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch categories: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        } else {
          alert(`Error fetching categories: ${error.message}`);
        }
      } else {
        alert('An unknown error occurred while fetching categories');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add categories');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        fetchCategories();
        setShowAddModal(false);
        alert('Category created successfully!');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to create category: ${response.status} ${errorText}`);
      }
    } catch (error: unknown) {
      console.error('Error adding category:', error);
      
      if (error instanceof Error) {
        alert(`Failed to create category: ${error.message}`);
      } else {
        alert('Failed to create category. Please try again.');
      }
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    if (!editingCategory) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to update categories');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        fetchCategories();
        setEditingCategory(null);
        alert('Category updated successfully!');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to update category: ${response.status} ${errorText}`);
      }
    } catch (error: unknown) {
      console.error('Error updating category:', error);
      
      if (error instanceof Error) {
        alert(`Failed to update category: ${error.message}`);
      } else {
        alert('Failed to update category. Please try again.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to delete categories');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchCategories();
        alert('Category deleted successfully!');
      } else {
        let errorMessage = `Failed to delete category: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = `Failed to delete category: ${errorData.message || errorData.error || response.statusText}`;
        } catch {
          errorMessage = `Failed to delete category: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      
      if (error instanceof Error) {
        alert(`Failed to delete category: ${error.message}`);
      } else {
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>Categories Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {categories.map((category) => (
          <div key={category.id} style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #333333'
          }}>
            <img 
              src={category.imageUrl} 
              alt={category.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/2a2a2a/ffffff?text=No+Image';
              }}
            />
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {category.name}
            </h3>
            <p style={{ color: '#b0b0b0', fontSize: '14px', marginBottom: '12px' }}>
              {category.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '16px',
                fontSize: '12px',
                backgroundColor: category.featured ? '#4CAF5030' : '#66666630',
                color: category.featured ? '#4CAF50' : '#b0b0b0'
              }}>
                {category.featured ? '⭐ Featured' : 'Standard'}
              </span>
              <span style={{ color: '#2196F3', fontSize: '14px' }}>
                {category.activityCount} activities
              </span>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setEditingCategory(category)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Categories Found</h3>
          <p>Create your first category to get started!</p>
        </div>
      )}

      {showAddModal && (
        <CategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCategory}
        />
      )}

      {editingCategory && (
        <CategoryModal
          onClose={() => setEditingCategory(null)}
          onSave={handleUpdateCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
};

export default CategoriesManagement;