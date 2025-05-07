import React, { useState, useEffect } from 'react';
import { getQuizById, submitQuizSubmission } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import QuestionCard from '../components/QuestionCard';
import { motion } from 'framer-motion';

const TakeQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      if (!quizId) {
        setError('Quiz ID is required');
        setLoading(false);
        return;
      }

      const response = await getQuizById(quizId);
      if (!response) {
        throw new Error('Failed to load quiz');
      }
      setQuiz(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError(error.message || 'Failed to load quiz. Please try again.');
      setLoading(false);
    }
  };

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
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full">
          <p className="text-gray-800 text-lg mb-6">Quiz not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleOptionSelect = (optionIndex) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedOptions).length < quiz.questions.length) {
      const unansweredCount = quiz.questions.length - Object.keys(selectedOptions).length;
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const answers = quiz.questions.map((question, index) => {
        const selectedOptionIndex = selectedOptions[index];
        const selectedOption = selectedOptionIndex !== undefined ? question.options[selectedOptionIndex] : null;

        return {
          questionId: question._id,
          selectedAnswer: selectedOption ? selectedOption._id : null,
          selectedOptionText: selectedOption ? selectedOption.label : null,
          question: question.content
        };
      }).filter(answer => answer.selectedAnswer !== null);

      const result = await submitQuizSubmission(quizId, answers);

      if (result.submission && result.submission._id) {
        toast.success('Quiz submitted successfully!');
        navigate(`/results/${result.submission._id}`);
      } else {
        throw new Error('Invalid submission result');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.message || 'An error occurred while submitting the quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

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
                {quiz.title}
              </h1>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <QuestionCard
                question={currentQuestion}
                selectedOption={selectedOptions[currentQuestionIndex]}
                onSelectOption={handleOptionSelect}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-between"
            >
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-300 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Quiz
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                >
                  Next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TakeQuiz;