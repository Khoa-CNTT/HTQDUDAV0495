const Chat = require('../models/Chat');
const User = require('../models/User');

/**
 * Setup chat-related socket handlers
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket connection
 */
function setupChatHandlers(io, socket) {
  // Send message
  socket.on("send-message", async (data) => {
    try {
      const { receiverId, content, roomCode } = data;

      // If it's a room message
      if (roomCode) {
        // Save message to database if needed
        // Broadcast to everyone in the room
        io.to(roomCode).emit("new-message", {
          senderId: socket.userId,
          senderName: socket.username,
          content,
          roomCode,
          createdAt: new Date()
        });
        return;
      }

      // If it's a direct message
      if (receiverId) {
        // Create new chat message
        const message = new Chat({
          senderId: socket.userId,
          receiverId,
          content,
          read: false,
        });

        await message.save();

        // Get sender details
        const sender = await User.findById(socket.userId).select('username email profilePicture');

        // Emit to the receiver
        io.to(receiverId).emit("new-message", {
          _id: message._id,
          senderId: socket.userId,
          senderName: sender.username,
          senderPhoto: sender.profilePicture,
          content,
          createdAt: message.createdAt
        });

        // Also emit to the sender
        socket.emit("message-sent", {
          _id: message._id,
          receiverId,
          content,
          createdAt: message.createdAt
        });
      }
    } catch (error) {
      console.error("Error in send-message event:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Mark message as read
  socket.on("mark-read", async (messageId) => {
    try {
      const message = await Chat.findById(messageId);
      if (message && message.receiverId.toString() === socket.userId) {
        message.read = true;
        await message.save();

        // Notify the sender that the message was read
        io.to(message.senderId.toString()).emit("message-read", {
          messageId,
          readAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error in mark-read event:", error);
    }
  });

  // Handle typing indicators for direct messages
  socket.on("typing", (userId) => {
    io.to(userId).emit("user-typing", {
      userId: socket.userId,
      username: socket.username,
    });
  });

  // Handle stop typing for direct messages
  socket.on("stop-typing", (userId) => {
    io.to(userId).emit("user-stop-typing", {
      userId: socket.userId,
      username: socket.username,
    });
  });
}

module.exports = setupChatHandlers; 