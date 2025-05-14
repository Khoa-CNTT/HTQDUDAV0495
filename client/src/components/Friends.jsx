import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import friendService from "../services/friendService";
import chatService from "../services/chatService";
import { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaUsers,
  FaSignOutAlt,
  FaUser,
  FaUserFriends,
  FaMedal,
  FaUserCog,
  FaComment,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import "../styles/Dashboard.css";

function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up friend request listeners
    friendService.onFriendRequestReceived((data) => {
      setFriendRequests((prev) => [...prev, data]);
    });

    friendService.onFriendRequestResponse((data) => {
      if (data.status === "accepted") {
        setFriends((prev) => [
          ...prev,
          {
            _id: data.userId,
            username: data.username,
          },
        ]);
      }
      // Remove from friend requests if it was our request
      setFriendRequests((prev) =>
        prev.filter((req) => req.userId !== data.userId)
      );
    });

    // Set up chat message listener
    chatService.onNewMessage((data) => {
      if (selectedFriend && data.message.sender === selectedFriend._id) {
        setChatMessages((prev) => [...prev, data.message]);
      }
    });

    // Load initial friends and friend requests
    // This would typically come from an API call
    // For now, we'll just use empty arrays
  }, [selectedFriend]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAcceptFriend = (request) => {
    friendService.respondToFriendRequest(request._id, true);
    setFriendRequests((prev) =>
      prev.filter((req) => req.userId !== request.userId)
    );
  };

  const handleRejectFriend = (request) => {
    friendService.respondToFriendRequest(request._id, false);
    setFriendRequests((prev) =>
      prev.filter((req) => req.userId !== request.userId)
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedFriend || !newMessage.trim()) return;

    chatService.sendPrivateMessage(selectedFriend._id, newMessage.trim());
    // Optimistically add message to chat
    setChatMessages((prev) => [
      ...prev,
      {
        sender: user._id,
        content: newMessage.trim(),
        createdAt: new Date(),
      },
    ]);
    setNewMessage("");
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setChatMessages([]);
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Lọc bạn bè theo searchTerm (ưu tiên displayName, fallback sang username)
  const filteredFriends = friends.filter(friend => {
    const name = friend.displayName || friend.username || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Tìm kiếm user toàn hệ thống khi nhập searchTerm
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const users = await res.json();
          setSearchResults(users);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated SVG background */}
      <svg
        className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(2px)" }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate
            attributeName="cx"
            values="80%;20%;80%"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate
            attributeName="cy"
            values="80%;20%;80%"
            dur="16s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-4 px-4 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              <FiArrowLeft className="w-6 h-6" />
            </motion.button>

            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaUserFriends className="inline-block text-yellow-300 animate-bounce" />
              Friends
              <FaStar className="inline-block text-pink-300 animate-spin-slow" />
            </h1>
          </div>

          <div className="relative user-info" ref={dropdownRef}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer avatar-container"
              onClick={toggleDropdown}
            >
              <img
                src={user?.profilePicture || "/images/df_avatar.png"}
                alt="User Avatar"
                className="w-12 h-12 border-2 rounded-full shadow-lg border-pink-400/40"
              />
              <span className="text-white username font-orbitron">
                {user?.username || "User"}
              </span>
            </motion.div>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 z-20 w-64 mt-2 overflow-hidden border-2 shadow-2xl top-16 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                >
                  <div className="flex items-center gap-3 p-4 border-b dropdown-header border-pink-400/40">
                    <img
                      src={user?.profilePicture || "/images/df_avatar.png"}
                      alt="User Avatar"
                      className="w-12 h-12 border-2 rounded-full border-pink-400/40"
                    />
                    <div className="dropdown-header-info">
                      <div className="text-pink-200 dropdown-header-name font-orbitron">
                        {user?.username || "User"}
                      </div>
                      <div className="text-sm dropdown-header-email font-orbitron text-pink-300/80">
                        {user?.email || "user@example.com"}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaUser className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron">
                      Profile
                    </span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaGamepad className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron">
                      Dashboard
                    </span>
                  </Link>

                  <Link
                    to="/achievements"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaMedal className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron">
                      Achievements
                    </span>
                  </Link>

                  {/* Admin link - only shown for admin users */}
                  {user?.accountType === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                    >
                      <div className="dropdown-item-icon">
                        <FaUserCog className="w-5 h-5 text-yellow-400" />
                      </div>
                      <span className="text-pink-200 dropdown-item-text font-orbitron">
                        Admin Panel
                      </span>
                    </Link>
                  )}

                  <div className="border-t dropdown-divider border-pink-400/40"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-left dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaSignOutAlt className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron">
                      Logout
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Friends List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
          >
            <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Friends</h2>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full p-3 pl-10 text-white border-2 rounded-xl bg-black/20 backdrop-blur-md border-pink-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
              <FaSearch className="absolute top-3.5 left-3 text-pink-300" />
            </div>

            {/* Hiển thị kết quả tìm kiếm user toàn hệ thống nếu có searchTerm */}
            {searchTerm && (
              <div className="mb-4 p-3 border-2 rounded-xl bg-black/30 backdrop-blur-md border-pink-400/40 max-h-60 overflow-y-auto">
                <h3 className="mb-2 text-lg font-semibold text-pink-200 font-orbitron">Search Results</h3>
                {searchResults.length === 0 ? (
                  <div className="text-pink-300 text-center py-2">No users found</div>
                ) : (
                  searchResults.map(result => {
                    const isFriend = friends.some(f => f._id === result._id);
                    return (
                      <motion.div
                        key={result._id}
                        className="flex items-center justify-between py-2 px-3 hover:bg-white/10 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2">
                          <img src={result.profilePicture || "/images/df_avatar.png"} alt={result.displayName || result.username} className="w-8 h-8 rounded-full object-cover border border-pink-400/40" />
                          <span className="text-pink-200">{result.displayName || result.username}</span>
                        </div>
                        {isFriend ? (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 font-semibold rounded-full border border-green-500/30">Friend</span>
                        ) : (
                          <motion.button
                            className="text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg border border-white/20 flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => friendService.sendFriendRequest(result._id)}
                          >
                            <FaUserPlus size={12} />
                            <span>Add</span>
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
              {filteredFriends.length === 0 && (
                <div className="text-pink-300 text-center p-4">No friends found</div>
              )}
              {filteredFriends.map((friend) => (
                <motion.button
                  key={friend._id}
                  onClick={() => handleSelectFriend(friend)}
                  className={`w-full p-3 text-left rounded-xl transition flex items-center gap-3 ${selectedFriend?._id === friend._id
                    ? "bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border-2 border-pink-400/40"
                    : "hover:bg-white/10 border-2 border-transparent"
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(friend.displayName || friend.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-pink-200 font-medium">{friend.displayName || friend.username}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
          >
            {selectedFriend ? (
              <>
                <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 flex items-center gap-2">
                  <FaComment className="text-yellow-300" />
                  Chat with {selectedFriend.displayName || selectedFriend.username}
                </h2>
                <div className="flex-1 p-4 mb-4 overflow-y-auto border-2 rounded-xl h-[400px] bg-black/20 backdrop-blur-md border-pink-400/40 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-pink-300 text-center">No messages yet. Start a conversation!</p>
                    </div>
                  )}
                  {chatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-3 ${msg.sender === user._id ? "text-right" : "text-left"
                        }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-xl max-w-[80%] ${msg.sender === user._id
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : "bg-white/10 text-pink-200 border border-pink-400/20"
                          }`}
                      >
                        <div>{msg.content}</div>
                        <div className="mt-1 text-xs opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 text-white border-2 rounded-xl bg-black/20 backdrop-blur-md border-pink-400/40 focus:border-yellow-400 focus:outline-none"
                  />
                  <motion.button
                    type="submit"
                    className="px-6 py-3 text-white transition-all duration-300 font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </motion.button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-pink-300 p-10">
                <FaComment className="text-5xl mb-4 text-pink-400 opacity-50" />
                <p className="text-xl mb-2">Select a friend to start chatting</p>
                <p className="text-sm text-pink-400/70 text-center">Your conversations will appear here</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
          >
            <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Friend Requests</h2>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <motion.div
                  key={request.userId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-black/20 backdrop-blur-md border-2 border-pink-400/40"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-pink-200 font-medium">{request.username}</span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleAcceptFriend(request)}
                      className="px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Accept
                    </motion.button>
                    <motion.button
                      onClick={() => handleRejectFriend(request)}
                      className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Friends;
