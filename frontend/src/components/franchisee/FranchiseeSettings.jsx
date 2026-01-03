import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Lock } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import TabNavigation from '../common/TabNavigation';
import AlertMessage from '../common/AlertMessage';
import ProfileTab from './settings/ProfileTab';
import SecurityTab from './settings/SecurityTab';

export default function FranchiseeSettings({ email }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Profile edit state
  const [profileData, setProfileData] = useState({
    fname: '',
    lname: '',
    phone: '',
    res_address: '',
    buis_name: '',
    site_address: '',
    site_city: '',
    site_postal: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [email]);

  const fetchProfile = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/profile`, { email });
      if (response.data.stat) {
        const data = response.data.doc;
        setProfile(data);
        setProfileData({
          fname: data.fname || '',
          lname: data.lname || '',
          phone: data.phone || '',
          res_address: data.res_address || '',
          buis_name: data.buis_name || '',
          site_address: data.site_address || '',
          site_city: data.site_city || '',
          site_postal: data.site_postal || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/updateProfile`, {
        email,
        ...profileData
      });

      if (response.data.stat) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        fetchProfile();
      } else {
        setMessage({ type: 'error', text: response.data.msg || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Error updating profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/changePassword`, {
        email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.stat) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.data.msg || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Error changing password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-gray-700 to-slate-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <SettingsIcon size={32} />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-gray-200 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg">
          <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />

          <div className="p-8">
            <AlertMessage type={message.type} message={message.text} />

            {activeTab === 'profile' && (
              <ProfileTab
                email={email}
                profile={profile}
                profileData={profileData}
                setProfileData={setProfileData}
                loading={loading}
                onSubmit={handleProfileUpdate}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                showPasswords={showPasswords}
                setShowPasswords={setShowPasswords}
                loading={loading}
                onSubmit={handlePasswordChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
