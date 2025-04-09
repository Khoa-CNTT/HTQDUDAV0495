import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import axios from 'axios';

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
        setMessages(response.data);
        setLoading(false);
        scrollToBottom();
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setLoading(false);
      }
    };

    if (roomId) {
      fetchMessages();
    }
  }, [roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socketService.isConnected) return;

    // Set up message handler
    chatService.onNewRoomMessage((data) => {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    });

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
      if (socket) {
        socket.off('user-typing');
        socket.off('user-stop-typing');
      }
    };
  }, []);

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
      socketService.socket.emit('stop-typing-room-chat', roomCode);
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
    <div className="flex flex-col h-[400px] bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Room Chat</h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No messages yet. Be the first to send a message!
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === user?._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === user?._id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    {message.sender !== user?._id && (
                      <div className="text-xs text-gray-500 mb-1">
                        {message.senderName}
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {Array.from(typingUsers).join(', ')} typing...
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 input input-bordered"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomChat;