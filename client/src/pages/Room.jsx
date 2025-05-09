import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRoomByCode, getRoomParticipants, startRoom, endRoom, checkIsHost } from '../services/api';
import RoomChat from '../components/RoomChat';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

// Helper functions to safely extract user information
const getUserId = (user) => {
  if (!user) return null;
  
  // Check if user is already a string ID
  if (typeof user === 'string') return user;
  
  // Check if user is an object with _id
  if (typeof user === 'object' && user._id) {
    // Handle if _id is an object with toString method (ObjectId)
    if (typeof user._id === 'object' && user._id.toString) {
      return user._id.toString();
    }
    return user._id;
  }
  
  // If it's some other object representation, try to find an ID
  if (typeof user === 'object') {
    const possibleIds = ['id', 'userId', 'hostId'];
    for (const idField of possibleIds) {
      if (user[idField]) {
        // Handle if the field is an object with toString method
        if (typeof user[idField] === 'object' && user[idField].toString) {
          return user[idField].toString();
        }
        return user[idField];
      }
    }
  }
  
  // Return null if no ID found
  return null;
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

// Get host details from participants array when hostId is just an ID
const getHostDetails = (hostId, participants) => {
  if (!hostId || !participants || !Array.isArray(participants)) return null;
  
  // First, try to find the host in participants array
  const hostParticipant = participants.find(p => 
    p.userId && getUserId(p.userId) === hostId
  );
  
  if (hostParticipant && hostParticipant.userId) {
    return hostParticipant.userId;
  }
  
  // If not found, just return the ID
  return hostId;
};

function Room({ user: propUser }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the user from props or fallback to localStorage
  const [user, setUser] = useState(propUser || null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Try to get user from localStorage if not provided via props
  useEffect(() => {
    if (!user) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error getting user from localStorage:', error);
      }
    }
  }, [user]);

  // Fetch initial room and participants data
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
      
      // Try to determine host status
      await determineHostStatus(actualCode, roomResponse.data);
      
      const participantsResponse = await getRoomParticipants(actualCode);
      if (participantsResponse.success) {
        setParticipants(participantsResponse.data);
      }

      // Now that we have the room data, initialize and join the socket room
      try {
        // This will return a promise that resolves when connected
        await socketService.init(user);
        setSocketConnected(true);
        await socketService.joinRoom(actualCode);
      } catch (socketError) {
        console.error('Socket connection error:', socketError);
        toast.error('Could not connect to real-time updates. Functionality will be limited.');
      }
    } catch (error) {
      setError('Error loading room data');
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Separate function to determine host status with multiple fallbacks
  const determineHostStatus = async (roomCode, roomData) => {
    try {
      // First check: If this is a room the user just created, they are the host
      if (roomData.isCreator === true) {
        console.log('User is the creator of this room!');
        setIsHost(true);
        return;
      }
      
      const hostId = getUserId(roomData.hostId);
      console.log('Host ID (extracted):', hostId);
      console.log('User ID (from props):', user?._id);
      
      // Try multiple comparison formats for maximum compatibility
      let userIsHost = false;
      
      if (hostId && user) {
        // Convert both to strings for comparison
        const hostIdStr = String(hostId);
        const userIdStr = String(user._id);
        
        console.log('Host ID as string:', hostIdStr);
        console.log('User ID as string:', userIdStr);
        console.log('String comparison result:', hostIdStr === userIdStr);
        
        // Try direct comparison
        if (hostId === user._id) {
          console.log('Direct comparison matched');
          userIsHost = true;
        }
        // Try string comparison
        else if (hostIdStr === userIdStr) {
          console.log('String comparison matched');
          userIsHost = true;
        }
        // Try comparing toString values
        else if (user._id && user._id.toString && hostId === user._id.toString()) {
          console.log('toString comparison matched');
          userIsHost = true;
        }
        // Check if either is nested inside an object
        else if (typeof user._id === 'object' && user._id && user._id._id && 
                 (hostId === user._id._id || hostId === String(user._id._id))) {
          console.log('Nested object comparison matched');
          userIsHost = true;
        }
        // LAST RESORT: Case-insensitive comparison
        else if (hostIdStr.toLowerCase() === userIdStr.toLowerCase()) {
          console.log('Case-insensitive comparison matched');
          userIsHost = true;
        }
      }
      
      // If all client-side comparisons fail, try the server API as last resort
      if (!userIsHost) {
        console.log('Client-side host checks failed, trying server API');
        const hostCheckResponse = await checkIsHost(roomCode);
        if (hostCheckResponse.success && hostCheckResponse.isHost) {
          console.log('Server confirms user is host!');
          userIsHost = true;
        }
      }
      
      console.log('Final host check result:', userIsHost);
      setIsHost(userIsHost);
    } catch (error) {
      console.error('Error determining host status:', error);
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

    // Set up socket event listeners
    socketService.on('onConnect', () => {
      console.log('Socket connected, joining room:', actualCode);
      setSocketConnected(true);
      socketService.joinRoom(actualCode)
        .catch(err => console.error('Error joining room:', err));
    });

    socketService.on('onDisconnect', () => {
      setSocketConnected(false);
      toast.error('Connection lost. Trying to reconnect...');
    });

    socketService.on('onUserJoined', (data) => {
      toast.success(`${data.username} joined the room!`);
      // Refresh participants
      getRoomParticipants(actualCode).then(response => {
        if (response.success) {
          setParticipants(response.data);
        }
      });
    });

    socketService.on('onUserLeft', (data) => {
      toast.info(`${data.username} left the room`);
      // Refresh participants
      getRoomParticipants(actualCode).then(response => {
        if (response.success) {
          setParticipants(response.data);
        }
      });
    });

    socketService.on('onRoomData', (data) => {
      setRoom(data.room);
      setParticipants(data.participants);
      
      // Update host status if room data changes
      if (data.room && data.room.hostId && user?._id) {
        const hostId = getUserId(data.room.hostId);
        setIsHost(hostId === user._id);
      }
    });

    socketService.on('onGameStarted', (data) => {
      console.log('Game started event:', data);
      toast.success('Game started!');
      // Navigate to the game page
      navigate(`/quiz-game/${code}`);
      
      // Update room status and quiz data
      if (data && data.room) {
        setRoom(data.room);
      }
      if (data && data.quiz) {
        setQuiz(data.quiz);
      }
      // Update participant scores
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socketService.on('onUserAnswered', (data) => {
      // Update UI to show someone answered (without revealing the answer)
      toast.info(`${data.username} answered the question!`);
    });

    socketService.on('onAnswerProcessed', (data) => {
      // Handle response for your own answer
      if (data.success) {
        toast.success('Answer submitted!');
      }
    });

    socketService.on('onGameProgress', (data) => {
      // Update participant scores
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socketService.on('onGameEnded', (data) => {
      toast.success('Game ended!');
      // Update room status and display results
      if (data && data.room) {
        setRoom(data.room);
      }
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    // Clean up socket listeners when component unmounts
    return () => {
      // Reset all socket callbacks to empty functions
      Object.keys(socketService.callbacks).forEach(event => {
        socketService.on(event, () => {});
      });
    };
  }, [code, location.pathname, navigate, user]);

  // Start the game (host only)
  const handleStartGame = async () => {
    try {
      setError('');
      // Get the actual room code
      const actualCode = code || location.pathname.split('/').pop();
      
      console.log('Starting game with code:', actualCode);
      
      // First attempt a direct API call as it's most reliable
      toast.loading('Starting game...');
      
      const response = await startRoom(actualCode);
      console.log('Start room API response:', response);
      toast.dismiss();
      
      if (response.success) {
        toast.success('Game started!');
        setRoom({...response.data, status: 'in_progress'});
        
        // Now try socket notification if connected
        if (socketConnected) {
          socketService.startGame(actualCode);
        }
        
        // Navigate to the quiz game page - add a small delay to ensure state is updated
        setTimeout(() => {
          navigate(`/quiz-game/${actualCode}`);
        }, 500);
      } else {
        setError(response.message || 'Failed to start game');
        toast.error('Failed to start game: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      setError('Error starting game');
      console.error('Error starting game:', error);
      toast.error('Error starting game');
    }
  };

  // End the game (host only)
  const handleEndGame = async () => {
    try {
      setError('');
      // Get the actual room code
      const actualCode = code || location.pathname.split('/').pop();
      
      // Use socket to end the game if connected
      if (socketConnected) {
        socketService.endGame(actualCode);
      }
      
      // Also call the API for backup
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
        {!socketConnected && (
          <div className="p-3 mb-4 bg-yellow-100 text-yellow-700 rounded-lg">
            <p>Socket connection not established. Some real-time features may be limited.</p>
            <button 
              onClick={() => socketService.init(user).then(() => setSocketConnected(true))}
              className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Reconnect
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h1 className="text-2xl font-bold mb-4">Room: {code}</h1>
              
              {isHost && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg mb-4 flex items-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <span className="font-bold block text-lg">You are the Quiz Host</span>
                    <span>You have control over when the game starts and ends</span>
                  </div>
                </div>
              )}
              
              {room && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <span className="mr-2">Host:</span> 
                    <div className={`px-3 py-1 rounded-lg flex items-center ${isHost ? 'bg-blue-600 text-white' : ''}`}>
                      <span className="font-bold">{getUserName(getHostDetails(room.hostId, participants))}</span>
                      {isHost && (
                        <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm font-bold">
                          YOU
                        </span>
                      )}
                    </div>
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
                  <div className="border-2 border-blue-600 p-6 rounded-lg bg-blue-50 inline-block">
                    <h3 className="text-xl font-bold mb-4 text-blue-800">Host Controls</h3>
                    <button
                      className="btn btn-lg w-full bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 shadow-lg transition-all duration-200 transform hover:scale-105"
                      onClick={handleStartGame}
                      disabled={!room || participants.length < 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      START GAME
                    </button>
                    
                    {participants.length < 1 && (
                      <p className="text-amber-600 mt-3 font-semibold">Need at least one participant to start</p>
                    )}
                  </div>
                )}

                {!isHost && (
                  <div className="p-4 bg-blue-50 rounded-lg inline-block animate-pulse">
                    <p className="text-blue-700 font-semibold">
                      Only the host can start the game. Please wait...
                    </p>
                  </div>
                )}

                {/* Explain the game flow to all users */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-lg text-blue-800 mb-2">How to Play</h3>
                  <p className="mb-2">1. Wait for the host to start the game</p>
                  <p className="mb-2">2. The game will begin automatically once started</p>
                  <p className="mb-2">3. Answer questions to earn points</p>
                  
                  {room?.status === 'in_progress' && (
                    <div className="bg-green-100 p-2 rounded mt-2">
                      <p className="text-green-800 font-bold">Game in progress!</p>
                    </div>
                  )}
                </div>
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
        {!socketConnected && (
          <div className="p-3 mb-4 bg-yellow-100 text-yellow-700 rounded-lg">
            <p>Socket connection not established. Some real-time features may be limited.</p>
            <button 
              onClick={() => socketService.init(user).then(() => setSocketConnected(true))}
              className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Reconnect
            </button>
          </div>
        )}
        
        {/* Game status notification instead of button to non-existent route */}
        <div className="mb-4 bg-green-100 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-green-800">Quiz Game in Progress!</h2>
              <p className="text-green-700">Answer the questions below to earn points</p>
            </div>
            {isHost && (
              <button 
                onClick={handleEndGame}
                className="btn btn-warning shadow-lg"
              >
                End Game
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h1 className="text-2xl font-bold mb-4">Room: {code}</h1>
              
              {isHost && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg mb-4 flex items-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <span className="font-bold block text-lg">You are the Quiz Host</span>
                    <span>You have control over when the game starts and ends</span>
                  </div>
                </div>
              )}
              
              {room && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <span className="mr-2">Host:</span> 
                    <div className={`px-3 py-1 rounded-lg flex items-center ${isHost ? 'bg-blue-600 text-white' : ''}`}>
                      <span className="font-bold">{getUserName(getHostDetails(room.hostId, participants))}</span>
                      {isHost && (
                        <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm font-bold">
                          YOU
                        </span>
                      )}
                    </div>
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
                      <span>
                        {getUserName(participant.userId)}
                        {participant.score > 0 && (
                          <span className="ml-2 text-green-600 font-bold">{participant.score} pts</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        
            {/* Game content */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">Game in Progress!</h2>
                <p className="text-lg mb-6">The game has been started by the host.</p>
                
                <div className="mb-8 max-w-md mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-blue-800">Click the button below to join the quiz and answer questions!</p>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/quiz-game/${code}`)}
                    className="btn btn-primary btn-lg text-lg px-8 py-3 shadow-lg animate-pulse"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play Game
                  </button>
                </div>
                
                {isHost && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h3 className="text-xl font-bold mb-4 text-blue-800">Host Controls</h3>
                    <button
                      onClick={handleEndGame}
                      className="btn btn-lg w-full bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4 shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      END GAME
                    </button>
                  </div>
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

  // Game completed display
  if (room.status === 'completed') {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Quiz Results</h1>
                <div className="badge badge-success py-2 px-4 text-white">Game Completed</div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2 text-center">Final Leaderboard</h2>
                <p className="text-gray-500 text-center mb-6">Quiz: {quiz?.title || 'Loading...'}</p>
                
                {participants && Array.isArray(participants) && participants.length > 0 && (
                  <div className="flex flex-col items-center mb-8">
                    {/* Top 3 Podium */}
                    <div className="flex items-end justify-center w-full max-w-xl mx-auto mb-8">
                      {participants.sort((a, b) => b.score - a.score).slice(0, 3).map((participant, index) => {
                        // Define heights and colors based on position
                        const heights = ["h-28", "h-36", "h-20"];
                        const bgColors = ["bg-gray-300", "bg-yellow-400", "bg-orange-400"];
                        const positions = [2, 1, 3]; // Silver, Gold, Bronze
                        const marginTop = ["mt-8", "mt-0", "mt-16"];
                        
                        return (
                          <div key={participant._id} className="flex flex-col items-center mx-2">
                            <div className="rounded-full w-16 h-16 mb-2 flex items-center justify-center bg-blue-100 border-4 border-white shadow-lg">
                              <span className="text-2xl font-bold">{getUserInitial(participant.userId)}</span>
                            </div>
                            <p className="text-center font-semibold mb-2 w-24 truncate">{getUserName(participant.userId)}</p>
                            <p className="text-lg font-bold text-blue-600">{participant.score} pts</p>
                            <div className={`${bgColors[index]} ${heights[index]} w-24 ${marginTop[index]} rounded-t-lg flex items-start justify-center pt-2 shadow-lg`}>
                              <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                                {positions[index]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* All participants list */}
                    <div className="w-full max-w-2xl bg-gray-50 rounded-lg overflow-hidden shadow">
                      <div className="bg-blue-600 text-white px-4 py-3">
                        <h3 className="font-bold">Complete Rankings</h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {participants.sort((a, b) => b.score - a.score).map((participant, index) => (
                          <div 
                            key={participant._id}
                            className={`px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors ${
                              getUserId(participant.userId) === user._id ? 'bg-blue-100' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                                index === 0 ? 'bg-yellow-400 text-yellow-800' : 
                                index === 1 ? 'bg-gray-300 text-gray-700' : 
                                index === 2 ? 'bg-orange-400 text-orange-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {getUserName(participant.userId)}
                                  {getUserId(participant.userId) === user._id && (
                                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-lg font-bold">
                              {participant.score} 
                              <span className="text-sm text-gray-500 ml-1">pts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(!participants || !Array.isArray(participants) || participants.length === 0) && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No results available</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-bold"
                >
                  Back to Dashboard
                </button>
                
                {isHost && (
                  <button
                    onClick={() => navigate('/create-room')}
                    className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md font-bold"
                  >
                    Create New Room
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

  // Default display if room status doesn't match any of the above
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