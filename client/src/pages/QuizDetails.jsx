import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizById, deleteQuiz } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const QuizDetails = ({ user }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full">
          <p className="text-gray-600 text-lg mb-6">Quiz not found or you don't have permission to view it.</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>

      <div className="relative max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3"
                >
                  {quiz.title}
                </motion.h1>
                {quiz.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-gray-600 text-lg"
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
                  <span className="text-gray-500 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {quiz.questions.length} questions
                  </span>
                  {quiz.isPublic && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
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
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back to Dashboard
                </Link>
                {isOwner && (
                  <button
                    onClick={handleDeleteQuiz}
                    className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}

                {user ? (
                  <Link
                    to={`/take-quiz/${id}`}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Take Quiz
                  </Link>
                ) : (
                  <Link
                    to={`/login?redirect=/take-quiz/${id}`}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Take Quiz
                  </Link>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Preview</h2>
              <p className="text-gray-600 mb-6">
                This quiz contains {quiz.questions.length} questions. Here's a preview of the first question:
              </p>

              {quiz.questions.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="font-medium text-gray-800 text-lg mb-4">{quiz.questions[0].content}</p>
                  <div className="space-y-3">
                    {quiz.questions[0].options.map((option, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-indigo-600 mr-3">{String.fromCharCode(65 + index)}.</span>
                        <span className="text-gray-700">{option.label}</span>
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
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to test your knowledge?</h2>
              <p className="text-gray-700 mb-6 text-lg">
                Take this quiz to challenge yourself and see how well you understand the material.
              </p>

              {user ? (
                <Link
                  to={`/take-quiz/${id}`}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Quiz Now
                </Link>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4 text-lg">
                    You need to be logged in to take this quiz.
                  </p>
                  <Link
                    to={`/login?redirect=/take-quiz/${id}`}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Continue
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizDetails;