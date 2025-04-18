import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserQuizzes, deleteQuiz, getUserSubmissions, getPublicQuizzes } from '../services/api';
import QuizCard from '../components/QuizCard';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user's quizzes
        const quizzesResponse = await getUserQuizzes();
        if (!quizzesResponse.success) {
          throw new Error(quizzesResponse.message || 'Failed to load quizzes');
        }
        setQuizzes(quizzesResponse.data || []);
        
        // Get public quizzes
        const publicQuizzesResponse = await getPublicQuizzes();
        if (publicQuizzesResponse.success) {
          setPublicQuizzes(publicQuizzesResponse.data || []);
        }
        
        // Get submissions
        const submissionsResponse = await getUserSubmissions();
        setSubmissions(submissionsResponse.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        const response = await deleteQuiz(quizId);
        if (response.success) {
          setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId));
          toast.success('Quiz deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete quiz');
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error(error.message || 'Failed to delete quiz');
      }
    }
  };

  // Check if user is creator of a quiz
  const isCreator = (quiz) => {
    return quiz.createdBy === user?._id;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-8 p-4">
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'quizzes' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('quizzes')}
        >
          My Quizzes
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'public' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('public')}
        >
          Public Quizzes
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'submissions' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('submissions')}
        >
          My Submissions
        </button>
      </div>
      
      {activeTab === 'quizzes' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My Quizzes</h2>
            <Link 
              to="/upload" 
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create New Quiz
            </Link>
          </div>
          
          {Array.isArray(quizzes) && quizzes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">You haven't created any quizzes yet.</p>
              <Link 
                to="/upload" 
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
              >
                Create your first quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(quizzes) && quizzes.map(quiz => (
                <div key={quiz._id} className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {quiz.questions ? `${quiz.questions.length} questions` : 'Loading questions...'}
                  </p>
                  <div className="flex justify-between mt-4">
                    <Link 
                      to={`/quiz/${quiz._id}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      Take Quiz
                    </Link>
                    {isCreator(quiz) && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'public' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Public Quizzes</h2>
          
          {Array.isArray(publicQuizzes) && publicQuizzes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No public quizzes available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(publicQuizzes) && publicQuizzes.map(quiz => (
                <div key={quiz._id} className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {quiz.questions ? `${quiz.questions.length} questions` : 'Loading questions...'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Created by: {quiz.createdBy?.username || 'Unknown'}
                  </p>
                  <div className="flex justify-between mt-4">
                    <Link 
                      to={`/quiz/${quiz._id}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      Take Quiz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'submissions' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">My Submissions</h2>
          
          {Array.isArray(submissions) && submissions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">You haven't taken any quizzes yet.</p>
              <Link 
                to="/" 
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
              >
                Find Quizzes to Take
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Quiz</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(submissions) && submissions.map(submission => (
                    <tr key={submission._id} className="border-b">
                      <td className="px-4 py-2">{submission.quizTitle || 'Untitled Quiz'}</td>
                      <td className="px-4 py-2">
                        {submission.score !== undefined && submission.totalQuestions ? (
                          <>
                            {submission.score} / {submission.totalQuestions}
                            <span className="ml-2 text-sm text-gray-500">
                              ({Math.round((submission.score / submission.totalQuestions) * 100)}%)
                            </span>
                          </>
                        ) : (
                          'Score not available'
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {submission.completedAt ? 
                          new Date(submission.completedAt).toLocaleDateString() :
                          'Date not available'
                        }
                      </td>
                      <td className="px-4 py-2">
                        <Link 
                          to={`/results/${submission._id}`}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          View Results
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Multiplayer section */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Multiplayer Quizzes</h2>
        <p className="mb-4 text-gray-600">
          Challenge your friends or join public quiz rooms for a competitive experience.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">Create a Room</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a multiplayer room with one of your quizzes and invite others to join.
            </p>
            <button
              onClick={() => {
                // Check if we have quizzes available
                if (!Array.isArray(quizzes) || quizzes.length === 0) {
                  toast.error('You need to create a quiz first!');
                  setTimeout(() => navigate('/upload'), 1500);
                } else {
                  navigate('/create-room');
                }
              }}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Room
            </button>
          </div>
          
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="text-lg font-semibold mb-2">Join a Room</h3>
            <p className="text-sm text-gray-600 mb-4">
              Join an existing quiz room using a room code from another player.
            </p>
            <button
              onClick={() => navigate('/join-room')}
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 