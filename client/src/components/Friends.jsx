import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import friendService from "../services/friendService";
import chatService from "../services/chatService";
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
  FaBell,
} from "react-icons/fa";
import "../styles/Dashboard.css";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api";

function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("friends"); // "friends", "requests", "search"
  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null); // Added for auto-scrolling

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

  // Dedicated useEffect for socket chat messages
  useEffect(() => {
    if (!selectedFriend || !user) return;

    const handleNewMessage = (socketData) => {
      console.log("Socket new-message received (Friends.jsx):", socketData);
      const message = socketData.message || socketData;

      if (message && message.sender && selectedFriend) {
        // Condition to add message:
        // 1. Message is from the selected friend (and meant for the current user, if receiver is specified)
        // 2. OR Message is from the current user (and meant for the selected friend, if receiver is specified)
        const isFromSelectedFriend = message.sender === selectedFriend._id && (!message.receiver || message.receiver === user._id);
        const isFromCurrentUserToSelectedFriend = message.sender === user._id && (!message.receiver || message.receiver === selectedFriend._id);

        if (isFromSelectedFriend || isFromCurrentUserToSelectedFriend) {
          const isDuplicate = chatMessages.some(
            (msg) => (msg._id && msg._id === message._id && message._id !== undefined && !msg.isTemp) ||
              (msg.tempId && msg.tempId === message.tempId)
          );

          if (!isDuplicate) {
            console.log("Adding new message to UI (Friends.jsx):", message);
            setChatMessages((prevMessages) => {
              // If it's an update to a temporary message, replace it
              const existingTempIndex = prevMessages.findIndex(m => m.tempId === message.tempId && m.isTemp);
              if (existingTempIndex !== -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[existingTempIndex] = { ...message, isTemp: false };
                return updatedMessages;
              }
              return [...prevMessages, message];
            });

            if (message.sender !== user._id) {
              const audio = new Audio('/sounds/message.mp3');
              audio.play().catch(e => console.log('Audio play failed:', e));
            }
          } else {
            // If duplicate by _id, ensure it's not a temp message being replaced by confirmed one
            setChatMessages(prevMessages => prevMessages.map(msg =>
              (msg.tempId && msg.tempId === message.tempId && msg._id === message._id && msg.isTemp && !message.isTemp)
                ? { ...message, isTemp: false }
                : msg
            ));
            console.log("Message considered duplicate or already updated (Friends.jsx):", message);
          }
        }
      }
    };

    chatService.onNewMessage(handleNewMessage);

    return () => {
      chatService.offNewMessage(handleNewMessage);
    };
  }, [selectedFriend, user, chatMessages]);

  // Auto-scrolling effect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedFriend || !newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input ngay

    // Gửi qua REST API để đảm bảo lưu DB
    try {
      const chatRes = await axios.get(`${API_URL}/chats/direct/${selectedFriend._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!chatRes.data || !chatRes.data._id) {
        toast.error("Không thể tạo hoặc lấy phòng chat.");
        return;
      }
      await axios.post(`${API_URL}/chats/${chatRes.data._id}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Sau khi lưu thành công, gửi qua socket để cập nhật real-time
      if (window.socket) {
        window.socket.emit("send-message", {
          receiverId: selectedFriend._id,
          content: messageContent
        });
      }
    } catch (err) {
      console.error("Error sending message (Friends.jsx):", err);
      toast.error("Không thể gửi tin nhắn: " + (err.response?.data?.message || err.message));
    }
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
    if (!searchTerm || activeTab !== "search") {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/users/search?query=${encodeURIComponent(searchTerm)}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.data) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, activeTab, user]);

  // Lấy danh sách bạn bè
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/friends`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFriends(res.data);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.token) {
      fetchFriends();
    }
  }, [user]);

  // Lấy danh sách lời mời kết bạn
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        console.log('Fetching friend requests...');
        const res = await axios.get(`${API_URL}/friends/requests`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log('Friend requests received:', res.data);
        setFriendRequests(res.data);
      } catch (err) {
        console.error("Error fetching friend requests:", err);
        setFriendRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.token) {
      fetchRequests();

      // Thiết lập interval để kiểm tra lời mời kết bạn mới mỗi 30 giây
      const interval = setInterval(fetchRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Load messages when selecting a friend
  useEffect(() => {
    if (selectedFriend) {
      const loadMessages = async () => {
        try {
          setLoading(true);

          // First get or create the direct chat
          const chatRes = await axios.get(`${API_URL}/chats/direct/${selectedFriend._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });

          if (!chatRes.data || !chatRes.data._id) {
            setChatMessages([]);
            setLoading(false);
            return;
          }

          // Then get messages for this chat
          const res = await axios.get(`${API_URL}/chats/${chatRes.data._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });

          if (res.data) {
            setChatMessages(res.data);
          }
        } catch (err) {
          console.error("Error loading messages:", err);
          setChatMessages([]);
        } finally {
          setLoading(false);
        }
      };

      loadMessages();

      // Thiết lập socket listener cho tin nhắn mới
      const onNewMessage = (data) => {
        if (data.sender === selectedFriend._id) {
          setChatMessages(prev => [...prev, data]);

          // Play notification sound
          const audio = new Audio('/sounds/message.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
        }
      };

      chatService.onNewMessage(onNewMessage);

      return () => {
        // Clean up socket listener
        chatService.offNewMessage(onNewMessage);
      };
    }
  }, [selectedFriend, user]);

  // Gửi lời mời kết bạn
  const handleAddFriend = async (friendId) => {
    try {
      // Cập nhật UI trước để phản hồi nhanh
      setSearchResults(prev =>
        prev.map(user => user._id === friendId ? { ...user, requestSent: true } : user)
      );

      const res = await axios.post(`${API_URL}/friends/request/${friendId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.data) {
        toast.success("Đã gửi lời mời kết bạn!");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      // Khôi phục UI nếu gặp lỗi
      setSearchResults(prev =>
        prev.map(user => user._id === friendId && user.requestSent ? { ...user, requestSent: false } : user)
      );
      toast.error("Không thể gửi lời mời! " + (err.response?.data?.message || ""));
    }
  };

  // Chấp nhận lời mời
  const handleAccept = async (requestId) => {
    try {
      // Kiểm tra requestId
      if (!requestId) {
        console.error('RequestId is required');
        toast.error("Thiếu ID yêu cầu kết bạn");
        return;
      }

      // Cập nhật UI trước
      const request = friendRequests.find(r => r._id === requestId);
      if (!request) {
        console.error(`Request with ID ${requestId} not found in state`);
        toast.error("Không tìm thấy lời mời kết bạn");
        return;
      }

      console.log('Accepting friend request:', requestId);
      console.log('Request data:', request);

      // Lưu bản sao tạm thời của danh sách lời mời
      const originalRequests = [...friendRequests];

      // Cập nhật UI
      setFriendRequests(prev => prev.filter(r => r._id !== requestId));

      try {
        // Thử với endpoint chính trước
        console.log('Trying main endpoint...');
        const res = await axios.put(`${API_URL}/friends/request/${requestId}`,
          { accept: true },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        console.log('Server response:', res.data);

        // Thêm người dùng vào danh sách bạn bè
        setFriends(prev => [...prev, {
          _id: request.userId,
          username: request.username,
          email: request.email
        }]);

        toast.success("Đã chấp nhận lời mời kết bạn!");
      } catch (mainError) {
        console.error("Error with main endpoint:", mainError);
        console.error("Error details:", mainError.response?.data);

        // Nếu endpoint chính thất bại, thử endpoint thay thế
        try {
          console.log('Trying alternative endpoint...');
          const altRes = await axios.put(`${API_URL}/friends/request-alt/${requestId}`,
            { accept: true },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );

          console.log('Alternative endpoint response:', altRes.data);

          // Thêm người dùng vào danh sách bạn bè
          setFriends(prev => [...prev, {
            _id: request.userId,
            username: request.username,
            email: request.email
          }]);

          toast.success("Đã chấp nhận lời mời kết bạn!");
        } catch (altError) {
          console.error("Error with alternative endpoint:", altError);
          console.error("Error details:", altError.response?.data);

          // Thử phương thức thứ ba - gửi request dạng JSON thay vì dạng mặc định
          try {
            console.log('Trying with explicit JSON content type...');
            const jsonRes = await axios({
              method: 'put',
              url: `${API_URL}/friends/request/${requestId}`,
              data: JSON.stringify({ accept: true }),
              headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('JSON endpoint response:', jsonRes.data);

            // Thêm người dùng vào danh sách bạn bè
            setFriends(prev => [...prev, {
              _id: request.userId,
              username: request.username,
              email: request.email
            }]);

            toast.success("Đã chấp nhận lời mời kết bạn!");
          } catch (jsonError) {
            console.error("Error with JSON approach:", jsonError);
            console.error("Error details:", jsonError.response?.data);

            // Khôi phục lời mời vì cả ba cách đều thất bại
            setFriendRequests(originalRequests);
            toast.error("Không thể chấp nhận lời mời: " +
              (jsonError.response?.data?.message || jsonError.message));
          }
        }
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  // Từ chối lời mời
  const handleReject = async (requestId) => {
    try {
      // Kiểm tra requestId
      if (!requestId) {
        console.error('RequestId is required');
        toast.error("Thiếu ID yêu cầu kết bạn");
        return;
      }

      // Cập nhật UI trước
      const request = friendRequests.find(r => r._id === requestId);
      if (!request) {
        console.error(`Request with ID ${requestId} not found in state`);
        toast.error("Không tìm thấy lời mời kết bạn");
        return;
      }

      console.log('Rejecting friend request:', requestId);
      console.log('Request data:', request);

      // Lưu bản sao tạm thời của danh sách lời mời
      const originalRequests = [...friendRequests];

      // Cập nhật UI
      setFriendRequests(prev => prev.filter(r => r._id !== requestId));

      try {
        // Thử với endpoint chính trước
        console.log('Trying main endpoint for rejection...');
        await axios.put(`${API_URL}/friends/request/${requestId}`,
          { accept: false },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        toast.success("Đã từ chối lời mời kết bạn!");
      } catch (mainError) {
        console.error("Error with main endpoint:", mainError);
        console.error("Error details:", mainError.response?.data);

        // Nếu endpoint chính thất bại, thử endpoint thay thế
        try {
          console.log('Trying alternative endpoint for rejection...');
          await axios.put(`${API_URL}/friends/request-alt/${requestId}`,
            { accept: false },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );

          toast.success("Đã từ chối lời mời kết bạn!");
        } catch (altError) {
          console.error("Error with alternative endpoint:", altError);
          console.error("Error details:", altError.response?.data);

          // Thử phương thức thứ ba - gửi request dạng JSON thay vì dạng mặc định
          try {
            console.log('Trying with explicit JSON content type...');
            await axios({
              method: 'put',
              url: `${API_URL}/friends/request/${requestId}`,
              data: JSON.stringify({ accept: false }),
              headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
              }
            });

            toast.success("Đã từ chối lời mời kết bạn!");
          } catch (jsonError) {
            console.error("Error with JSON approach:", jsonError);
            console.error("Error details:", jsonError.response?.data);

            // Khôi phục lời mời vì cả ba cách đều thất bại
            setFriendRequests(originalRequests);
            toast.error("Không thể từ chối lời mời: " +
              (jsonError.response?.data?.message || jsonError.message));
          }
        }
      }
    } catch (err) {
      console.error("Error rejecting friend request:", err);
    }
  };

  // Thêm vào đầu useEffect (chỉ chạy 1 lần khi user có)
  useEffect(() => {
    if (user && window.socket) {
      window.socket.emit('join', { userId: user._id });
    }
  }, [user]);

  // Sửa lại useEffect nhận tin nhắn socket:
  useEffect(() => {
    if (!window.socket) return;
    const handleSocketMessage = (msg) => {
      // Kiểm tra nếu tin nhắn đã có trong chatMessages thì không thêm lại
      setChatMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        // Chỉ thêm nếu là tin nhắn của selectedFriend hoặc của mình gửi cho selectedFriend
        const isFromSelectedFriend = msg.sender?.toString() === selectedFriend?._id?.toString();
        const isFromMeToSelectedFriend = msg.sender?.toString() === user?._id?.toString() && msg.receiver === selectedFriend?._id;
        if (isFromSelectedFriend || isFromMeToSelectedFriend) {
          return [...prev, msg];
        }
        return prev;
      });
    };
    window.socket.on("new-message", handleSocketMessage);
    return () => window.socket.off("new-message", handleSocketMessage);
  }, [selectedFriend, user]);

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
                <div
                  className="absolute right-0 z-20 w-64 mt-2 overflow-hidden border-2 shadow-2xl top-16 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                >
                  {/* Dropdown content */}
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
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-2 mb-6 border-2 shadow-xl tab-container bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
        >
          <button
            className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <FaUserFriends className="w-5 h-5" />
            Danh sách bạn bè
          </button>

          <button
            className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <FaBell className="w-5 h-5" />
            Lời mời kết bạn
            {friendRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>

          <button
            className={`tab-button ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <FaSearch className="w-5 h-5" />
            Tìm kiếm bạn bè
          </button>
        </motion.div>

        {/* Tabs Content */}
        <AnimatePresence mode="wait">
          {/* Tab: Danh sách bạn bè */}
          {activeTab === "friends" && (
            <div
              key="friends-tab"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Friends List */}
              <div className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40">
                <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Danh sách bạn bè</h2>
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm bạn bè..."
                    className="w-full p-3 pl-10 text-white border-2 rounded-xl bg-black/20 backdrop-blur-md border-pink-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                  <FaSearch className="absolute top-3.5 left-3 text-pink-300" />
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
                  {filteredFriends.length === 0 ? (
                    <div className="text-pink-300 text-center p-4">Bạn chưa có bạn bè nào</div>
                  ) : (
                    filteredFriends.map((friend) => (
                      <div
                        key={friend._id}
                        onClick={() => handleSelectFriend(friend)}
                        className={`w-full p-3 text-left rounded-xl transition flex items-center gap-3 ${selectedFriend?._id === friend._id
                          ? "bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border-2 border-pink-400/40"
                          : "hover:bg-white/10 border-2 border-transparent"
                          }`}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(friend.displayName || friend.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-pink-200 font-medium">{friend.displayName || friend.username}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40">
                {selectedFriend ? (
                  <>
                    <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 flex items-center gap-2">
                      <FaComment className="text-yellow-300" />
                      Chat với {selectedFriend.displayName || selectedFriend.username}
                    </h2>
                    <div className="flex-1 p-4 mb-4 overflow-y-auto border-2 rounded-xl h-[400px] bg-black/20 backdrop-blur-md border-pink-400/40 custom-scrollbar">
                      {chatMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-pink-300 text-center">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, index) => {
                          // Lấy senderId chuẩn hóa
                          const senderId = typeof msg.sender === 'object' && msg.sender !== null
                            ? msg.sender._id
                            : msg.sender;
                          const isFromMe = senderId?.toString() === user._id?.toString();
                          return (
                            <motion.div
                              key={msg._id || msg.tempId || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`mb-3 flex ${isFromMe ? "justify-end" : "justify-start"}`}
                            >
                              {!isFromMe && selectedFriend && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
                                  {(selectedFriend.displayName || selectedFriend.username || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div
                                className={`inline-block p-3 rounded-xl max-w-[80%] ${isFromMe
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none"
                                  : "bg-white/10 text-pink-200 border border-pink-400/20 rounded-tl-none"
                                  }`}
                              >
                                <div>{msg.content}</div>
                                <div className="mt-1 text-xs opacity-75">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              {isFromMe && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ml-2 flex-shrink-0 self-end">
                                  {(user.username || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 p-3 text-white border-2 rounded-xl bg-black/20 backdrop-blur-md border-pink-400/40 focus:border-yellow-400 focus:outline-none"
                      />
                      <motion.button
                        type="submit"
                        className="px-6 py-3 text-white transition-all duration-300 font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!newMessage.trim()}
                      >
                        Gửi
                      </motion.button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-pink-300 p-10">
                    <FaComment className="text-5xl mb-4 text-pink-400 opacity-50" />
                    <p className="text-xl mb-2">Chọn một người bạn để bắt đầu trò chuyện</p>
                    <p className="text-sm text-pink-400/70 text-center">Các cuộc trò chuyện của bạn sẽ hiện ra ở đây</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Lời mời kết bạn */}
          {activeTab === "requests" && (
            <div
              key="requests-tab"
              className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
            >
              <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Lời mời kết bạn</h2>

              {friendRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-pink-300">
                  <FaBell className="text-5xl mb-4 text-pink-400 opacity-50" />
                  <p className="text-xl mb-2">Bạn chưa có lời mời kết bạn nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-black/20 backdrop-blur-md border-2 border-pink-400/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {request.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-pink-200 font-medium block">{request.username}</span>
                          <span className="text-pink-300/70 text-sm">{request.email}</span>
                          <span className="text-pink-300/70 text-xs block">ID: {request._id}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleAccept(request._id)}
                          className="px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Chấp nhận
                        </motion.button>
                        <motion.button
                          onClick={() => handleReject(request._id)}
                          className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Từ chối
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Tìm kiếm bạn bè */}
          {activeTab === "search" && (
            <div
              key="search-tab"
              className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
            >
              <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Tìm kiếm bạn bè</h2>

              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Nhập tên người dùng hoặc email để tìm kiếm..."
                  className="w-full p-4 pl-12 text-white border-2 rounded-xl bg-black/20 backdrop-blur-md border-pink-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
                <FaSearch className="absolute top-4 left-4 text-pink-300 w-5 h-5" />
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-16 h-16 border-4 border-pink-400 rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : !searchTerm ? (
                <div className="flex flex-col items-center justify-center py-12 text-pink-300">
                  <FaSearch className="text-5xl mb-4 text-pink-400 opacity-50" />
                  <p className="text-xl mb-2">Hãy nhập từ khóa để tìm kiếm bạn bè</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-pink-300">
                  <p className="text-xl">Không tìm thấy người dùng nào phù hợp</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map(user => {
                    const isFriend = friends.some(f => f._id === user._id);
                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 rounded-xl bg-black/20 backdrop-blur-md border-2 border-pink-400/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-pink-200 font-medium block">{user.displayName || user.username}</span>
                            <span className="text-pink-300/70 text-sm">{user.email}</span>
                          </div>
                        </div>

                        {isFriend ? (
                          <span className="px-4 py-2 bg-green-500/20 text-green-300 font-medium rounded-lg border border-green-500/30">
                            Đã là bạn bè
                          </span>
                        ) : user.requestSent ? (
                          <span className="px-4 py-2 bg-blue-500/20 text-blue-300 font-medium rounded-lg border border-blue-500/30">
                            Đã gửi lời mời
                          </span>
                        ) : (
                          <motion.button
                            onClick={() => handleAddFriend(user._id)}
                            className="px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaUserPlus className="w-4 h-4" />
                            Kết bạn
                          </motion.button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Friends;
