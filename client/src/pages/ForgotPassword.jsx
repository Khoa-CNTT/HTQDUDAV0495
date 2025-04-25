import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf6f6]">
        <div className="bg-white p-8 rounded-xl shadow-md text-center w-full max-w-md">
          <h2 className="text-2xl font-bold text-teal-600 mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We’ve sent reset instructions to <strong>{email}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">Check spam if it doesn’t appear soon.</p>
          <Link to="/login" className="inline-block bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf6f6]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-teal-600 text-center mb-6">Reset Your Password</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-blue-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>
        <div className="text-center text-sm text-gray-600 mt-4">
          Remembered your password?{' '}
          <Link to="/login" className="text-teal-600 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
