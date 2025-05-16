import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaUser, FaSpinner } from 'react-icons/fa';

const RoomChat = ({ roomCode, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get user from localStorage as fallback
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, []);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!roomId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/chats/room/${roomId}/messages`);
        // Ensure messages is always an array
        const messagesData = Array.isArray(response.data) ? response.data : [];
        setMessages(messagesData);
        setLoading(false);
        scrollToBottom();
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]); // Set empty array on error
        setLoading(false);
      }
    };

    if (roomId) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [roomId]);

  // Socket event listeners
  useEffect(() => {
    // Initialize socket if not connected
    if (!socketService.isConnected && user) {
      socketService.init(user);
    }

    // Set up message handler
    const handleNewMessage = (data) => {
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), data.message]);
      scrollToBottom();
    };

    chatService.onNewRoomMessage(handleNewMessage);

    // Set up typing handlers
    const socket = socketService.socket;
    if (socket) {
      socket.on('user-typing', ({ username }) => {
        setTypingUsers(prev => new Set([...prev, username]));
      });

      socket.on('user-stop-typing', ({ username }) => {
        setTypingUsers(prev => {
          const newSet = new Set([...prev]);
          newSet.delete(username);
          return newSet;
        });
      });
    }

    return () => {
      // Clean up event listeners
      chatService.onNewRoomMessage(() => { });
      if (socket) {
        socket.off('user-typing');
        socket.off('user-stop-typing');
      }
    };
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!socketService.isConnected || !socketService.socket) return;

    socketService.socket.emit('typing-room-chat', roomCode);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socketService.socket) {
        socketService.socket.emit('stop-typing-room-chat', roomCode);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketService.isConnected) return;

    try {
      chatService.sendRoomMessage(roomCode, newMessage.trim());
      setNewMessage('');

      if (socketService.socket) {
        socketService.socket.emit('stop-typing-room-chat', roomCode);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 shadow-2xl">
      <div className="p-4 border-b border-pink-400/40">
        <h2 className="text-lg font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
          Room Chat
        </h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="w-8 h-8 text-pink-400 animate-spin" />
          </div>
        ) : (
          <>
            {!Array.isArray(messages) || messages.length === 0 ? (
              <div className="text-center text-pink-200/80 py-4 font-orbitron">
                No messages yet. Be the first to send a message!
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === user?._id ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-3 ${message.sender === user?._id
                      ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                      : 'bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 text-pink-200'
                      }`}
                  >
                    {message.sender !== user?._id && (
                      <div className="text-xs text-pink-300/80 mb-1 font-orbitron">
                        {message.senderName}
                      </div>
                    )}
                    <p className="text-sm font-orbitron">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1 font-orbitron">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 text-sm text-pink-300/80 font-orbitron"
        >
          {Array.from(typingUsers).join(', ')} typing...
        </motion.div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-pink-400/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-3 bg-indigo-900/50 border-2 border-pink-400/40 rounded-xl text-pink-200 placeholder-pink-300/50 focus:outline-none focus:border-pink-400 font-orbitron"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || !socketService.isConnected}
            className={`px-4 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30 ${(!newMessage.trim() || !socketService.isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaPaperPlane className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default RoomChat;