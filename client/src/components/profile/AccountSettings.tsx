// components/profile/AccountSettings.tsx
'use client';

import React from 'react';

interface AccountSettingsProps {
  onDeleteAccount: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onDeleteAccount }) => {
  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <PasswordForm />
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <NotificationPreferences />
      </div>

      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        <p className="text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={onDeleteAccount}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

const PasswordForm: React.FC = () => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter current password"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter new password"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Confirm new password"
      />
    </div>
    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
      Update Password
    </button>
  </div>
);

const NotificationPreferences: React.FC = () => (
  <div className="space-y-3">
    <label className="flex items-center">
      <input type="checkbox" className="mr-3" defaultChecked />
      <span className="text-gray-700">Email notifications for new activities</span>
    </label>
    <label className="flex items-center">
      <input type="checkbox" className="mr-3" defaultChecked />
      <span className="text-gray-700">Booking confirmations and updates</span>
    </label>
    <label className="flex items-center">
      <input type="checkbox" className="mr-3" />
      <span className="text-gray-700">Marketing emails and promotions</span>
    </label>
    <label className="flex items-center">
      <input type="checkbox" className="mr-3" defaultChecked />
      <span className="text-gray-700">Activity reminders</span>
    </label>
  </div>
);
