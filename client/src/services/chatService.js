import socketService from './socketService';
import axios from 'axios';

const API_URL = "http://localhost:5000/api";

class ChatService {
  constructor() {
    this.callbacks = {
      onNewMessage: () => { },
      onTyping: () => { },
      onStopTyping: () => { },
      onError: () => { }
    };
    this.listeners = [];
    this._setupSocketListeners();
  }

  _setupSocketListeners() {
    socketService.on('new-message', (data) => {
      this.callbacks.onNewMessage(data);
    });

    socketService.on('user-typing', (data) => {
      this.callbacks.onTyping(data);
    });

    socketService.on('user-stop-typing', (data) => {
      this.callbacks.onStopTyping(data);
    });

    socketService.on('error', (data) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(data);
      }
    });
  }

  /**
   * Get chat messages with another user
   * @param {string} userId - User ID to get messages with
   * @returns {Promise} - Promise that resolves with messages
   */
  async getChatHistory(userId) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // First get or create the direct chat
      const chatResponse = await axios.get(`${API_URL}/chats/direct/${userId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!chatResponse.data || !chatResponse.data._id) {
        return [];
      }

      // Then get messages for this chat
      const messagesResponse = await axios.get(`${API_URL}/chats/${chatResponse.data._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      return messagesResponse.data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Send a private message to another user
   * @param {string} receiverId - ID of the message recipient
   * @param {string} content - Message content
   * @returns {Promise} - Promise that resolves when message is sent
   */
  async sendPrivateMessage(receiverId, content) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // First get or create the direct chat
      const chatResponse = await axios.get(`${API_URL}/chats/direct/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!chatResponse.data || !chatResponse.data._id) {
        throw new Error('Could not create chat');
      }

      // Then send the message
      const response = await axios.post(`${API_URL}/chats/${chatResponse.data._id}/messages`,
        { content },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Then send via socket for real-time
      if (socketService.isConnected) {
        socketService.emit('send-private-message', { receiverId, content });
      }

      return response.data;
    } catch (error) {
      console.error('Error sending private message:', error);
      throw error;
    }
  }

  /**
   * Notify the other user that you are typing
   * @param {string} receiverId - ID of the user to notify
   */
  sendTypingStatus(receiverId) {
    if (socketService.isConnected) {
      socketService.emit('user-typing', { receiverId });
    }
  }

  /**
   * Notify the other user that you stopped typing
   * @param {string} receiverId - ID of the user to notify
   */
  sendStopTypingStatus(receiverId) {
    if (socketService.isConnected) {
      socketService.emit('user-stop-typing', { receiverId });
    }
  }

  /**
   * Set callback for when a new message is received
   * @param {Function} callback - Callback function
   */
  onNewMessage(callback) {
    this.callbacks.onNewMessage = callback;
    // Add to listeners for cleanup
    this.listeners.push({ event: 'new-message', callback });
  }

  /**
   * Remove callback for new messages
   * @param {Function} callback - The callback to remove
   */
  offNewMessage(callback) {
    this.listeners = this.listeners.filter(l =>
      !(l.event === 'new-message' && l.callback === callback));
  }

  /**
   * Set callback for when someone is typing
   * @param {Function} callback - Callback function
   */
  onTyping(callback) {
    this.callbacks.onTyping = callback;
    this.listeners.push({ event: 'user-typing', callback });
  }

  /**
   * Set callback for when someone stops typing
   * @param {Function} callback - Callback function
   */
  onStopTyping(callback) {
    this.callbacks.onStopTyping = callback;
    this.listeners.push({ event: 'user-stop-typing', callback });
  }

  /**
   * Set callback for errors
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.callbacks.onError = callback;
    this.listeners.push({ event: 'error', callback });
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    this.listeners.forEach(l => {
      socketService.off(l.event, l.callback);
    });
    this.listeners = [];
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService; 