import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizById, deleteQuiz } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaQuestionCircle,
  FaTrash,
  FaPlay,
  FaLock,
  FaUserAlt,
  FaListAlt
} from 'react-icons/fa';

const QuizDetails = ({ user }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('Fetching quiz with ID from URL params:', id);

        if (!id || id === 'undefined') {
          console.error('Invalid quiz ID detected:', id);
          toast.error('Invalid quiz ID');
          navigate('/not-found');
          return;
        }

        const data = await getQuizById(id);
        console.log('Quiz data received:', data);
        setQuiz(data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error(error.response?.data?.message || 'Failed to load quiz');
        if (error.response?.status === 404) {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteQuiz = async () => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(id);
        toast.success('Quiz deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error('Failed to delete quiz');
      }
    }
  };

  const isOwner = user && quiz?.createdBy && user._id === quiz.createdBy.toString();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-pink-200 text-lg font-orbitron">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <p className="text-pink-200 text-lg mb-6 font-orbitron">Quiz not found or you don't have permission to view it.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
            >
              Go back to dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated SVG background */}
      <svg
        className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(2px)" }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate
            attributeName="cx"
            values="80%;20%;80%"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate
            attributeName="cy"
            values="80%;20%;80%"
            dur="16s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-4 px-4 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              <FiArrowLeft className="w-6 h-6" />
            </motion.button>

            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaQuestionCircle className="inline-block text-yellow-300 animate-bounce" />
              Quiz Details
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 mb-8"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent mb-3 font-orbitron"
              >
                {quiz.title}
              </motion.h1>
              {quiz.description && (
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-pink-200 text-lg font-orbitron"
                >
                  {quiz.description}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center mt-4 space-x-4"
              >
                <span className="text-pink-300 flex items-center font-orbitron">
                  <FaListAlt className="w-5 h-5 mr-2 text-pink-400" />
                  {quiz.questions.length} questions
                </span>
                {quiz.isPublic && (
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center border border-green-500/40">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Public
                  </span>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {isOwner && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center font-orbitron"
                >
                  <FaTrash className="w-5 h-5 mr-2" />
                  Delete
                </motion.button>
              )}

              {user ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/take-quiz/${id}`}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center font-orbitron"
                  >
                    <FaPlay className="w-5 h-5 mr-2" />
                    Take Quiz
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/login?redirect=/take-quiz/${id}`}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center font-orbitron"
                  >
                    <FaLock className="w-5 h-5 mr-2" />
                    Login to Take Quiz
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">Preview</h2>
            <p className="text-pink-200 mb-6 font-orbitron">
              This quiz contains {quiz.questions.length} questions. Here's a preview of the first question:
            </p>

            {quiz.questions.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-pink-400/20">
                <p className="font-medium text-pink-100 text-lg mb-4">{quiz.questions[0].content}</p>
                <div className="space-y-3">
                  {quiz.questions[0].options.map((option, index) => (
                    <div key={index} className="flex items-center p-3 bg-white/5 border border-white/10 rounded-lg">
                      <span className="font-medium text-yellow-300 mr-3">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-pink-200">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">Ready to test your knowledge?</h2>
            <p className="text-pink-200 mb-6 text-lg font-orbitron">
              Take this quiz to challenge yourself and see how well you understand the material.
            </p>

            {user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/take-quiz/${id}`}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
                >
                  <FaPlay className="w-6 h-6 mr-2" />
                  Start Quiz Now
                </Link>
              </motion.div>
            ) : (
              <div>
                <p className="text-pink-200 mb-4 text-lg font-orbitron">
                  You need to be logged in to take this quiz.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/login?redirect=/take-quiz/${id}`}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
                  >
                    <FaUserAlt className="w-6 h-6 mr-2" />
                    Login to Continue
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizDetails;