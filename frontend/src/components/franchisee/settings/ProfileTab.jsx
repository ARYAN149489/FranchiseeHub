import React from 'react';
import { User, Mail, Phone, Building, Save } from 'lucide-react';
import FormInput from '../../common/FormInput';
import SubmitButton from '../../common/SubmitButton';

export default function ProfileTab({ 
  email, 
  profile,
  profileData, 
  setProfileData, 
  loading, 
  onSubmit 
}) {
  if (!profile) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
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

        <FormInput
          label="Email (Cannot be changed)"
          type="email"
          value={email}
          icon={Mail}
          disabled
        />

        <FormInput
          label="Phone Number"
          type="tel"
          value={profileData.phone}
          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
          icon={Phone}
        />

        <div className="md:col-span-2">
          <FormInput
            label="Business Name"
            type="text"
            value={profileData.buis_name}
            onChange={(e) => setProfileData({ ...profileData, buis_name: e.target.value })}
            icon={Building}
          />
        </div>

        <div className="md:col-span-2">
          <FormInput
            label="Residential Address"
            type="textarea"
            value={profileData.res_address}
            onChange={(e) => setProfileData({ ...profileData, res_address: e.target.value })}
            rows={2}
          />
        </div>

        <div className="md:col-span-2">
          <FormInput
            label="Site Address"
            type="textarea"
            value={profileData.site_address}
            onChange={(e) => setProfileData({ ...profileData, site_address: e.target.value })}
            rows={2}
          />
        </div>

        <FormInput
          label="City"
          type="text"
          value={profileData.site_city}
          onChange={(e) => setProfileData({ ...profileData, site_city: e.target.value })}
        />

        <FormInput
          label="Postal Code"
          type="text"
          value={profileData.site_postal}
          onChange={(e) => setProfileData({ ...profileData, site_postal: e.target.value })}
        />
      </div>

      <SubmitButton
        loading={loading}
        loadingText="Saving..."
        text="Save Changes"
        icon={Save}
      />
    </form>
  );
}
