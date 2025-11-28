// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  progress?: number;
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  action: () => void;
  color: string;
  count?: number;
}

interface Activity {
  id: number;
  title: string;
  provider: string;
  location: string;
  category: string;
  price: number;
  submitted: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  activityCount: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';


const CategoryModal: React.FC<{ onClose: () => void; onSave: (data: any) => void; category?: Category }> = ({ onClose, onSave, category }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    imageUrl: category?.imageUrl || '',
    featured: category?.featured || false
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(category?.imageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
     
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: data.url 
      }));
      setPreviewUrl(data.url);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
     
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      

      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert('Please upload a category image');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        padding: '24px',
        borderRadius: '12px',
        width: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #333333'
      }}>
        <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          {category ? 'Edit Category' : 'Add New Category'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff',
                minHeight: '80px'
              }}
              required
            />
          </div>

          {/* Image Upload Section */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px' }}>
              Category Image {!formData.imageUrl && '*'}
            </label>
            
            {previewUrl ? (
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: '2px solid #4CAF50'
                  }} 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #666666',
                  borderRadius: '8px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#2a2a2a',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div>
                    <div style={{ color: '#4CAF50', fontSize: '14px', marginBottom: '8px' }}>
                      Uploading...
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: '#333333',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '50%',
                        height: '100%',
                        backgroundColor: '#4CAF50',
                        animation: 'loading 1.5s infinite'
                      }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                    <div style={{ color: '#b0b0b0', marginBottom: '8px' }}>
                      Click to upload or drag and drop
                    </div>
                    <div style={{ color: '#666666', fontSize: '12px' }}>
                      PNG, JPG, JPEG up to 5MB
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {uploading && (
              <div style={{ color: '#4CAF50', fontSize: '12px', marginTop: '8px' }}>
                ⏳ Uploading image...
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              style={{ width: '18px', height: '18px' }}
            />
            <label style={{ color: '#b0b0b0' }}>Featured Category</label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #666666',
                color: '#b0b0b0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !formData.imageUrl}
              style={{
                padding: '12px 24px',
                backgroundColor: uploading || !formData.imageUrl ? '#666666' : '#4CAF50',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                cursor: uploading || !formData.imageUrl ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: uploading || !formData.imageUrl ? 0.6 : 1
              }}
            >
              {uploading ? 'Uploading...' : (category ? 'Update' : 'Create') + ' Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, progress }) => (
  <div style={{ 
    height: '100%', 
    background: `linear-gradient(135deg, ${color}20 0%, #1e1e1e 100%)`,
    border: `1px solid ${color}40`,
    transition: 'all 0.3s ease',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: '#b0b0b0', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>
          {value}
        </div>
        <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
          {subtitle}
        </div>
      </div>
      <div
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          padding: '12px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </div>
    </div>
    {progress !== undefined && (
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          borderRadius: '5px',
          height: '8px',
          backgroundColor: `${color}30`,
          overflow: 'hidden'
        }}>
          <div 
            style={{
              height: '100%',
              backgroundColor: color,
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    )}
  </div>
);

const QuickActionCard: React.FC<QuickActionProps> = ({ title, description, icon, action, color, count }) => (
  <div 
    style={{ 
      cursor: 'pointer', 
      transition: 'all 0.3s ease',
      background: `linear-gradient(135deg, ${color}20 0%, #1e1e1e 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}
    onClick={action}
  >
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          padding: '16px',
          display: 'inline-flex',
          marginBottom: '16px',
          color: 'white'
        }}
      >
        {icon}
      </div>
      {count && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#f44336',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {count}
        </div>
      )}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>
      {title}
    </div>
    <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
      {description}
    </div>
  </div>
);

const ActivityApprovalItem: React.FC<{ activity: Activity }> = ({ activity }) => (
  <div
    style={{
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #333333',
      borderRadius: '8px',
      backgroundColor: '#1e1e1e',
      transition: 'all 0.3s ease'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#2196F3',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.5rem'
      }}>
        🏔️
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
          {activity.title}
        </div>
        <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
          by {activity.provider}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #2196F3',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#2196F3'
          }}>
            📍 {activity.location}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #9C27B0',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#9C27B0'
          }}>
            {activity.category}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #b0b0b0',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#b0b0b0'
          }}>
            ⏰ {activity.submitted}
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '18px', color: '#2196F3', fontWeight: 'bold' }}>
          ${activity.price}
        </div>
      </div>
    </div>
    
    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button
        style={{
          padding: '8px 16px',
          border: '1px solid #f44336',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          color: '#f44336',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        ❌ Reject
      </button>
      <button
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#4CAF50',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '8px'
        }}
      >
        ✅ Approve
      </button>
    </div>
  </div>
);

const RecentUsersTable: React.FC = () => {
  const recentUsers: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Tourist', joinDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Provider', joinDate: '2024-01-14', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Tourist', joinDate: '2024-01-13', status: 'Pending' },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'Provider', joinDate: '2024-01-12', status: 'Active' }
  ];

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', backgroundColor: '#1e1e1e' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#333333' }}>
          <tr>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>User</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Email</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Role</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Join Date</th>
            <th style={{ color: 'white', fontWeight: 'bold', padding: '12px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentUsers.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #333333' }}>
              <td style={{ padding: '12px', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#2196F3', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '8px'
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </div>
              </td>
              <td style={{ padding: '12px', color: '#ffffff' }}>{user.email}</td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  border: '1px solid #2196F3',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: user.role === 'Provider' ? '#2196F3' : '#b0b0b0',
                  borderColor: user.role === 'Provider' ? '#2196F3' : '#b0b0b0'
                }}>
                  {user.role}
                </div>
              </td>
              <td style={{ padding: '12px', color: '#ffffff' }}>{user.joinDate}</td>
              <td style={{ padding: '12px' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  backgroundColor: user.status === 'Active' ? '#4CAF5030' : '#FF980030',
                  color: user.status === 'Active' ? '#4CAF50' : '#FF9800',
                  fontWeight: 'bold'
                }}>
                  {user.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        fetchCategories();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    if (!editingCategory) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        fetchCategories();
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

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

const AdminDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);

  const menuItems = [
    { text: 'Dashboard', icon: '📊', section: 'dashboard' },
    { text: 'Users', icon: '👥', section: 'users' },
    { text: 'Categories', icon: '📂', section: 'categories' },
    { text: 'Activities', icon: '🏔️', section: 'activities' },
    { text: 'Bookings', icon: '📅', section: 'bookings' },
    { text: 'Payments', icon: '💰', section: 'payments' },
    { text: 'Analytics', icon: '📈', section: 'analytics' },
    { text: 'Settings', icon: '⚙️', section: 'settings' }
  ];

  const quickActions: QuickActionProps[] = [
    {
      title: 'Approve Activities',
      description: 'Review and approve pending activities',
      icon: <span>🏔️</span>,
      color: '#4CAF50',
      count: 5,
      action: () => console.log('Approve activities clicked')
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <span>👥</span>,
      color: '#2196F3',
      action: () => console.log('Manage users clicked')
    },
    {
      title: 'View Reports',
      description: 'Generate platform reports',
      icon: <span>📊</span>,
      color: '#FF9800',
      action: () => console.log('View reports clicked')
    },
    {
      title: 'Manage Payments',
      description: 'Oversee transactions and payouts',
      icon: <span>💰</span>,
      color: '#9C27B0',
      action: () => console.log('Manage payments clicked')
    }
  ];

  useEffect(() => {
    setStats({
      totalUsers: 1247,
      totalActivities: 89,
      totalBookings: 456,
      totalRevenue: 28450,
      pendingApprovals: 12
    });

    setPendingActivities([
      { id: 1, title: 'Mountain Hiking Adventure', provider: 'Adventure Co', location: 'Alps, Switzerland', category: 'Adventure', price: 150, submitted: '2 hours ago' },
      { id: 2, title: 'City Cultural Tour', provider: 'Urban Explorers', location: 'Paris, France', category: 'Cultural', price: 80, submitted: '1 day ago' },
      { id: 3, title: 'Beach Relaxation Package', provider: 'Tropical Getaways', location: 'Maldives', category: 'Relaxation', price: 200, submitted: '3 hours ago' }
    ]);

    setRecentActivities([
      { id: 1, user: 'John Doe', action: 'booked', target: 'Mountain Hiking', time: '30 min ago' },
      { id: 2, user: 'Sarah Wilson', action: 'created', target: 'New City Tour', time: '1 hour ago' },
      { id: 3, user: 'Mike Johnson', action: 'reviewed', target: 'Beach Package', time: '2 hours ago' },
      { id: 4, user: 'Emma Davis', action: 'canceled', target: 'Cultural Tour', time: '4 hours ago' }
    ]);
  }, []);

  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 7000 }
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  const renderMainContent = () => {
    switch (activeSection) {
      case 'categories':
        return <CategoriesManagement />;
      case 'dashboard':
      default:
        return (
          <>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
                Welcome back, Admin! 👋
              </div>
              <div style={{ color: '#b0b0b0', fontSize: '16px' }}>
                Here's what's happening with your platform today.
              </div>
            </div>

            {/* Statistics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                subtitle="+12% this month"
                icon={<span>👥</span>}
                color="#2196F3"
                progress={65}
              />
              <StatCard
                title="Activities"
                value={stats.totalActivities}
                subtitle="+5 new today"
                icon={<span>🏔️</span>}
                color="#4CAF50"
                progress={45}
              />
              <StatCard
                title="Bookings"
                value={stats.totalBookings}
                subtitle="+23% growth"
                icon={<span>📅</span>}
                color="#FF9800"
                progress={78}
              />
              <StatCard
                title="Revenue"
                value={`$${stats.totalRevenue}`}
                subtitle="+18% from last month"
                icon={<span>📈</span>}
                color="#9C27B0"
                progress={82}
              />
              <StatCard
                title="Pending"
                value={stats.pendingApprovals}
                subtitle="Awaiting approval"
                icon={<span>🔔</span>}
                color="#f44336"
                progress={30}
              />
            </div>

            {/* Quick Actions */}
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
              Quick Actions ⚡
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div>
                {/* Activity Approvals */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                      Pending Activity Approvals 🕐
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      backgroundColor: '#FF980030',
                      color: '#FF9800',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {pendingActivities.length} pending
                    </div>
                  </div>
                  {pendingActivities.map((activity) => (
                    <ActivityApprovalItem key={activity.id} activity={activity} />
                  ))}
                </div>

                {/* Recent Users */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Recent Users 👥
                  </div>
                  <RecentUsersTable />
                </div>
              </div>

              <div>
                {/* Revenue Chart */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                      Revenue Overview 💰
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#4CAF50' }}>
                      <span style={{ marginRight: '4px' }}>📈</span>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        +18%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '8px' }}>
                    {revenueData.map((data, index) => (
                      <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ color: '#b0b0b0', fontSize: '14px', marginBottom: '8px' }}>
                          {data.month}
                        </div>
                        <div
                          style={{
                            width: '80%',
                            height: `${(data.revenue / maxRevenue) * 150}px`,
                            backgroundColor: index === revenueData.length - 1 ? '#4CAF50' : '#2196F3',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                          }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>
                          ${(data.revenue / 1000).toFixed(0)}k
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Platform Performance 📊
                  </div>
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#ffffff' }}>User Satisfaction</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>92%</div>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: '#4CAF5030',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#4CAF50',
                          width: '92%'
                        }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#ffffff' }}>Booking Completion</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2196F3' }}>87%</div>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: '#2196F330',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#2196F3',
                          width: '87%'
                        }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#ffffff' }}>Payment Success</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>95%</div>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: '#4CAF5030',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#4CAF50',
                          width: '95%'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
                    Recent Activity 📝
                  </div>
                  <div>
                    {recentActivities.map((activity) => (
                      <div key={activity.id} style={{ 
                        borderBottom: '1px solid #333333', 
                        padding: '16px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '16px', color: '#ffffff' }}>
                            <strong>{activity.user}</strong> {activity.action} {activity.target}
                          </div>
                          <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
                            {activity.time}
                          </div>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          padding: '4px 8px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          backgroundColor: 
                            activity.action === 'booked' ? '#4CAF5030' :
                            activity.action === 'created' ? '#2196F330' :
                            activity.action === 'reviewed' ? '#FF980030' : '#f4433630',
                          color: 
                            activity.action === 'booked' ? '#4CAF50' :
                            activity.action === 'created' ? '#2196F3' :
                            activity.action === 'reviewed' ? '#FF9800' : '#f44336',
                          fontWeight: 'bold'
                        }}>
                          {activity.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212' }}>
      {/* Sidebar */}
      <div style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        width: '250px', 
        backgroundColor: '#1e1e1e', 
        borderRight: '1px solid #333333', 
        padding: '24px' 
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '32px' }}>
          Tour Trove Admin
        </div>
        {menuItems.map((item) => (
          <div 
            key={item.text} 
            style={{ 
              borderLeft: activeSection === item.section ? '4px solid #4CAF50' : 'none',
              margin: '4px 8px',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ffffff',
              backgroundColor: activeSection === item.section ? '#2a2a2a' : 'transparent',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setActiveSection(item.section)}
          >
            <span>{item.icon}</span>
            <span style={{ fontWeight: activeSection === item.section ? 'bold' : 'normal' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: '250px', 
        right: 0, 
        height: '64px', 
        backgroundColor: '#1e1e1e', 
        borderBottom: '1px solid #333333', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
          {menuItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ cursor: 'pointer', fontSize: '24px' }}>🔔</span>
            <div style={{ 
              position: 'absolute', 
              top: '-4px', 
              right: '-4px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              borderRadius: '50%', 
              width: '16px', 
              height: '16px', 
              fontSize: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              3
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#4CAF50', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white' 
            }}>
              A
            </div>
            <span style={{ color: '#ffffff' }}>Admin</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: '24px', marginTop: '64px', marginLeft: '250px' }}>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;