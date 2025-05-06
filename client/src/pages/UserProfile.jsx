import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCamera, FiEdit2, FiLock, FiUser, FiMail, FiCalendar } from 'react-icons/fi';

const UserProfile = ({ user, updateUser }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
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
        setPreviewImage(userData.profilePicture || null);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Cannot load profile');
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must not exceed 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      try {
        // Create a canvas to compress the image
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Create a promise to handle image loading
        const loadImage = () => {
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
        };

        await loadImage();

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 400; // Reduced maximum dimension

        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        // Set canvas dimensions and draw image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels until we get a reasonable size
        let quality = 0.7;
        let base64Image = canvas.toDataURL('image/jpeg', quality);
        
        // Check if the base64 string is too long (more than 2MB)
        while (base64Image.length > 2 * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          base64Image = canvas.toDataURL('image/jpeg', quality);
        }

        if (base64Image.length > 2 * 1024 * 1024) {
          toast.error('Cannot compress image small enough. Please choose another image.');
          return;
        }
        
        setPreviewImage(base64Image);
        setFormData(prev => ({
          ...prev,
          profilePicture: base64Image
        }));

        // Clean up
        URL.revokeObjectURL(img.src);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Cannot process image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (!formData.displayName.trim()) {
        toast.error('Please enter a display name');
        setSaving(false);
        return;
      }

      // Kiểm tra kích thước của profilePicture
      if (formData.profilePicture && formData.profilePicture.length > 2 * 1024 * 1024) {
        toast.error('Image size is too large. Please try another image.');
        setSaving(false);
        return;
      }

      // Chuẩn bị dữ liệu để gửi lên server
      const updateData = {
        displayName: formData.displayName.trim(),
        profilePicture: formData.profilePicture || '' // Đảm bảo luôn có giá trị
      };

      console.log('Sending update data:', {
        displayName: updateData.displayName,
        profilePictureLength: updateData.profilePicture ? updateData.profilePicture.length : 0
      });

      const result = await updateUserProfile(updateData);
      
      if (result && result.user) {
        // Cập nhật thông tin user trong local storage nếu cần
        if (updateUser && typeof updateUser === 'function') {
          updateUser({
            ...user,
            displayName: result.user.displayName,
            profilePicture: result.user.profilePicture
          });
        }

        // Cập nhật lại state với dữ liệu mới từ server
        setFormData({
          displayName: result.user.displayName,
          profilePicture: result.user.profilePicture
        });
        setPreviewImage(result.user.profilePicture);
        
        toast.success('Profile updated successfully');
      } else {
        throw new Error('No response data from server');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Cannot update profile';
      
      if (error.response) {
        // Xử lý lỗi từ server
        errorMessage = error.response.data?.message || errorMessage;
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Xử lý lỗi kết nối
        errorMessage = 'Cannot connect to server';
        console.error('Network error:', error.request);
      } else {
        // Xử lý lỗi khác
        console.error('Error details:', error.message);
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-gray-800 mb-3"
              >
                Your Profile
              </motion.h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left column - Profile picture and basic info */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl">
                  <div className="relative group">
                    <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-6xl font-bold text-indigo-600">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FiCamera className="w-6 h-6" />
                    </motion.button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FiUser className="w-5 h-5" />
                      <span>{user.username}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FiMail className="w-5 h-5" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FiCalendar className="w-5 h-5" />
                      <span>Joined since {new Date(user.registrationDate || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Edit form */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <FiEdit2 className="mr-2" />
                    Edit Information
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        placeholder="Enter your display name"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This name will be shown to other users
                      </p>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => navigate('/change-password')}
                        className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200 shadow-lg flex items-center"
                      >
                        <FiLock className="mr-2" />
                        Change Password
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile; 