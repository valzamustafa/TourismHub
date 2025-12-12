// components/admin/AboutManagement.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProviderTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  email: string;
  activityCount?: number;
}

interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  teamMembers: ProviderTeamMember[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  lastUpdated: string;
}

interface AboutManagementProps {
  darkMode?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5224/api';

const AboutManagement: React.FC<AboutManagementProps> = ({ darkMode = false }) => {
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    id: '1',
    title: 'About TourismHub',
    subtitle: 'Your Gateway to Unforgettable Adventures',
    description: 'TourismHub connects adventure seekers with authentic travel experiences worldwide. We work with local experts to provide unique, safe, and memorable activities that create lasting memories.',
    mission: 'To make extraordinary travel experiences accessible to everyone by connecting travelers with local experts and authentic adventures.',
    vision: 'To be the world\'s most trusted platform for discovering and booking unique travel experiences.',
    values: ['Authenticity', 'Safety First', 'Customer Satisfaction', 'Sustainable Tourism', 'Innovation'],
    teamMembers: [],
    contactEmail: 'contact@tourismhub.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Adventure Street, Tourism City, TC 10101',
    lastUpdated: new Date().toISOString()
  });

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [providers, setProviders] = useState<ProviderTeamMember[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAboutContent();
    fetchProviders();
  }, []);

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  const fetchAboutContent = async () => {
    try {
    
      const response = await fetch(`${API_BASE_URL}/about`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const formattedData: AboutContent = {
            id: result.data.id || '1',
            title: result.data.title || 'About TourismHub',
            subtitle: result.data.subtitle || 'Your Gateway to Unforgettable Adventures',
            description: result.data.description || '',
            mission: result.data.mission || '',
            vision: result.data.vision || '',
            values: result.data.values || [],
            teamMembers: Array.isArray(result.data.teamMembers) 
              ? result.data.teamMembers.map((m: any) => ({
                  id: m.id,
                  name: m.name || 'Unknown',
                  role: 'Local Expert',
                  bio: m.bio || `Specialized in providing amazing travel experiences`,
                  imageUrl: m.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'Provider')}&background=2196F3&color=fff`,
                  email: m.email || '',
                  activityCount: m.activityCount || 0
                }))
              : [],
            contactEmail: result.data.contactEmail || 'contact@tourismhub.com',
            contactPhone: result.data.contactPhone || '+1 (555) 123-4567',
            address: result.data.address || '123 Adventure Street',
            lastUpdated: result.data.lastUpdated || new Date().toISOString()
          };
          
          setAboutContent(formattedData);
        
          if (formattedData.teamMembers) {
            setSelectedProviders(formattedData.teamMembers.map(m => m.id));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const token = getAuthToken();
    
      const response = await fetch(`${API_BASE_URL}/about/providers`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const providersWithImages = result.data.map((provider: any) => ({
            id: provider.id,
            name: provider.name || provider.fullName || 'Unknown Provider',
            role: 'Local Expert',
            bio: provider.bio || 'Specialized in providing amazing travel experiences',
            imageUrl: provider.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name || 'Provider')}&background=2196F3&color=fff`,
            email: provider.email || '',
            activityCount: provider.activityCount || 0
          }));
          setProviders(providersWithImages);
        }
      } else {
       
        const usersResponse = await fetch(`${API_BASE_URL}/users?role=Provider`, {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });
        
        if (usersResponse.ok) {
          const data = await usersResponse.json();
          const providersWithImages = data.map((provider: any) => ({
            id: provider.id,
            name: provider.name || provider.fullName || 'Unknown Provider',
            role: 'Local Expert',
            bio: 'Specialized in providing amazing travel experiences',
            imageUrl: provider.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name || 'Provider')}&background=2196F3&color=fff`,
            email: provider.email || '',
            activityCount: 0
          }));
          setProviders(providersWithImages);
        }
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleSaveAbout = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('You need to be logged in as admin to save about content');
        router.push('/login?redirect=/admin');
        return;
      }

      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('User data not found. Please login again.');
        return;
      }
      
      const user = JSON.parse(userData);
      if (user.role !== 'Admin') {
        alert('Only administrators can update about content');
        return;
      }

      setSaving(true);

      const payload = {
        title: aboutContent.title || '',
        subtitle: aboutContent.subtitle || '',
        description: aboutContent.description || '',
        mission: aboutContent.mission || '',
        vision: aboutContent.vision || '',
        values: aboutContent.values || [],
        contactEmail: aboutContent.contactEmail || '',
        contactPhone: aboutContent.contactPhone || '',
        address: aboutContent.address || ''
      };

      console.log('Saving about content with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
        
          if (selectedProviders.length > 0) {
            try {
              const selectResponse = await fetch(`${API_BASE_URL}/about/providers/select`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(selectedProviders)
              });
              
              if (selectResponse.ok) {
                console.log('Providers selected successfully');
              }
            } catch (selectError) {
              console.warn('Could not save selected providers, but about content was saved:', selectError);
            }
          }
          
          setAboutContent(prev => ({
            ...prev,
            lastUpdated: new Date().toISOString()
          }));
          setEditing(false);
          alert('About content saved successfully!');
          fetchAboutContent();
        }
      } else {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        } else if (response.status === 403) {
          alert('Access denied. You need administrator privileges.');
        } else if (response.status === 404) {
      
          alert('Update feature not available in this version. About page shows data from database.');
        } else {
          throw new Error(`Failed to save about content: ${response.status} ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Error saving about content:', error);
      alert(`Failed to save about content. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddValue = () => {
    if (newValue.trim()) {
      setAboutContent(prev => ({
        ...prev,
        values: [...prev.values, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const handleRemoveValue = (index: number) => {
    setAboutContent(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const toggleProviderSelection = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const primaryColor = darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700';
  const primaryColorDisabled = darkMode ? 'bg-blue-800' : 'bg-blue-300';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">About Us Management</h1>
          <p className={textSecondary}>Manage the content of the About Us page</p>
          <p className={`text-sm mt-2 ${textSecondary}`}>
            <strong>Note:</strong> "Our Providers" section shows active providers from the system. 
            You can update the main about content below.
          </p>
        </div>

        <div className="flex justify-end gap-3 mb-8">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  fetchAboutContent();
                }}
                className={`px-6 py-3 rounded-lg border ${borderColor} ${textSecondary} hover:opacity-80 transition-all`}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAbout}
                disabled={saving}
                className={`px-6 py-3 rounded-lg text-white ${saving ? primaryColorDisabled : primaryColor} transition-all flex items-center gap-2`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className={`px-6 py-3 rounded-lg text-white ${primaryColor} flex items-center gap-2 transition-all hover:scale-105`}
            >
              <span>✏️</span>
              Edit Content
            </button>
          )}
        </div>

        <div className={`rounded-xl ${cardBg} p-6 shadow-lg`}>
          {editing ? (
            <div className="space-y-8">
              {/* Editable Form */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Title</label>
                  <input
                    type="text"
                    value={aboutContent.title}
                    onChange={(e) => setAboutContent({...aboutContent, title: e.target.value})}
                    className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="About TourismHub"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Subtitle</label>
                  <input
                    type="text"
                    value={aboutContent.subtitle}
                    onChange={(e) => setAboutContent({...aboutContent, subtitle: e.target.value})}
                    className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Your Gateway to Unforgettable Adventures"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Description</label>
                <textarea
                  value={aboutContent.description}
                  onChange={(e) => setAboutContent({...aboutContent, description: e.target.value})}
                  rows={4}
                  className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Write a compelling description about your company..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Our Mission</label>
                  <textarea
                    value={aboutContent.mission}
                    onChange={(e) => setAboutContent({...aboutContent, mission: e.target.value})}
                    rows={3}
                    className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="What is your company's mission?"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Our Vision</label>
                  <textarea
                    value={aboutContent.vision}
                    onChange={(e) => setAboutContent({...aboutContent, vision: e.target.value})}
                    rows={3}
                    className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="What is your company's vision for the future?"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Our Values</label>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
                    className={`flex-1 p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Add a company value"
                  />
                  <button
                    onClick={handleAddValue}
                    className={`px-6 py-3 rounded-lg text-white ${primaryColor} transition-all`}
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {aboutContent.values.map((value, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'} px-4 py-2 rounded-full`}
                    >
                      <span className={textColor}>{value}</span>
                      <button
                        onClick={() => handleRemoveValue(index)}
                        className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'} transition-colors`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Contact Email</label>
                  <input
                    type="email"
                    value={aboutContent.contactEmail}
                    onChange={(e) => setAboutContent({...aboutContent, contactEmail: e.target.value})}
                    className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="contact@tourismhub.com"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    value={aboutContent.contactPhone}
                    onChange={(e) => setAboutContent({...aboutContent, contactPhone: e.target.value})}
                    className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Address</label>
                  <input
                    type="text"
                    value={aboutContent.address}
                    onChange={(e) => setAboutContent({...aboutContent, address: e.target.value})}
                    className={`w-full p-3 rounded-lg ${inputBg} ${textColor} ${borderColor} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="123 Adventure Street, Tourism City, TC 10101"
                  />
                </div>
              </div>

              {/* Provider Selection */}
              <div className="pt-8 border-t border-gray-700">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4">Featured Providers (Optional)</h3>
                  <p className={`text-sm ${textSecondary} mb-4`}>
                    Select providers to feature in the "Our Providers" section. 
                    If no providers are selected, the system will show active providers automatically.
                  </p>
                  
                  {providers.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {providers.map((provider) => (
                        <div
                          key={provider.id}
                          onClick={() => toggleProviderSelection(provider.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedProviders.includes(provider.id)
                            ? `${darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'}`
                            : `${borderColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                <img 
                                  src={provider.imageUrl} 
                                  alt={provider.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2196F3&color=fff`;
                                  }}
                                />
                              </div>
                              {selectedProviders.includes(provider.id) && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold">{provider.name}</h4>
                              <p className={`text-sm ${textSecondary}`}>{provider.email}</p>
                              <p className="text-sm text-blue-500">Local Expert</p>
                              {provider.activityCount && provider.activityCount > 0 && (
                                <p className="text-xs text-green-500">{provider.activityCount} activities</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border ${borderColor}`}>
                      <p className={textSecondary}>No active providers found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="space-y-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">{aboutContent.title}</h1>
                <p className={`text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {aboutContent.subtitle}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className={`text-lg leading-relaxed ${textSecondary}`}>
                  {aboutContent.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className={`p-2 rounded-full ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>🎯</span>
                    Our Mission
                  </h3>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-green-50'} border-l-4 ${darkMode ? 'border-green-500' : 'border-green-400'}`}>
                    <p className={`leading-relaxed ${textSecondary}`}>
                      {aboutContent.mission}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>👁️</span>
                    Our Vision
                  </h3>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'} border-l-4 ${darkMode ? 'border-blue-500' : 'border-blue-400'}`}>
                    <p className={`leading-relaxed ${textSecondary}`}>
                      {aboutContent.vision}
                    </p>
                  </div>
                </div>
              </div>

              {aboutContent.values.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Our Values</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {aboutContent.values.map((value, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${borderColor} shadow-sm`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                          <span className="text-xl">💫</span>
                        </div>
                        <p className="font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Our Providers Preview */}
              <div>
                <h3 className="text-2xl font-bold mb-8 text-center">Our Expert Providers</h3>
                <p className={`text-center mb-8 max-w-3xl mx-auto ${textSecondary}`}>
                  Meet our team of dedicated local experts who create unforgettable experiences for our travelers.
                </p>
                
                {aboutContent.teamMembers && aboutContent.teamMembers.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {aboutContent.teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${borderColor} transition-all hover:shadow-xl hover:-translate-y-1`}
                      >
                        <div className={`h-48 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2196F3&color=fff`;
                            }}
                          />
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-lg mb-1">{member.name}</h4>
                          <p className={`font-semibold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {member.role || 'Local Expert'}
                          </p>
                          <p className={`text-sm ${textSecondary} mb-2`}>{member.bio}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {member.email}
                          </p>
                          {member.activityCount && member.activityCount > 0 && (
                            <p className="text-xs text-green-500 mt-2">{member.activityCount} activities</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border ${borderColor}`}>
                    <p className={textSecondary}>Providers will be automatically shown from the system</p>
                  </div>
                )}
              </div>

              {/* Contact Information Preview */}
              <div className={`rounded-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${borderColor}`}>
                <h3 className="text-2xl font-bold mb-8 text-center">Get In Touch</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                      <span className="text-2xl">✉️</span>
                    </div>
                    <h4 className="font-bold mb-2">Email</h4>
                    <p className={textSecondary}>{aboutContent.contactEmail}</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                      <span className="text-2xl">📞</span>
                    </div>
                    <h4 className="font-bold mb-2">Phone</h4>
                    <p className={textSecondary}>{aboutContent.contactPhone}</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                      <span className="text-2xl">📍</span>
                    </div>
                    <h4 className="font-bold mb-2">Address</h4>
                    <p className={textSecondary}>{aboutContent.address}</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-8 border-t border-gray-700">
                <p className={textSecondary}>
                  Last updated: {new Date(aboutContent.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutManagement;