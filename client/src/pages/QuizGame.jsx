import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomByCode, getRoomParticipants, submitAnswer } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import RoomChat from '../components/RoomChat';

// Helper functions (only keeping those that are used)
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
  if (typeof user === 'object' && user.displayName) {
    return user.displayName.charAt(0).toUpperCase();
  }
  if (typeof user === 'string') {
    return user.charAt(0).toUpperCase();
  }
  return '?';
};

function QuizGame({ user: propUser }) {
  const { code } = useParams();
  const navigate = useNavigate();
  
  // Use the user from props or fallback to localStorage
  const [user, setUser] = useState(propUser || null);
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
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, in_progress, completed
  
  // Move console.log into useEffect so it only runs once on mount
  useEffect(() => {
    // Component initialized
  }, []);
  
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
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!code) {
          setError('Room code is required');
          return;
        }
        
        const roomResponse = await getRoomByCode(code);
        if (!roomResponse.success) {
          throw new Error(roomResponse.message || 'Failed to load room');
        }
        
        setRoom(roomResponse.data);
        setGameStatus(roomResponse.data.status || 'waiting');
        
        // Make sure quizId exists and set it safely
        if (roomResponse.data && roomResponse.data.quizId) {
          setQuiz(roomResponse.data.quizId);
        } else {
          setQuiz(null);
        }
        
        // Check if user is host (not needed for this component)
        const participantsResponse = await getRoomParticipants(code);
        if (participantsResponse.success) {
          setParticipants(participantsResponse.data);
        }

        // Connect to socket
        try {
          await socketService.init(user);
          setSocketConnected(true);
          await socketService.joinRoom(code);
        } catch (socketError) {
          console.error('Socket connection error:', socketError);
          toast.error('Could not connect to real-time updates. Functionality will be limited.');
        }
      } catch (error) {
        setError('Error loading room data: ' + (error.message || 'Unknown error'));
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRoomData();
    }
  }, [code, user]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socketConnected) return;
    
    // When a user joins the room
    socketService.on('onUserJoined', (data) => {
      if (data && data.user) {
        setParticipants(prev => {
          // Check if user already exists
          const exists = prev.some(p => getUserId(p.userId) === getUserId(data.user));
          if (exists) return prev;
          return [...prev, { userId: data.user, score: 0 }];
        });
      }
    });

    // When a user leaves the room
    socketService.on('onUserLeft', (data) => {
      if (data && data.userId) {
        setParticipants(prev => 
          prev.filter(p => getUserId(p.userId) !== getUserId(data.userId))
        );
      }
    });

    // When game starts
    socketService.on('onGameStarted', (data) => {
      toast.success('Game started!');
      setGameStatus('in_progress');
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      
      if (data && data.room) {
        setRoom(data.room);
      }
      if (data && data.quiz) {
        setQuiz(data.quiz);
      }
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    // When a user answers a question
    socketService.on('onUserAnswered', (data) => {
      if (data && data.userId) {
        toast(`${getUserName(data.userId)} submitted an answer!`, {
          icon: '✅',
        });
      }
    });

    // When game progress updates
    socketService.on('onGameProgress', (data) => {
      // Update participant scores
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    // When game ends
    socketService.on('onGameEnded', (data) => {
      toast.success('Game ended!');
      setGameStatus('completed');
      
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
      Object.keys(socketService.callbacks).forEach(event => {
        socketService.on(event, () => {});
      });
    };
  }, [socketConnected, code]); // Only re-setup sockets when connection state or room code changes

  // Handle timer when game is in progress
  useEffect(() => {
    if (gameStatus === 'in_progress' && quiz?.questions) {
      // Clear any existing timer
      if (timer) {
        clearInterval(timer);
      }
      
      // Set default time limit if none provided
      const questionTimeLimit = quiz.timeLimit || 30;
      setRemaining(questionTimeLimit);
      
      // Use setTimeout instead of setInterval to reduce re-renders
      const updateTimer = (timeLeft) => {
        if (timeLeft <= 0) {
          // Auto-submit if time is up and answer not submitted
          if (!answerSubmitted && quiz.questions[currentQuestion]) {
            handleTimeOut();
          }
          return;
        }
        
        const timerId = setTimeout(() => {
          setRemaining(timeLeft - 1);
          updateTimer(timeLeft - 1);
        }, 1000);
        
        // Store the timeout ID
        setTimer(timerId);
      };
      
      // Start the timer
      updateTimer(questionTimeLimit);
      
      // Cleanup function
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [gameStatus, currentQuestion, answerSubmitted, quiz]);

  // Add a function to handle time running out
  const handleTimeOut = () => {
    // Show notification
    toast.info('Time is up! Moving to next question...', {
      icon: '⏱️',
    });
    
    // Move to next question or end quiz
    setTimeout(() => {
      if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
      } else {
        // End of quiz
        toast('Quiz completed! Viewing results...', {
          icon: '🎉',
        });
        setGameStatus('completed');
      }
    }, 1000);
  }

  // Modify the answer submission function to auto-proceed
  const handleSubmitAnswer = async (answerId) => {
    // Check if quiz and questions exist and in-progress
    if (!quiz || !quiz.questions || answerSubmitted || gameStatus !== 'in_progress') return;
    
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
      setSelectedAnswer(answerId);
      
      // Submit the answer via socket if connected
      if (socketConnected && answerId) {
        socketService.submitAnswer(code, question._id, answerId);
      }
      
      // Also call the API for backup
      if (answerId) {
        await submitAnswer(code, question._id, answerId);
      }
      
      toast.success('Answer submitted!');
      
      // Auto-proceed to next question after a brief delay
      setTimeout(() => {
        if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
        } else {
          // End of quiz
          toast('Quiz completed! Viewing results...', {
            icon: '🎉',
          });
          setGameStatus('completed');
        }
      }, 1500); // 1.5 seconds delay
    } catch (error) {
      setError('Error submitting answer: ' + (error.message || 'Unknown error'));
      console.error('Error submitting answer:', error);
    }
  };

  // Back to room button handler
  const handleBackToRoom = () => {
    navigate(`/room/${code}`);
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
          onClick={handleBackToRoom}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Room
        </button>
      </div>
    );
  }

  if (!room || !quiz) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Room or Quiz Not Found</h1>
        <p className="mb-4">The quiz game you're looking for doesn't exist or has expired.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Game in progress display
  if (gameStatus === 'in_progress') {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quiz Game: {room.code}</h1>
                <button
                  onClick={handleBackToRoom}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Back to Room
                </button>
              </div>
            </div>
            
            {/* Game content */}
            <div className="bg-white rounded-lg shadow p-6">
              {quiz?.questions && quiz.questions[currentQuestion] ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </h3>
                    {remaining > 0 && (
                      <div className="text-xl font-bold px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                        {remaining}s
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xl">{quiz.questions[currentQuestion].content}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quiz.questions[currentQuestion].options && 
                     Array.isArray(quiz.questions[currentQuestion].options) &&
                     quiz.questions[currentQuestion].options.map((option) => (
                      <button
                        key={option._id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedAnswer === option._id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        } ${answerSubmitted ? 'cursor-not-allowed opacity-70' : 'hover:bg-blue-50'}`}
                        onClick={() => !answerSubmitted && handleSubmitAnswer(option._id)}
                        disabled={answerSubmitted}
                      >
                        <p className="text-lg">{option.label}</p>
                      </button>
                    ))}
                  </div>
                  
                  {answerSubmitted && (
                    <div className="mt-6 text-center">
                      <p className="text-green-600 font-semibold">
                        Answer submitted! Moving to next question...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-600">
                    {currentQuestion >= (quiz?.questions?.length || 0)
                      ? "You've completed all questions! Waiting for results..."
                      : "Loading question..."}
                  </p>
                  {currentQuestion >= (quiz?.questions?.length || 0) && (
                    <div className="mt-4">
                      <span className="loading loading-spinner loading-md"></span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Hide leaderboard during gameplay */}
            <div className="bg-white rounded-lg shadow p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Game Progress</h3>
              <p className="text-gray-600">Scores will be shown at the end of the quiz.</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(currentQuestion / quiz?.questions?.length) * 100}%` }}>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Question {currentQuestion + 1} of {quiz?.questions?.length || 0}
                </p>
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
  if (gameStatus === 'completed') {
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
                          <div key={participant._id || index} className="flex flex-col items-center mx-2">
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
                            key={participant._id || index}
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
                
                <button
                  onClick={handleBackToRoom}
                  className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md font-bold"
                >
                  Back to Room
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

  // Waiting room display (fallback)
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Waiting for Game to Start</h1>
        <p className="mb-6">The game host hasn't started the game yet. Please wait or return to the room.</p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleBackToRoom}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizGame; 