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
    if (Object.keys(selectedOptions).length < quiz.questions.length) {
      const unansweredCount = quiz.questions.length - Object.keys(selectedOptions).length;
      if (!window.confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài không?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Format answers theo đúng cấu trúc server yêu cầu
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
        toast.success('Nộp bài thành công!');
        navigate(`/results/${result.submission._id}`);
      } else {
        throw new Error('Invalid submission result');
      }
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setIsSubmitting(false);
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
        onSelectOption={handleOptionSelect}
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