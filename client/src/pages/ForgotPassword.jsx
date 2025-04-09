import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email.');
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>. Please check your email 
            and follow the link to reset your password.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            If you don't see the email, please check your spam folder.
          </p>
          <Link 
            to="/login" 
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Forgot Password</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your registered email"
          />
          <p className="text-sm text-gray-500 mt-2">
            We'll send you a link to reset your password.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
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

export default ForgotPassword; 