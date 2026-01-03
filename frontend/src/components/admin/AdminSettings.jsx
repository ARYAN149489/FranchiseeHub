import { useState, useEffect } from 'react';
import { User, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import TabNavigation from '../common/TabNavigation';
import AlertMessage from '../common/AlertMessage';
import AdminProfileTab from './settings/AdminProfileTab';
import AdminPasswordTab from './settings/AdminPasswordTab';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile form
  const [profileData, setProfileData] = useState({
    fname: '',
    lname: '',
    email: ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const email = localStorage.getItem('email');
      const response = await axios.post(`${API_BASE_URL}/admin/getProfile`, { email });
      
      if (response.data.stat && response.data.doc) {
        setProfileData({
          fname: response.data.doc.fname || '',
          lname: response.data.doc.lname || '',
          email: response.data.doc.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const email = localStorage.getItem('email');
      const response = await axios.post(`${API_BASE_URL}/admin/updateProfile`, {
        email: email,
        fname: profileData.fname,
        lname: profileData.lname
      });

      if (response.data.stat) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Refresh profile data to ensure consistency
        await fetchAdminProfile();
      } else {
        setMessage({ type: 'error', text: response.data.msg || 'Update failed' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      return;
    }

    setLoading(true);

    try {
      const email = localStorage.getItem('email');
      const response = await axios.post(`${API_BASE_URL}/admin/changePassword`, {
        email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.stat) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: response.data.msg || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' }); // Clear messages when switching tabs
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Settings</h1>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' && <CheckCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />

        <div className="p-6 md:p-8">
          {activeTab === 'profile' && (
            <AdminProfileTab
              profileData={profileData}
              setProfileData={setProfileData}
              loading={loading}
              onSubmit={handleProfileUpdate}
            />
          )}

          {activeTab === 'password' && (
            <AdminPasswordTab
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              showCurrentPassword={showCurrentPassword}
              showNewPassword={showNewPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              setShowNewPassword={setShowNewPassword}
              loading={loading}
              onSubmit={handlePasswordChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
