import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRetry, setShowRetry] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const verifyUserEmail = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');

      if (!token) {
        setError('Invalid verification link. Please check your email and use the complete verification link.');
        setLoading(false);
        return;
      }

      try {
        const response = await verifyEmail(token);

        if (response?.success) {
          if (response?.alreadyVerified) {
            toast.success('Your email is already verified!');
          } else {
            toast.success('Email verification successful!');
          }
        } else {
          throw new Error(response?.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Email verification failed. Please check your verification link and try again.';

        setError(errorMessage);
        toast.error(errorMessage);

        // If token expired, add a retry button
        if (errorMessage.includes('expired')) {
          setShowRetry(true);
        }
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
            {showRetry ? (
              <Link
                to="/register"
                className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Register Again
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Go to Login
              </Link>
            )}
            <Link
              to="/help/verify-email"
              className="inline-block bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Need Help?
            </Link>
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
        <div className="space-y-4">
          <p className="text-gray-600">
            Your account is now active and ready to use. You can create and take quizzes, track your progress, and more!
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
            <p>What's next?</p>
            <ul className="list-disc list-inside mt-2 text-left">
              <li>Log in to your account</li>
              <li>Complete your profile</li>
              <li>Start exploring quizzes</li>
            </ul>
          </div>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;