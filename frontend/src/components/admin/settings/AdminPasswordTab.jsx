import React from 'react';
import { Lock } from 'lucide-react';
import PasswordInput from '../../common/PasswordInput';
import SubmitButton from '../../common/SubmitButton';

export default function AdminPasswordTab({ 
  passwordData, 
  setPasswordData, 
  showCurrentPassword,
  showNewPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  loading, 
  onSubmit 
}) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
      
      <div className="space-y-5">
        <PasswordInput
          label="Current Password"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
          icon={Lock}
          required
          showPassword={showCurrentPassword}
          onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
        />

        <div>
          <PasswordInput
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            icon={Lock}
            required
            minLength={6}
            showPassword={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
          />
          <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters long</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm New Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            required
          />
        </div>
      </div>

      <SubmitButton
        loading={loading}
        loadingText="Changing Password..."
        text="Change Password"
        icon={Lock}
        className="mt-6 w-auto"
      />
    </form>
  );
}
