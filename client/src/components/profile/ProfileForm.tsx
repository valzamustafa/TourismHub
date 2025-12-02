// components/profile/ProfileForm.tsx
'use client';

import React from 'react';

interface ProfileFormProps {
  data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    bio: string;
    preferences: string[];
  };
  onChange: (data: ProfileFormProps['data']) => void;
  editing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

const preferenceOptions = [
  'Adventure',
  'Culture',
  'Nature',
  'Beach',
  'Mountain',
  'City Tours',
  'Food & Drink',
  'History',
  'Photography',
  'Wildlife'
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  data,
  onChange,
  editing,
  onSave,
  onCancel,
  onEdit
}) => {
  const handleChange = (field: keyof typeof data, value: string | string[]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const togglePreference = (preference: string) => {
    const newPreferences = data.preferences.includes(preference)
      ? data.preferences.filter(p => p !== preference)
      : [...data.preferences, preference];
    handleChange('preferences', newPreferences);
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={data.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
          <div className="flex flex-wrap gap-2">
            {preferenceOptions.map((preference) => (
              <button
                key={preference}
                type="button"
                onClick={() => togglePreference(preference)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  data.preferences.includes(preference)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preference}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField label="Full Name" value={data.fullName} />
        <InfoField label="Email" value={data.email} />
        <InfoField label="Phone" value={data.phone || 'Not provided'} />
        <InfoField label="Address" value={data.address || 'Not provided'} />
      </div>

      {data.bio && <InfoField label="Bio" value={data.bio} multiline />}

      {data.preferences.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-500 mb-1">Interests & Preferences</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.preferences.map((pref, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {pref}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

const InfoField: React.FC<{ label: string; value: string; multiline?: boolean }> = ({ 
  label, 
  value, 
  multiline = false 
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    {multiline ? (
      <p className="text-gray-900 whitespace-pre-line">{value}</p>
    ) : (
      <p className="text-gray-900 font-semibold">{value}</p>
    )}
  </div>
);