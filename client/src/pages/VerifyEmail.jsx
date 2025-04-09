import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyUserEmail = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Missing verification token');
        setLoading(false);
        return;
      }
      
      try {
        await verifyEmail(token);
        toast.success('Email verification successful!');
        
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.response?.data?.message || 'Email verification failed. The link may have expired.');
        toast.error('Email verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyUserEmail();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col space-y-3">
            <Link 
              to="/login" 
              className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Go to Login
            </Link>
            <button 
              onClick={() => navigate('/register')}
              className="inline-block bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Create a New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for verifying your email address. Your account is now active, and you can access all features of the platform.
        </p>
        <p className="text-gray-500 mb-4">
          Redirecting to login page in 3 seconds...
        </p>
        <Link 
          to="/login" 
          className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Login Now
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail; 