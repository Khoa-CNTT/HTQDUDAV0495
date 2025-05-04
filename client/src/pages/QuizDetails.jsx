import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizById, deleteQuiz } from '../services/api';
import toast from 'react-hot-toast';

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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Quiz not found or you don't have permission to view it.</p>
        <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">
          Go back to home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mt-2">{quiz.description}</p>
          )}
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <span className="mr-4">{quiz.questions.length} questions</span>
            {quiz.isPublic && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                Public
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          {isOwner && (
            <button
              onClick={handleDeleteQuiz}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}

          {user ? (
            <Link
              to={`/quiz/${id}/take`}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Take Quiz
            </Link>
          ) : (
            <Link
              to={`/login?redirect=/quiz/${id}/take`}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Login to Take Quiz
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <p className="text-gray-600 mb-4">
          This quiz contains {quiz.questions.length} questions. Here's a preview of the first question:
        </p>

        {quiz.questions.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="font-medium text-gray-800 mb-3">{quiz.questions[0].content}</p>
            <div className="space-y-2">
              {quiz.questions[0].options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Ready to test your knowledge?</h2>
        <p className="text-gray-700 mb-6">
          Take this quiz to challenge yourself and see how well you understand the material.
        </p>

        {user ? (
          <Link
            to={`/quiz/${id}/take`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-block"
          >
            Start Quiz Now
          </Link>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              You need to be logged in to take this quiz.
            </p>
            <Link
              to={`/login?redirect=/quiz/${id}/take`}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-block"
            >
              Login to Continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetails; 