import socketService from './socketService';

class FriendService {
  constructor() {
    this.callbacks = {
      onFriendRequestReceived: () => {},
      onFriendRequestResponse: () => {},
      onError: () => {}
    };
    this._setupSocketListeners();
  }

  _setupSocketListeners() {
    socketService.on('friend-request-received', (data) => {
      this.callbacks.onFriendRequestReceived(data);
    });

    socketService.on('friend-request-response', (data) => {
      this.callbacks.onFriendRequestResponse(data);
    });

    socketService.on('error', (data) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(data);
      }
    });
  }

  /**
   * Send a friend request to another user
   * @param {string} targetUserId - ID of the user to send request to
   */
  sendFriendRequest(targetUserId) {
    socketService.socket.emit('send-friend-request', targetUserId);
  }

  /**
   * Respond to a friend request
   * @param {string} requestId - ID of the friend request
   * @param {boolean} accept - Whether to accept or reject the request
   */
  respondToFriendRequest(requestId, accept) {
    socketService.socket.emit('respond-friend-request', { requestId, accept });
  }

  /**
   * Set callback for when a friend request is received
   * @param {Function} callback - Callback function
   */
  onFriendRequestReceived(callback) {
    this.callbacks.onFriendRequestReceived = callback;
  }

  /**
   * Set callback for when a friend request response is received
   * @param {Function} callback - Callback function
   */
  onFriendRequestResponse(callback) {
    this.callbacks.onFriendRequestResponse = callback;
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
const friendService = new FriendService();
export default friendService; 