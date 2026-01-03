import React from 'react';
import { User, Save } from 'lucide-react';
import FormInput from '../../common/FormInput';
import SubmitButton from '../../common/SubmitButton';

export default function AdminProfileTab({ 
  profileData, 
  setProfileData, 
  loading, 
  onSubmit 
}) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Profile</h2>
      
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <FormInput
            label="First Name"
            type="text"
            value={profileData.fname}
            onChange={(e) => setProfileData({ ...profileData, fname: e.target.value })}
            icon={User}
            required
          />

          <FormInput
            label="Last Name"
            type="text"
            value={profileData.lname}
            onChange={(e) => setProfileData({ ...profileData, lname: e.target.value })}
            icon={User}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-600">
            {profileData.email}
          </div>
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
      </div>

      <SubmitButton
        loading={loading}
        loadingText="Saving..."
        text="Save Changes"
        icon={Save}
        className="mt-6 w-auto"
      />
    </form>
  );
}
