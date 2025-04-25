import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import toast from 'react-hot-toast';

const Login = ({ login: loginUser, user }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Redirect nếu đã đăng nhập → về dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(formData);
      loginUser(userData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
        if (errorMsg.includes('verify your email')) {
          errorMsg = 'Please verify your email before logging in.';
        }
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f0f3] to-[#d2f2f4] px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border-t-4 border-[#00b3b3]">
        <h2 className="text-3xl font-bold text-center text-[#00b3b3] mb-6">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Login to your QuizWhiz account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g. your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b3b3] focus:border-[#00b3b3]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b3b3] focus:border-[#00b3b3]"
            />
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-sm text-[#00b3b3] hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00b3b3] text-white rounded-md font-semibold hover:bg-[#009999] transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-gray-600">
            Don’t have an account?{' '}
            <Link to="/register" className="text-[#00b3b3] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
