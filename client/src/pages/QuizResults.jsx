import React, { useState, useEffect } from 'react';
import { getSubmissionById } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizResults = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { submissionId } = useParams();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await getSubmissionById(submissionId);
        if (!response.success) {
          throw new Error(response.message || 'Failed to load results');
        }
        setResult(response.data);
      } catch (error) {
        console.error('Error fetching result:', error);
        setError(error.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 text-lg mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full">
          <p className="text-gray-800 text-lg mb-6">No results found</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate percentage if not provided
  const percentageScore = result.percentageScore ??
    (result.correctAnswers && result.totalQuestions ?
      (result.correctAnswers / result.totalQuestions) * 100 : 0);

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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {result.quizId?.title || 'Quiz Results'}
              </h1>
              <div className="flex items-center text-gray-600 space-x-4">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Attempt #{result.attemptNumber || 1}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(result.completedAt).toLocaleString()}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`p-8 rounded-xl mb-8 ${
                percentageScore >= 60 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
              }`}
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">
                  Your Score: {result.correctAnswers || 0} / {result.totalQuestions || 0}
                </h2>
                <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {percentageScore.toFixed(1)}%
                </div>
                <p className={`text-lg ${percentageScore >= 60 ? 'text-green-700' : 'text-red-700'}`}>
                  {percentageScore >= 60 
                    ? 'Congratulations! You passed the quiz!' 
                    : 'Keep practicing, you can do better!'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Question Details</h3>

              {result.answers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  className={`p-6 mb-4 rounded-xl ${
                    answer.isCorrect 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
                  }`}
                >
                  <div className="mb-4">
                    <span className="font-medium text-gray-800 text-lg">Question {index + 1}:</span>
                    <p className="mt-2 text-gray-700">{answer.question}</p>
                  </div>

                  <div className="ml-4 space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Your Answer:</span>
                      <p className={`mt-1 ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {answer.selectedOptionText || 'Not answered'}
                      </p>
                    </div>

                    {!answer.isCorrect && (
                      <div>
                        <span className="font-medium text-gray-700">Correct Answer:</span>
                        <p className="mt-1 text-green-600">{answer.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-4"
            >
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-300 shadow hover:shadow-md flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>

              <Link
                to={`/take-quiz/${result.quizId._id}`}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResults;