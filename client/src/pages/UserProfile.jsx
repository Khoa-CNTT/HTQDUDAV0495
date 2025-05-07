import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiCamera,
  FiEdit2,
  FiLock,
  FiUser,
  FiMail,
  FiCalendar,
} from "react-icons/fi";

const DEFAULT_PROFILE_IMAGE = "https://cdn-icons-png.flaticon.com/512/147/147144.png";

const UserProfile = ({ user, updateUser }) => {
  const [formData, setFormData] = useState({
    displayName: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Load user profile data
    const loadProfile = async () => {
      try {
        const userData = await getUserProfile();
        console.log("Loaded profile data:", userData); // Debug log

        setFormData({
          displayName: userData.displayName || "",
          profilePicture: userData.profilePicture || "",
        });

        // Set preview image based on user's profile picture or default
        if (userData.profilePicture && userData.profilePicture !== DEFAULT_PROFILE_IMAGE) {
          // Ensure the URL is absolute
          const imageUrl = userData.profilePicture.startsWith('http') 
            ? userData.profilePicture 
            : `http://localhost:5000/${userData.profilePicture}`;
            
          console.log("Setting profile image URL:", imageUrl); // Debug log
          setPreviewImage(imageUrl);
          setImageError(false);
        } else {
          setPreviewImage(DEFAULT_PROFILE_IMAGE);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Cannot load profile");
        setPreviewImage(DEFAULT_PROFILE_IMAGE);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleImageError = () => {
    console.log("Image load error, falling back to default"); // Debug log
    setImageError(true);
    setPreviewImage(DEFAULT_PROFILE_IMAGE);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must not exceed 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      try {
        // Create FormData object
        const formData = new FormData();
        formData.append("profilePicture", file);
        formData.append("displayName", formData.displayName || "");

        // Update preview immediately
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        setImageError(false);

        // Upload image to server
        const result = await updateUserProfile(formData);
        console.log("Upload result:", result); // Debug log

        if (result && result.user) {
          // Update user context if available
          if (updateUser && typeof updateUser === "function") {
            updateUser({
              ...user,
              profilePicture: result.user.profilePicture,
            });
          }

          // Update form data with the new image path
          setFormData(prev => ({
            ...prev,
            profilePicture: result.user.profilePicture
          }));

          // Update preview with the server URL
          const imageUrl = result.user.profilePicture.startsWith('http')
            ? result.user.profilePicture
            : `http://localhost:5000/${result.user.profilePicture}`;
            
          console.log("Setting new profile image URL:", imageUrl); // Debug log
          setPreviewImage(imageUrl);
          setImageError(false);

          toast.success("Profile picture updated successfully");
        }

        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);

      } catch (error) {
        console.error("Error updating profile picture:", error);
        toast.error(error.response?.data?.message || "Failed to update profile picture");
        // Revert preview if update fails
        setPreviewImage(formData.profilePicture || DEFAULT_PROFILE_IMAGE);
        setImageError(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate display name
      if (!formData.displayName.trim()) {
        toast.error("Please enter a display name");
        setSaving(false);
        return;
      }

      // Create FormData object
      const updateFormData = new FormData();
      updateFormData.append("displayName", formData.displayName.trim());
      
      // Only append profilePicture if it's a File object
      if (formData.profilePicture instanceof File) {
        updateFormData.append("profilePicture", formData.profilePicture);
      }

      const result = await updateUserProfile(updateFormData);

      if (result && result.user) {
        // Update user context if available
        if (updateUser && typeof updateUser === "function") {
          updateUser({
            ...user,
            displayName: result.user.displayName,
            profilePicture: result.user.profilePicture,
          });
        }

        // Update local state
        setFormData({
          displayName: result.user.displayName,
          profilePicture: result.user.profilePicture,
        });

        // Update preview with the server URL
        const imageUrl = result.user.profilePicture.startsWith('http')
          ? result.user.profilePicture
          : `http://localhost:5000/${result.user.profilePicture}`;
          
        setPreviewImage(imageUrl);
        setImageError(false);

        toast.success("Profile updated successfully");
      } else {
        throw new Error("No response data from server");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMessage = "Cannot update profile";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Cannot connect to server";
      }

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <div className="w-16 h-16 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-3xl">
          <div className="p-8 md:p-10">
            <div className="mb-10 text-center">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3 text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"
              >
                Your Profile
              </motion.h1>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Left column - Profile picture and basic info */}
              <div className="md:col-span-1">
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                  <div className="relative group">
                    <div className="w-48 h-48 mx-auto overflow-hidden border-4 border-white rounded-full shadow-lg">
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        onError={handleImageError}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-3 text-white transition-colors bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:from-indigo-700 hover:to-purple-700"
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
                      <span>
                        Joined since{" "}
                        {new Date(
                          user.registrationDate || Date.now()
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Edit form */}
              <div className="md:col-span-2">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
                  <h2 className="flex items-center mb-6 text-xl font-semibold text-gray-800">
                    <FiEdit2 className="mr-2" />
                    Edit Information
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="displayName"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        placeholder="Enter your display name"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        This name will be shown to other users
                      </p>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => navigate("/change-password")}
                        className="flex items-center px-6 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border-2 border-gray-200 shadow-lg rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                      >
                        <FiLock className="mr-2" />
                        Change Password
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? "Saving..." : "Save Changes"}
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
