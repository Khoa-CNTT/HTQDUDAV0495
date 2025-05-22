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
      const senderId = socket.userId;

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
        // Tìm chat direct giữa 2 user
        let chat = await Chat.findOne({
          type: 'direct',
          participants: { $all: [senderId, receiverId] }
        });

        if (!chat) {
          // Nếu chưa có thì tạo mới
          chat = new Chat({
            type: 'direct',
            participants: [senderId, receiverId],
            messages: []
          });
        }

        // Thêm message vào mảng messages
        const message = {
          sender: senderId,
          content,
          read: false
        };
        chat.messages.push(message);
        chat.lastMessage = new Date();
        await chat.save();

        // Lấy message vừa thêm (có _id)
        const savedMessage = chat.messages[chat.messages.length - 1];

        // Lấy thông tin sender
        const sender = await User.findById(senderId).select('username email profilePicture');

        // Emit cho receiver
        io.to(receiverId).emit("new-message", {
          ...savedMessage.toObject(),
          senderName: sender.username,
          senderPhoto: sender.profilePicture
        });

        // Emit cho sender (nếu muốn cập nhật UI ngay)
        socket.emit("new-message", {
          ...savedMessage.toObject(),
          senderName: sender.username,
          senderPhoto: sender.profilePicture
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