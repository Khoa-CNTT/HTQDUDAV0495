import React, { useState, useEffect } from 'react';
import { getQuizById, submitQuizSubmission } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import QuestionCard from '../components/QuestionCard';

const TakeQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await getQuizById(id);
      setQuiz(response.quiz);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to load quiz. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-5">{error}</div>;
  }

  if (!quiz) {
    return <div className="text-center mt-5">Quiz not found</div>;
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
    // Check if all questions have been answered
    if (Object.keys(selectedOptions).length < quiz.questions.length) {
      const unansweredCount = quiz.questions.length - Object.keys(selectedOptions).length;
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      // Format answers for submission
      const answers = Object.entries(selectedOptions).map(([index, optionIndex]) => ({
        questionId: quiz.questions[parseInt(index)]._id,
        selectedOptionIndex: optionIndex
      }));
      
      const result = await submitQuizSubmission(id, answers);
      toast.success('Quiz submitted successfully!');
      setIsSubmitting(false);
      navigate(`/results/${result.data._id}`);
    } catch (error) {
      setIsSubmitting(false);
      setError('Failed to submit quiz. Please try again.');
      toast.error('Failed to submit quiz');
      console.error(error);
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>
      
      <div className="mb-4 text-sm text-gray-600">
        Question {currentQuestionIndex + 1} of {quiz.questions.length}
      </div>
      
      <QuestionCard 
        question={currentQuestion}
        selectedOption={selectedOptions[currentQuestionIndex]}
        onOptionSelect={handleOptionSelect}
      />
      
      <div className="flex justify-between mt-6">
        <button 
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button 
            onClick={handleNextQuestion}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz; 