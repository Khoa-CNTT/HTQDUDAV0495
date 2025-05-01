import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, getPublicQuizzes, getUserQuizzes } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function CreateRoom({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [timeLimit, setTimeLimit] = useState(60);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  
  const navigate = useNavigate();

  // Fetch available quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError('');

        // Decide whether to show user's quizzes or public quizzes
        const response = showMyQuizzes
          ? await getUserQuizzes()
          : await getPublicQuizzes();

        if (response.success) {
          setQuizzes(response.data || []);
        } else {
          setError(response.message || 'Failed to load quizzes');
          setQuizzes([]);
        }
      } catch (error) {
        setError('Failed to load quizzes');
        console.error('Error fetching quizzes:', error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [showMyQuizzes]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!selectedQuiz) {
      setError('Please select a quiz');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      const inviteList = inviteEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      const response = await createRoom(selectedQuiz, {
        maxParticipants,
        timeLimit,
        invites: inviteList,
        hostId: user._id
      });
      
      if (response.success) {
        toast.success('Room created successfully!');
        // Set room code for copying/sharing
        setRoomCode(response.data.code);
        setRoomCreated(true);
      } else {
        setError(response.message || 'Failed to create room');
      }
    } catch (error) {
      setError('Error creating room');
      console.error('Error creating room:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCreatedRoom = () => {
    navigate(`/room/${roomCode}`);
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-room?code=${roomCode}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => toast.success('Invite link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy invite link'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (roomCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Room Created Successfully!</h1>
              <p className="text-gray-600 mb-6">Share the room code with your participants</p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Room Code</p>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl font-bold tracking-wider bg-white px-6 py-3 rounded-lg border-2 border-gray-200">
                    {roomCode}
                  </span>
                  <button 
                    onClick={copyInviteLink}
                    className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                    title="Copy invite link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Click the copy button to share an invite link
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleJoinCreatedRoom}
                  className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Join Room Now
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Create a Room</h1>
              <p className="text-gray-600">Set up a multiplayer quiz session</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            <div className="mb-6">
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    !showMyQuizzes ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setShowMyQuizzes(false)}
                >
                  Public Quizzes
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    showMyQuizzes ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setShowMyQuizzes(true)}
                >
                  My Quizzes
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRoom}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="quiz">
                  Select Quiz
                </label>
                <select
                  id="quiz"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                  required
                >
                  <option value="">-- Select a Quiz --</option>
                  {quizzes.length === 0 ? (
                    <option value="" disabled>
                      {showMyQuizzes ? 'You have not created any quizzes yet' : 'No public quizzes available'}
                    </option>
                  ) : (
                    quizzes.map((quiz) => (
                      <option key={quiz._id} value={quiz._id}>
                        {quiz.title} {quiz.category ? `(${quiz.category})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="maxParticipants">
                  Maximum Participants
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                  min="2"
                  max="50"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="timeLimit">
                  Time Limit (seconds per question)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                  min="10"
                  max="300"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="inviteEmails">
                  Invite Users (optional)
                </label>
                <textarea
                  id="inviteEmails"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                  rows="3"
                  placeholder="Enter email addresses separated by commas"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    "Create Room"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateRoom; 