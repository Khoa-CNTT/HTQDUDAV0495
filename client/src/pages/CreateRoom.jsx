import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, getPublicQuizzes, getUserQuizzes } from '../services/api';
import toast from 'react-hot-toast';

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
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center mt-4">Loading quizzes...</p>
      </div>
    );
  }

  if (roomCreated) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold">Room Created Successfully!</h1>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-center font-bold text-xl mb-2">Your Room Code</p>
          <div className="flex justify-center items-center space-x-2">
            <span className="text-2xl tracking-wider bg-white px-4 py-2 rounded border">{roomCode}</span>
            <button 
              onClick={() => copyInviteLink()}
              className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              title="Copy invite link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Share this code with participants or use the button to copy an invite link
          </p>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleJoinCreatedRoom}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Join Room Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create a Multiplayer Room</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4 flex">
        <button
          type="button"
          className={`flex-1 py-2 px-4 ${!showMyQuizzes ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-l`}
          onClick={() => setShowMyQuizzes(false)}
        >
          Public Quizzes
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 ${showMyQuizzes ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-r`}
          onClick={() => setShowMyQuizzes(true)}
        >
          My Quizzes
        </button>
      </div>
      
      <form onSubmit={handleCreateRoom}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="quiz">
            Select Quiz
          </label>
          <select
            id="quiz"
            className="w-full p-2 border rounded"
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
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="maxParticipants">
            Maximum Participants
          </label>
          <input
            type="number"
            id="maxParticipants"
            className="w-full p-2 border rounded"
            min="2"
            max="50"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="timeLimit">
            Time Limit (seconds per question)
          </label>
          <input
            type="number"
            id="timeLimit"
            className="w-full p-2 border rounded"
            min="10"
            max="300"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="inviteEmails">
            Invite Users (optional)
          </label>
          <textarea
            id="inviteEmails"
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Enter email addresses separated by commas"
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            Users will receive an email invitation with the room code
          </p>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRoom; 