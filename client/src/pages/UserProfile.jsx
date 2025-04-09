import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';
import toast from 'react-hot-toast';

const UserProfile = ({ user, updateUser }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user profile data
    const loadProfile = async () => {
      try {
        const userData = await getUserProfile();
        setFormData({
          displayName: userData.displayName || '',
          profilePicture: userData.profilePicture || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateUserProfile(formData);
      
      // Update local user data
      if (updateUser && typeof updateUser === 'function') {
        updateUser({
          ...user,
          displayName: result.user.displayName,
          profilePicture: result.user.profilePicture
        });
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* User info summary */}
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
          <div className="bg-indigo-100 text-indigo-700 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
            {formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              user.username?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">Member since {new Date(user.registrationDate || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Edit profile form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-gray-700 font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your display name"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is how your name will appear to other users
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="profilePicture" className="block text-gray-700 font-medium mb-2">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="profilePicture"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/your-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a URL to an image (we'll add image upload in a future update)
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Account section */}
      <div className="bg-white p-8 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => navigate('/change-password')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 