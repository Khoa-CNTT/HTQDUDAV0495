import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEdit,
  FaLock,
  FaEnvelope,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="mb-8 overflow-hidden bg-white shadow-xl rounded-2xl">
            <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
            </div>
            <div className="relative px-6 py-8">
              <div className="absolute -top-16 left-6">
                <div className="flex items-center justify-center w-32 h-32 border-4 border-white rounded-full shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                  <FaUser className="w-16 h-16 text-indigo-600" />
                </div>
              </div>
              <div className="ml-36">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  {user?.name || "User Name"}
                </h1>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaEnvelope className="text-indigo-600" />
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-6 bg-white shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Account Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-indigo-600 transition-colors rounded-lg bg-indigo-50 hover:bg-indigo-100"
                >
                  <FaEdit />
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 text-gray-700 transition-all bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                      <FaUser className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {user?.name || "User Name"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <FaEnvelope className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                      <FaCalendarAlt className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">January 2024</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Security Settings */}
              <div className="p-6 bg-white shadow-xl rounded-2xl">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <button className="flex items-center w-full gap-3 p-4 transition-all border border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                      <FaLock className="text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        Change Password
                      </p>
                      <p className="text-sm text-gray-500">
                        Update your account password
                      </p>
                    </div>
                  </button>
                  <button className="flex items-center w-full gap-3 p-4 transition-all border border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <FaEnvelope className="text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        Email Preferences
                      </p>
                      <p className="text-sm text-gray-500">
                        Manage your email notifications
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 bg-white border border-red-100 shadow-xl rounded-2xl">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Danger Zone
                </h2>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 p-4 text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                    <FaSignOutAlt className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Logout</p>
                    <p className="text-sm">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
