import socketService from './socketService';

class ChatService {
  constructor() {
    this.callbacks = {
      onNewMessage: () => {},
      onNewRoomMessage: () => {},
      onError: () => {}
    };
    this._setupSocketListeners();
  }

  _setupSocketListeners() {
    socketService.on('new-message', (data) => {
      this.callbacks.onNewMessage(data);
    });

    socketService.on('new-room-message', (data) => {
      this.callbacks.onNewRoomMessage(data);
    });

    socketService.on('error', (data) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(data);
      }
    });
  }

  /**
   * Send a private message to another user
   * @param {string} recipientId - ID of the message recipient
   * @param {string} content - Message content
   */
  sendPrivateMessage(recipientId, content) {
    socketService.socket.emit('send-message', { recipientId, content });
  }

  /**
   * Send a message to a room
   * @param {string} roomCode - Room code
   * @param {string} content - Message content
   */
  sendRoomMessage(roomCode, content) {
    socketService.socket.emit('send-room-message', { roomCode, content });
  }

  /**
   * Set callback for when a new private message is received
   * @param {Function} callback - Callback function
   */
  onNewMessage(callback) {
    this.callbacks.onNewMessage = callback;
  }

  /**
   * Set callback for when a new room message is received
   * @param {Function} callback - Callback function
   */
  onNewRoomMessage(callback) {
    this.callbacks.onNewRoomMessage = callback;
  }

  /**
   * Set callback for errors
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.callbacks.onError = callback;
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService; 