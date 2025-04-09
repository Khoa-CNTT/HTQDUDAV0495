import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      toast.error('Missing reset token');
      navigate('/forgot-password');
      return;
    }
    
    setToken(tokenParam);
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      await resetPassword(token, formData.newPassword);
      setResetComplete(true);
      toast.success('Password reset successful. You can now log in with your new password.');
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMsg = error.response?.data?.message || 'Password reset failed. The link may have expired.';
      toast.error(errorMsg);
      
      // If token is invalid or expired, redirect to forgot password
      if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
        setTimeout(() => navigate('/forgot-password'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Password Reset Complete</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now log in using your new password.
          </p>
          <Link 
            to="/login" 
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Reset Password</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter new password"
          />
          <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Confirm new password"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        
        <div className="mt-4 text-center text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword; 