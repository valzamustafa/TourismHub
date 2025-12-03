// components/profile/AccountSettings.tsx
'use client';

import React from 'react';
import { ChangePasswordForm } from './ChangePassword';

interface AccountSettingsProps {
  onDeleteAccount: () => void;
  userId: string;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ 
  onDeleteAccount,
  userId 
}) => {
  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

        <ChangePasswordForm userId={userId} />
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
)