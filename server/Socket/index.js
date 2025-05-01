const socketIo = require("socket.io");
const Room = require("../models/Room");
const Participant = require("../models/Participant");
const Chat = require("../models/Chat");
const User = require("../models/User");
const chatService = require("../services/chatService");

/**
 * Setup socket.io server
 * @param {Object} server - HTTP server instance
 * @returns {Object} io - Socket.io instance
 */
function setupSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    // Here you could verify JWT token, but for simplicity, we just pass the token
    socket.userId = socket.handshake.auth.userId;
    socket.username = socket.handshake.auth.username;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for private messages
    socket.join(socket.userId);

    // Handle private messages
    socket.on("send-message", async (data) => {
      try {
        const { recipientId, content } = data;

        // Find or create chat
        let chat = await Chat.findOne({
          type: "direct",
          participants: { $all: [socket.userId, recipientId] },
        });

        if (!chat) {
          chat = new Chat({
            type: "direct",
            participants: [socket.userId, recipientId],
          });
        }

        // Add message
        chat.messages.push({
          sender: socket.userId,
          content,
        });
        chat.lastMessage = new Date();
        await chat.save();

        // Send to recipient
        io.to(recipientId).emit("new-message", {
          chatId: chat._id,
          message: {
            sender: socket.userId,
            content,
            createdAt: new Date(),
          },
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle room chat messages
    socket.on("send-room-message", async (data) => {
      try {
        const { roomCode, content } = data;

        const room = await Room.findOne({ code: roomCode });
        if (!room) {
          return socket.emit("error", { message: "Room not found" });
        }

        // Use chat service to handle the message
        const chat = await chatService.getOrCreateRoomChat(room._id);
        await chatService.addMessage(chat._id, socket.userId, content);

        // Broadcast to room
        io.to(roomCode).emit("new-room-message", {
          chatId: chat._id,
          message: {
            sender: socket.userId,
            senderName: socket.username,
            content,
            createdAt: new Date(),
          },
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send room message" });
      }
    });

    // Handle typing indicators for room chat
    socket.on("typing-room-chat", (roomCode) => {
      socket.to(roomCode).emit("user-typing", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    // Handle stop typing for room chat
    socket.on("stop-typing-room-chat", (roomCode) => {
      socket.to(roomCode).emit("user-stop-typing", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    // Join a room
    socket.on("join-room", async (roomCode) => {
      try {
        console.log(`User ${socket.userId} joining room ${roomCode}`);
        // Add socket to room
        socket.join(roomCode);

        // Notify others in the room
        socket.to(roomCode).emit("user-joined", {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date(),
        });

        // Get room info to send back to the client
        const room = await Room.findOne({ code: roomCode })
          .populate("hostId", "username email")
          .populate("quizId", "title description");

        if (room) {
          const participants = await Participant.find({
            roomId: room._id,
          }).populate("userId", "username email");

          // Emit event with room data to the client that just connected
          socket.emit("room-data", {
            room,
            participants,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Error in join-room event:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Start the game
    socket.on("start-game", async (roomCode) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room) {
          return socket.emit("error", { message: "Room not found" });
        }

        // Check if user is the host
        if (room.hostId.toString() !== socket.userId) {
          return socket.emit("error", {
            message: "Only host can start the game",
          });
        }

        // Update room status to in_progress
        room.status = "in_progress";
        room.startTime = new Date();
        await room.save();

        // Notify all clients in the room
        io.to(roomCode).emit("game-started", {
          startTime: room.startTime,
          timeLimit: room.timeLimit,
        });
      } catch (error) {
        console.error("Error in start-game event:", error);
        socket.emit("error", { message: "Failed to start game" });
      }
    });

    // Submit an answer
    socket.on("submit-answer", async (data) => {
      try {
        const { roomCode, questionId, answerId } = data;

        // Find the room
        const room = await Room.findOne({ code: roomCode });
        if (!room) {
          return socket.emit("error", { message: "Room not found" });
        }

        // Find the participant
        const participant = await Participant.findOne({
          roomId: room._id,
          userId: socket.userId,
        });

        if (!participant) {
          return socket.emit("error", { message: "Participant not found" });
        }

        // Process the answer (this would normally call your existing answer submission logic)
        // For now, we'll just acknowledge it and broadcast progress

        // Notify just the answering user
        socket.emit("answer-processed", {
          success: true,
          questionId,
          answerId,
        });

        // Notify everyone else that someone answered (without showing the answer)
        socket.to(roomCode).emit("user-answered", {
          userId: socket.userId,
          username: socket.username,
          questionId,
        });

        // Get updated participants to broadcast progress
        const participants = await Participant.find({
          roomId: room._id,
        }).populate("userId", "username email");

        io.to(roomCode).emit("game-progress", {
          participants,
        });
      } catch (error) {
        console.error("Error in submit-answer event:", error);
        socket.emit("error", { message: "Failed to submit answer" });
      }
    });

    // End the game
    socket.on("end-game", async (roomCode) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room) {
          return socket.emit("error", { message: "Room not found" });
        }

        // Check if user is the host
        if (room.hostId.toString() !== socket.userId) {
          return socket.emit("error", {
            message: "Only host can end the game",
          });
        }

        // Update room status to completed
        room.status = "completed";
        room.endTime = new Date();
        await room.save();

        // Get final participants data with scores
        const participants = await Participant.find({
          roomId: room._id,
        }).populate("userId", "username email");

        // Calculate ranks
        const sortedParticipants = [...participants].sort(
          (a, b) => b.score - a.score
        );
        for (let i = 0; i < sortedParticipants.length; i++) {
          sortedParticipants[i].rank = i + 1;
          await sortedParticipants[i].save();
        }

        // Notify all clients in the room
        io.to(roomCode).emit("game-ended", {
          room,
          participants: sortedParticipants,
          endTime: room.endTime,
        });
      } catch (error) {
        console.error("Error in end-game event:", error);
        socket.emit("error", { message: "Failed to end game" });
      }
    });

    // Handle client disconnection
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.userId}`);
      try {
        // Find rooms where this user is a participant
        const participantRooms = await Participant.find({
          userId: socket.userId,
        });

        for (const participantRoom of participantRooms) {
          const room = await Room.findById(participantRoom.roomId);
          if (room && room.status === "waiting") {
            // Notify others if in waiting room
            io.to(room.code).emit("user-left", {
              userId: socket.userId,
              username: socket.username,
            });
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  return io;
}

module.exports = setupSocketServer;
