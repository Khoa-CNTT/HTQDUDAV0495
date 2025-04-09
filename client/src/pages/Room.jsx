import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRoomByCode, getRoomParticipants, startRoom, endRoom, submitAnswer } from '../services/api';
import RoomChat from '../components/RoomChat';

// Helper functions to safely extract user information
const getUserId = (user) => {
  if (!user) return '';
  return typeof user === 'object' ? user._id : user;
};

const getUserName = (user) => {
  if (!user) return 'Unknown';
  if (typeof user === 'object') {
    return user.displayName || user.username || 'Unknown';
  }
  return user.toString();
};

const getUserInitial = (user) => {
  if (!user) return '?';
  if (typeof user === 'object' && user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  return '?';
};

function Room({ user }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [timer, setTimer] = useState(null);
  const [isHost, setIsHost] = useState(false);
  
  // Fetch room and participants data
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Extract room code from URL if needed
      const actualCode = code || location.pathname.split('/').pop();
      console.log('Using room code:', actualCode);
      
      // Check if code is undefined or invalid
      if (!actualCode || actualCode === 'undefined') {
        console.error('Invalid room code:', actualCode);
        setError('Invalid room code. Please try again.');
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      
      const roomResponse = await getRoomByCode(actualCode);
      if (!roomResponse.success) {
        throw new Error(roomResponse.message || 'Failed to load room');
      }
      
      setRoom(roomResponse.data);
      
      // Make sure quizId exists and set it safely
      if (roomResponse.data && roomResponse.data.quizId) {
        setQuiz(roomResponse.data.quizId);
      } else {
        console.error('Quiz data missing in room response');
        setQuiz(null);
      }
      
      // Use the helper function to safely extract user ID
      const hostId = getUserId(roomResponse.data.hostId);
      setIsHost(hostId === user._id);
      
      const participantsResponse = await getRoomParticipants(actualCode);
      if (participantsResponse.success) {
        setParticipants(participantsResponse.data);
      }
    } catch (error) {
      setError('Error loading room data');
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Extract room code from URL if needed
    const actualCode = code || location.pathname.split('/').pop();
    console.log('Room component initialized with code:', actualCode);
    
    // Check if code is undefined before fetching data
    if (!actualCode || actualCode === 'undefined') {
      console.error('Invalid room code in useEffect:', actualCode);
      setError('Invalid room code. Redirecting to dashboard...');
      // Redirect to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    
    fetchRoomData();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      if (!loading) {
        fetchRoomData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [code, location.pathname, navigate]);

  // Handle timer when room is in progress
  useEffect(() => {
    if (room && room.status === 'in_progress') {
      if (!timer && room.timeLimit) {
        setRemaining(room.timeLimit);
        
        const countdownTimer = setInterval(() => {
          setRemaining(prev => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              // Auto-submit if time is up and answer not submitted
              if (!answerSubmitted && quiz && quiz.questions[currentQuestion]) {
                handleSubmitAnswer(null);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setTimer(countdownTimer);
        return () => clearInterval(countdownTimer);
      }
    }
  }, [room, currentQuestion, answerSubmitted]);

  // Start the game (host only)
  const handleStartGame = async () => {
    try {
      setError('');
      // Get the actual room code
      const actualCode = code || location.pathname.split('/').pop();
      const response = await startRoom(actualCode);
      
      if (response.success) {
        setRoom(response.data);
      } else {
        setError(response.message || 'Failed to start game');
      }
    } catch (error) {
      setError('Error starting game');
      console.error('Error starting game:', error);
    }
  };

  // End the game (host only)
  const handleEndGame = async () => {
    try {
      setError('');
      // Get the actual room code
      const actualCode = code || location.pathname.split('/').pop();
      const response = await endRoom(actualCode);
      
      if (response.success) {
        setRoom(response.data.room);
        setParticipants(response.data.participants);
      } else {
        setError(response.message || 'Failed to end game');
      }
    } catch (error) {
      setError('Error ending game');
      console.error('Error ending game:', error);
    }
  };

  // Submit an answer
  const handleSubmitAnswer = async (answerId) => {
    // Check if quiz and questions exist
    if (!quiz || !quiz.questions || answerSubmitted) return;
    
    try {
      setError('');
      
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      // Find the current question
      const question = quiz.questions[currentQuestion];
      if (!question) {
        console.error('Question not found at index:', currentQuestion);
        return;
      }
      
      setAnswerSubmitted(true);
      
      // Get the actual room code
      const actualCode = code || location.pathname.split('/').pop();
      
      // Submit the answer
      if (answerId) {
        await submitAnswer(actualCode, question._id, answerId);
      }
      
      // Wait 2 seconds before moving to next question
      setTimeout(() => {
        if (currentQuestion < quiz.questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
        } else {
          // End of quiz
          if (isHost) {
            handleEndGame();
          }
        }
      }, 2000);
    } catch (error) {
      setError('Error submitting answer');
      console.error('Error submitting answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
        <p className="mb-4">The room you're looking for doesn't exist or has expired.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Waiting room display
  if (room.status === 'waiting') {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h1 className="text-2xl font-bold mb-4">Room: {code}</h1>
              {room && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">
                    Host: {getUserName(room.hostId)}
                  </h2>
                  <p className="text-gray-600">
                    Quiz: {quiz?.title || 'Loading...'}
            </p>
          </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Participants ({participants.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {participants.map((participant) => (
              <div 
                key={participant._id} 
                      className="bg-gray-100 rounded p-2 flex items-center gap-2"
              >
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  {getUserInitial(participant.userId)}
                </div>
                      <span>{getUserName(participant.userId)}</span>
                  </div>
                  ))}
                </div>
          </div>
        </div>
        
            {/* Game content */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-lg mb-4">Waiting for the game to start...</p>
          {isHost && (
            <button
                    className="btn btn-primary"
              onClick={handleStartGame}
            >
              Start Game
            </button>
          )}
              </div>
            </div>
          </div>

          {/* Chat sidebar */}
          <div className="lg:col-span-1">
            <RoomChat roomCode={code} roomId={room?._id} />
          </div>
        </div>
      </div>
    );
  }

  // Game in progress display
  if (room.status === 'in_progress') {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h1 className="text-2xl font-bold mb-4">Room: {code}</h1>
              {room && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">
                    Host: {getUserName(room.hostId)}
                  </h2>
                  <p className="text-gray-600">
                    Quiz: {quiz?.title || 'Loading...'}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Participants ({participants.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {participants.map((participant) => (
                    <div
                      key={participant._id}
                      className="bg-gray-100 rounded p-2 flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        {getUserInitial(participant.userId)}
                      </div>
                      <span>{getUserName(participant.userId)}</span>
                    </div>
                  ))}
                </div>
          </div>
        </div>
        
            {/* Game content */}
            <div className="bg-white rounded-lg shadow p-4">
              {quiz?.questions[currentQuestion] && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </h3>
                    {remaining > 0 && (
                      <div className="text-xl font-bold">
                        Time: {remaining}s
                      </div>
                )}
              </div>
                  <p className="text-lg mb-4">
                    {quiz.questions[currentQuestion].text}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quiz.questions[currentQuestion].answers.map((answer) => (
                  <button
                        key={answer._id}
                        className={`btn btn-outline ${
                          selectedAnswer === answer._id ? 'btn-primary' : ''
                        } ${answerSubmitted ? 'btn-disabled' : ''}`}
                    onClick={() => {
                          setSelectedAnswer(answer._id);
                          handleSubmitAnswer(answer._id);
                    }}
                  >
                        {answer.text}
                  </button>
                ))}
              </div>
            </div>
              )}
            </div>
          </div>

          {/* Chat sidebar */}
          <div className="lg:col-span-1">
            <RoomChat roomCode={code} roomId={room?._id} />
          </div>
        </div>
      </div>
    );
  }

  // Game completed display
  if (room.status === 'completed') {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <h1 className="text-2xl font-bold mb-4">Game Results</h1>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Score</th>
                </tr>
              </thead>
                  <tbody>
                {participants
                      .sort((a, b) => b.score - a.score)
                      .map((participant, index) => (
                        <tr
                          key={participant._id}
                          className={
                            getUserId(participant.userId) === user._id
                              ? 'bg-primary bg-opacity-10'
                              : ''
                          }
                        >
                          <td>{index + 1}</td>
                          <td>{getUserName(participant.userId)}</td>
                          <td>{participant.score}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
              <div className="mt-4">
          <button
            onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
          >
            Back to Dashboard
          </button>
              </div>
            </div>
          </div>

          {/* Chat sidebar */}
          <div className="lg:col-span-1">
            <RoomChat roomCode={code} roomId={room?._id} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Room: {room.code}</h1>
      <p className="mb-4">Status: {room.status}</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default Room; 