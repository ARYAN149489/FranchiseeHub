import React from 'react';
import { Lock } from 'lucide-react';
import PasswordInput from '../../common/PasswordInput';
import SubmitButton from '../../common/SubmitButton';

export default function SecurityTab({ 
  passwordData, 
  setPasswordData, 
  showPasswords, 
  setShowPasswords, 
  loading, 
  onSubmit 
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-xl">
      <PasswordInput
        label="Current Password"
        value={passwordData.currentPassword}
        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
        icon={Lock}
        required
        showPassword={showPasswords.current}
        onToggleShow={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
      />

      <PasswordInput
        label="New Password"
        value={passwordData.newPassword}
        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
        icon={Lock}
        required
        minLength={6}
        showPassword={showPasswords.new}
        onToggleShow={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
      />

      <PasswordInput
        label="Confirm New Password"
        value={passwordData.confirmPassword}
        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
        icon={Lock}
        required
        showPassword={showPasswords.confirm}
        onToggleShow={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
      />

      <SubmitButton
        loading={loading}
        loadingText="Changing..."
        text="Change Password"
        icon={Lock}
      />

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 font-semibold">
          Password Requirements:
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Minimum 6 characters</li>
          <li>Use a mix of letters, numbers, and symbols</li>
          <li>Don't use common passwords</li>
        </ul>
      </div>
    </form>
  );
}
