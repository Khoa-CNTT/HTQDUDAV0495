import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../services/api";
import { motion } from "framer-motion";
import { FaKey, FaArrowRight } from "react-icons/fa";

function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomCode) {
      setError("Please enter a room code");
      return;
    }

    try {
      setJoining(true);
      setError("");

      const response = await joinRoom(roomCode);

      if (response.success) {
        navigate(`/room/${roomCode}`);
      } else {
        setError(response.message || "Failed to join room");
      }
    } catch (error) {
      setError(
        "Error joining room. Room may not exist or is no longer available."
      );
      console.error("Error joining room:", error);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mb-2">
                Join a Room
              </h1>
              <p className="text-gray-600">Enter the room code to join a multiplayer quiz session</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="roomCode">
                  <div className="flex items-center">
                    <FaKey className="w-4 h-4 mr-2 text-indigo-600" />
                    Room Code
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="roomCode"
                    className="w-full px-4 py-3 text-lg font-bold tracking-wider text-center uppercase border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="ABCD12"
                    maxLength="6"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Enter the 6-digit code provided by the room host
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={joining}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joining ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Join Room</span>
                      <FaArrowRight className="ml-2" />
                    </div>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 px-4 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </div>

          <div className="bg-white/50 backdrop-blur-sm px-8 py-6 border-t border-gray-200">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mb-3">
                Want to create your own room?
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/create-room")}
                className="w-full py-3 px-4 bg-white text-indigo-600 font-medium rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 transition-all"
              >
                Create a Room
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default JoinRoom;
