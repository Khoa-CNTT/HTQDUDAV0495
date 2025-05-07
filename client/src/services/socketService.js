import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {
      onConnect: () => { },
      onDisconnect: () => { },
      onError: () => { },
      onUserJoined: () => { },
      onUserLeft: () => { },
      onRoomData: () => { },
      onGameStarted: () => { },
      onUserAnswered: () => { },
      onAnswerProcessed: () => { },
      onGameProgress: () => { },
      onGameEnded: () => { },
      onAchievementsUnlocked: () => { } // New callback
    };
  }

  /**
   * Initialize socket connection with user credentials
   * @param {Object} user - User object with token, _id, etc.
   * @param {string} serverUrl - Server URL (default: http://localhost:5000)
   */
  init(user, serverUrl = 'http://localhost:5000') {
    if (!user || !user.token) {
      console.error('User authentication required');
      return false;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(serverUrl, {
      auth: {
        token: user.token,
        userId: user._id,
        username: user.username || user.email
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this._setupListeners();

    return true;
  }

  /**
   * Join a specific room
   * @param {string} roomCode - Room code to join
   */
  joinRoom(roomCode) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('join-room', roomCode);
    return true;
  }

  /**
   * Start the game (host only)
   * @param {string} roomCode - Room code to start
   */
  startGame(roomCode) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('start-game', roomCode);
    return true;
  }

  /**
   * Submit an answer
   * @param {string} roomCode - Room code
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   */
  submitAnswer(roomCode, questionId, answerId) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('submit-answer', { roomCode, questionId, answerId });
    return true;
  }

  /**
   * End the game (host only)
   * @param {string} roomCode - Room code to end
   */
  endGame(roomCode) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('end-game', roomCode);
    return true;
  }

  /**
   * Check achievements
   */
  checkAchievements() {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('check-achievements');
    return true;
  }

  /**
   * Disconnect from socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Set event callback
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (Object.hasOwnProperty.call(this.callbacks, event)) {
      this.callbacks[event] = callback;
    } else {
      console.warn(`Unknown event: ${event}`);
    }
  }

  /**
   * Setup internal socket listeners
   */
  _setupListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.callbacks.onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      this.callbacks.onDisconnect();
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.callbacks.onError(data);
    });

    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      this.callbacks.onUserJoined(data);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      this.callbacks.onUserLeft(data);
    });

    this.socket.on('room-data', (data) => {
      console.log('Room data:', data);
      this.callbacks.onRoomData(data);
    });

    this.socket.on('game-started', (data) => {
      console.log('Game started:', data);
      this.callbacks.onGameStarted(data);
    });

    this.socket.on('user-answered', (data) => {
      console.log('User answered:', data);
      this.callbacks.onUserAnswered(data);
    });

    this.socket.on('answer-processed', (data) => {
      console.log('Answer processed:', data);
      this.callbacks.onAnswerProcessed(data);
    });

    this.socket.on('game-progress', (data) => {
      console.log('Game progress:', data);
      this.callbacks.onGameProgress(data);
    });

    this.socket.on('game-ended', (data) => {
      console.log('Game ended:', data);
      this.callbacks.onGameEnded(data);
    });

    this.socket.on('achievements-unlocked', (data) => {
      console.log('Achievements unlocked:', data);
      this.callbacks.onAchievementsUnlocked(data);
    });
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;