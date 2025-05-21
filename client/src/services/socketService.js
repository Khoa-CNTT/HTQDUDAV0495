import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connecting = false;
    this.initializePromise = null;
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
      onAchievementsUnlocked: () => { }
    };
  }

  /**
   * Initialize socket connection with user credentials
   * @param {Object} user - User object with token, _id, etc.
   * @param {string} serverUrl - Server URL (default: http://localhost:5000)
   * @returns {Promise} - Promise that resolves when connected
   */
  init(user, serverUrl = 'http://localhost:5000') {
    // If we're already connected or connecting, don't initialize again
    if (this.isConnected) {
      return Promise.resolve(true);
    }

    if (this.connecting && this.initializePromise) {
      return this.initializePromise;
    }

    if (!user || !user.token) {
      console.error('User authentication required');
      return Promise.reject(new Error('Authentication required'));
    }

    // Clean up any existing socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.connecting = true;

    // Create a promise that resolves when connected
    this.initializePromise = new Promise((resolve, reject) => {
      try {
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

        // Set up connection listener to resolve promise
        this.socket.on('connect', () => {
          console.log('Socket connected');
          this.isConnected = true;
          this.connecting = false;
          this.callbacks.onConnect();
          resolve(true);
        });

        // Set up error listener to reject promise
        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.connecting = false;
          reject(error);
        });

        // Set up all other listeners
        this._setupListeners();
      } catch (error) {
        this.connecting = false;
        reject(error);
      }
    });

    return this.initializePromise;
  }

  /**
   * Ensures a socket connection is established
   * @param {Object} user - User object for authentication if needed
   * @returns {Promise} - Promise that resolves when connection is ready
   */
  ensureConnection(user) {
    if (this.isConnected) {
      return Promise.resolve();
    }

    return this.init(user);
  }

  /**
   * Join a specific room
   * @param {string} roomCode - Room code to join
   * @returns {Promise} - Promise that resolves when joined
   */
  joinRoom(roomCode) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        console.warn('Socket not connected. Cannot join room yet.');
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('join-room', roomCode);
      resolve(true);
    });
  }

  /**
   * Start the game (host only)
   * @param {string} roomCode - Room code to start
   */
  startGame(roomCode) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected. Cannot start game.');
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
      console.error('Socket not connected. Cannot submit answer.');
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
      console.error('Socket not connected. Cannot end game.');
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
      console.error('Socket not connected. Cannot check achievements.');
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
      this.connecting = false;
      this.initializePromise = null;
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
      console.log('User joined event received:', data);
      this.callbacks.onUserJoined(data);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left event received:', data);
      this.callbacks.onUserLeft(data);
    });

    this.socket.on('room-data', (data) => {
      console.log('Room data event received:', data);
      this.callbacks.onRoomData(data);
    });

    this.socket.on('game-started', (data) => {
      console.log('Game started event received:', data);
      this.callbacks.onGameStarted(data);
    });

    this.socket.on('user-answered', (data) => {
      console.log('User answered event received:', data);
      this.callbacks.onUserAnswered(data);
    });

    this.socket.on('answer-processed', (data) => {
      console.log('Answer processed event received:', data);
      this.callbacks.onAnswerProcessed(data);
    });

    this.socket.on('game-progress', (data) => {
      console.log('Game progress event received:', data);
      this.callbacks.onGameProgress(data);
    });

    this.socket.on('game-ended', (data) => {
      console.log('Game ended event received:', data);
      this.callbacks.onGameEnded(data);
    });

    this.socket.on('achievements-unlocked', (data) => {
      console.log('Achievements unlocked event received:', data);
      this.callbacks.onAchievementsUnlocked(data);
    });
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;