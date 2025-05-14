import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  deleteQuiz,
  getUserSubmissions,
  getPublicQuizzes,
  getUserQuizzes,
} from "../services/api";
import QuizCard from "../components/QuizCard";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import CreateQuizModal from "../components/CreateQuizModal";
import "../styles/Dashboard.css";
import PaginatedSubmissionsTable from "../components/PaginatedSubmissionsTable";
import CollapsibleSubmissionsTable from "../components/CollapsibleSubmissionsTable";
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaUsers,
  FaDoorOpen,
  FaSignOutAlt,
  FaUser,
  FaUserFriends,
  FaMedal,
  FaUserCog,
} from "react-icons/fa";

const Dashboard = ({ user, logout }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user's quizzes
        const quizzesResponse = await getUserQuizzes();
        if (!quizzesResponse.success) {
          throw new Error(quizzesResponse.message || "Failed to load quizzes");
        }
        setQuizzes(quizzesResponse.data || []);

        // Get public quizzes
        const publicQuizzesResponse = await getPublicQuizzes();
        if (publicQuizzesResponse.success) {
          setPublicQuizzes(publicQuizzesResponse.data || []);
        }

        // Get submissions
        const submissionsResponse = await getUserSubmissions();
        setSubmissions(submissionsResponse.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error.message || "Failed to load dashboard data. Please try again."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        const response = await deleteQuiz(quizId);
        if (response.success) {
          setQuizzes((prevQuizzes) =>
            prevQuizzes.filter((quiz) => quiz._id !== quizId)
          );
          toast.success("Quiz deleted successfully");
        } else {
          throw new Error(response.message || "Failed to delete quiz");
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error(error.message || "Failed to delete quiz");
      }
    }
  };

  // Check if user is creator of a quiz
  const isCreator = (quiz) => {
    return quiz.createdBy === user?._id;
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get first letter of username for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Log ra console để debug dữ liệu quiz
  console.log("Danh sách quizzes:", quizzes);
  const validQuizzes = Array.isArray(quizzes)
    ? quizzes.filter(
      (quiz) => typeof quiz._id === "string" && quiz._id.trim() !== ""
    )
    : [];
  const invalidQuizzes = Array.isArray(quizzes)
    ? quizzes.filter(
      (quiz) =>
        !quiz._id || typeof quiz._id !== "string" || quiz._id.trim() === ""
    )
    : [];
  if (invalidQuizzes.length > 0) {
    console.warn("Quiz bị thiếu _id:", invalidQuizzes);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
        >
          <p className="mb-4 text-xl text-pink-200 font-orbitron">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
            <FaGamepad className="inline-block text-yellow-300 animate-bounce" />
            Dashboard
            <FaStar className="inline-block text-pink-300 animate-spin-slow" />
          </h1>

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
              <span className="text-black username font-orbitron">
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
                    to="/friends"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20 "
                  >
                    <div className="dropdown-item-icon">
                      <FaUserFriends className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron ">
                      Friends
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

                  <Link
                    to="/achievements"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaMedal className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron ">
                      Achievements
                    </span>
                  </Link>

                  <div className="border-t dropdown-divider border-pink-400/40"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-left dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaSignOutAlt className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron ">
                      Logout
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-2 mb-8 border-2 shadow-2xl tab-container bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
        >
          <button
            className={`tab-button ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            <FaGamepad className="w-5 h-5" />
            My Quizzes
          </button>
          <button
            className={`tab-button ${activeTab === "public" ? "active" : ""}`}
            onClick={() => setActiveTab("public")}
          >
            <FaUsers className="w-5 h-5" />
            Public Quizze
          </button>
          <button
            className={`tab-button ${activeTab === "submissions" ? "active" : ""
              }`}
            onClick={() => setActiveTab("submissions")}
          >
            <FaTrophy className="w-5 h-5" />
            My Submissions
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "quizzes" && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                  My Quizzes
                </h2>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateQuizModalOpen(true)}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Create New Quiz
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/create-ai-quiz")}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl hover:from-purple-600 hover:to-indigo-600 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Generate Quiz with AI
                  </motion.button>
                </div>
              </div>

              {Array.isArray(quizzes) && quizzes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
                >
                  <p className="mb-4 text-xl text-pink-200 font-orbitron">
                    You haven't created any quizzes yet.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateQuizModalOpen(true)}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Create your first quiz
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/create-ai-quiz")}
                    className="ml-2 px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl hover:from-purple-600 hover:to-indigo-600 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Or generate with AI
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {validQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="quiz-card bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40 hover:shadow-[0_0_40px_10px_rgba(236,72,153,0.7)] transition-all duration-500"
                      onClick={() => {
                        if (!quiz._id) {
                          console.error("Quiz without valid ID:", quiz);
                          toast.error(
                            "Cannot view quiz details - Invalid quiz ID"
                          );
                          return;
                        }
                        const quizId = String(quiz._id).trim();
                        navigate(`/quiz/${quizId}`);
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                            {quiz.title}
                          </h3>
                          {quiz.isPublic ? (
                            <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full font-orbitron">
                              Public
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full font-orbitron">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="mb-4 text-pink-200 font-orbitron">
                          {quiz.questions
                            ? `${quiz.questions.length} questions`
                            : "Loading questions..."}
                        </p>
                        <div className="flex gap-3">
                          <Link
                            to={`/quiz/${quiz._id}`}
                            className="flex-1 px-4 py-2 text-center text-white transition-all duration-300 font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!quiz._id) {
                                e.preventDefault();
                                toast.error(
                                  "Cannot take quiz - Invalid quiz ID"
                                );
                              }
                            }}
                          >
                            Take Quiz
                          </Link>
                          {isCreator(quiz) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (quiz._id) {
                                  handleDeleteQuiz(quiz._id);
                                } else {
                                  toast.error(
                                    "Cannot delete quiz - Invalid quiz ID"
                                  );
                                }
                              }}
                              className="px-4 py-2 text-white transition-all duration-300 bg-red-500 font-orbitron rounded-xl hover:bg-red-600"
                            >
                              Delete
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "public" && (
            <motion.div
              key="public"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                Public Quizzes
              </h2>

              {Array.isArray(publicQuizzes) && publicQuizzes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
                >
                  <p className="text-xl text-pink-200 font-orbitron">
                    No public quizzes available.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(publicQuizzes) &&
                    publicQuizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="quiz-card bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40 hover:shadow-[0_0_40px_10px_rgba(236,72,153,0.7)] transition-all duration-500"
                        onClick={() => {
                          if (!quiz._id) {
                            toast.error(
                              "Cannot view quiz details - Invalid quiz ID"
                            );
                            return;
                          }
                          navigate(`/quiz/${quiz._id}`);
                        }}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                              {quiz.title}
                            </h3>
                            <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full font-orbitron">
                              Public
                            </span>
                          </div>
                          <p className="mb-2 text-pink-200 font-orbitron">
                            {quiz.questions
                              ? `${quiz.questions.length} questions`
                              : "Loading questions..."}
                          </p>
                          <p className="mb-4 text-pink-200 font-orbitron">
                            Created by: {quiz.createdBy?.username || "Unknown"}
                          </p>
                          <Link
                            to={`/quiz/${quiz._id}`}
                            className="block w-full px-4 py-2 text-center text-white transition-all duration-300 font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!quiz._id) {
                                e.preventDefault();
                                toast.error(
                                  "Cannot take quiz - Invalid quiz ID"
                                );
                              }
                            }}
                          >
                            Take Quiz
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "submissions" && (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                My Submissions
              </h2>
              <CollapsibleSubmissionsTable submissions={submissions} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multiplayer section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="p-8 mt-12 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
        >
          <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
            Multiplayer Quizzes
          </h2>
          <p className="mb-8 text-pink-200 font-orbitron">
            Challenge your friends or join public quiz rooms for a competitive
            experience.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 multiplayer-card bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border-pink-400/40"
            >
              <h3 className="mb-3 text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                Create a Room
              </h3>
              <p className="mb-6 text-pink-200 font-orbitron">
                Create a multiplayer room with one of your quizzes and invite
                others to join.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!Array.isArray(quizzes) || quizzes.length === 0) {
                    toast.error("You need to create a quiz first!");
                    setTimeout(() => navigate("/upload"), 1500);
                  } else {
                    navigate("/create-room");
                  }
                }}
                className="w-full px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              >
                Create Room
              </motion.button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 multiplayer-card bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border-pink-400/40"
            >
              <h3 className="mb-3 text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                Join a Room
              </h3>
              <p className="mb-6 text-pink-200 font-orbitron">
                Join an existing quiz room using a room code from another
                player.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/join-room")}
                className="w-full px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              >
                Join Room
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <CreateQuizModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
