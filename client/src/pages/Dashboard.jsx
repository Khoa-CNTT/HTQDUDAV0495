import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, 
  FiUsers, 
  FiAward, 
  FiLogOut, 
  FiUser, 
  FiHome,
  FiBook,
  FiGlobe,
  FiClock,
  FiCheckCircle,
  FiEdit,
  FiTrash2,
  FiPlay,
  FiPlusCircle,
  FiUsers as FiGroup,
  FiHash
} from "react-icons/fi";
import "../styles/Dashboard.css";
import PaginatedSubmissionsTable from "../components/PaginatedSubmissionsTable";
import CollapsibleSubmissionsTable from "../components/CollapsibleSubmissionsTable";

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
      <div className="dashboard-container">
        <div className="empty-state">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="empty-state">
          <p className="empty-state-text">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="create-quiz-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="dashboard-header bg-white shadow-lg rounded-2xl p-6 mb-6 relative flex items-center">
        <div className="flex items-center space-x-4">
          <FiHome className="text-3xl text-indigo-600" />
          <h1 className="dashboard-title text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <div className="user-info ml-auto relative" ref={dropdownRef}>
          <motion.div 
            className="avatar-container hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDropdown}
          >
            <div className="avatar bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
              {getInitial(user?.username)}
            </div>
            <span className="username font-medium text-gray-700">{user?.username || "User"}</span>
          </motion.div>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`dropdown-menu bg-white rounded-xl shadow-xl absolute right-0 top-full mt-2 z-50${dropdownOpen ? ' active' : ''}`}
              >
                <div className="dropdown-header border-b border-gray-100">
                  <div className="avatar bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
                    {getInitial(user?.username)}
                  </div>
                  <div className="dropdown-header-info">
                    <div className="dropdown-header-name font-semibold text-gray-800">{user?.username || "User"}</div>
                    <div className="dropdown-header-email text-gray-500">{user?.email || "user@example.com"}</div>
                  </div>
                </div>

                <Link to="/profile" className="dropdown-item hover:bg-indigo-50 transition-colors">
                  <div className="dropdown-item-icon">
                    <FiUser className="text-indigo-600 text-lg" />
                  </div>
                  <span className="dropdown-item-text text-gray-700">Profile</span>
                </Link>

                <Link to="/friends" className="dropdown-item hover:bg-indigo-50 transition-colors">
                  <div className="dropdown-item-icon">
                    <FiUsers className="text-indigo-600 text-lg" />
                  </div>
                  <span className="dropdown-item-text text-gray-700">Friends</span>
                </Link>

                <Link to="/achievements" className="dropdown-item hover:bg-indigo-50 transition-colors">
                  <div className="dropdown-item-icon">
                    <FiAward className="text-indigo-600 text-lg" />
                  </div>
                  <span className="dropdown-item-text text-gray-700">Achievements</span>
                </Link>

                <div className="dropdown-divider border-t border-gray-100"></div>

                <button onClick={handleLogout} className="dropdown-item hover:bg-red-50 transition-colors">
                  <div className="dropdown-item-icon">
                    <FiLogOut className="text-red-600 text-lg" />
                  </div>
                  <span className="dropdown-item-text text-red-600">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="tab-container bg-white shadow-md rounded-xl mb-6 overflow-hidden">
        {["quizzes", "public", "submissions"].map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`tab-button ${activeTab === tab ? "active bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"} p-4 font-medium transition-all duration-300 flex items-center justify-center space-x-2`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "quizzes" ? (
              <>
                <FiBook className="text-lg" />
                <span>My Quizzes</span>
              </>
            ) : tab === "public" ? (
              <>
                <FiGlobe className="text-lg" />
                <span>Public Quizzes</span>
              </>
            ) : (
              <>
                <FiClock className="text-lg" />
                <span>My Submissions</span>
              </>
            )}
          </motion.button>
        ))}
      </div>

      {activeTab === "quizzes" && (
        <div>
          <div className="dashboard-header bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <FiBook className="text-2xl text-indigo-600" />
                <h2 className="quiz-card-title text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Quizzes
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateQuizModalOpen(true)}
                className="create-quiz-btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow rounded-xl px-6 py-3 font-medium flex items-center space-x-2"
              >
                <FiPlusCircle className="text-lg" />
                <span>Create New Quiz</span>
              </motion.button>
            </div>
          </div>

          {Array.isArray(quizzes) && quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state bg-white rounded-xl shadow-md p-8 text-center"
            >
              <FiBook className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="empty-state-text text-gray-600 text-lg mb-4">
                You haven't created any quizzes yet.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateQuizModalOpen(true)}
                className="empty-state-link bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow rounded-xl px-6 py-3 font-medium flex items-center justify-center space-x-2 mx-auto"
              >
                <FiPlusCircle className="text-lg" />
                <span>Create your first quiz</span>
              </motion.button>
            </motion.div>
          ) : (
            <div className="quiz-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {validQuizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  whileHover={{ y: -5 }}
                  className="quiz-card bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                  onClick={() => {
                    if (!quiz._id) {
                      console.error("Quiz without valid ID:", quiz);
                      toast.error("Cannot view quiz details - Invalid quiz ID");
                      return;
                    }
                    const quizId = String(quiz._id).trim();
                    console.log("Quiz click:", quiz);
                    console.log("Quiz _id click:", quizId);
                    navigate(`/quiz/${quizId}`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <FiBook className="text-xl text-indigo-600" />
                      <h3 className="quiz-card-title font-semibold text-lg text-gray-800">{quiz.title}</h3>
                    </div>
                    {quiz.isPublic ? (
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                        <FiGlobe className="text-sm" />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="quiz-card-info text-gray-600 mb-4 flex items-center space-x-2">
                    <FiCheckCircle className="text-indigo-600" />
                    <span>{quiz.questions ? `${quiz.questions.length} questions` : "Loading questions..."}</span>
                  </p>
                  <div className="quiz-card-actions flex gap-3">
                    <Link
                      to={`/quiz/${quiz._id}`}
                      className="take-quiz-btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:shadow-md transition-shadow rounded-xl px-4 py-2 font-medium flex-1 text-center flex items-center justify-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!quiz._id) {
                          e.preventDefault();
                          console.error(
                            "Quiz without valid ID (Take Quiz button):",
                            quiz
                          );
                          toast.error("Cannot take quiz - Invalid quiz ID");
                        }
                      }}
                    >
                      <FiPlay className="text-lg" />
                      <span>Take Quiz</span>
                    </Link>
                    {isCreator(quiz) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={e => {
                          e.stopPropagation();
                          if (quiz._id) {
                            handleDeleteQuiz(quiz._id);
                          } else {
                            console.error(
                              "Cannot delete quiz without ID:",
                              quiz
                            );
                            toast.error("Cannot delete quiz - Invalid quiz ID");
                          }
                        }}
                        className="delete-quiz-btn bg-red-100 text-red-600 hover:bg-red-200 transition-colors rounded-xl px-4 py-2 font-medium flex items-center space-x-2"
                      >
                        <FiTrash2 className="text-lg" />
                        <span>Delete</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "public" && (
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <FiGlobe className="text-2xl text-indigo-600" />
            <h2 className="quiz-card-title text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Public Quizzes
            </h2>
          </div>

          {Array.isArray(publicQuizzes) && publicQuizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state bg-white rounded-xl shadow-md p-8 text-center"
            >
              <FiGlobe className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="empty-state-text text-gray-600 text-lg">No public quizzes available.</p>
            </motion.div>
          ) : (
            <div className="quiz-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(publicQuizzes) &&
                publicQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="quiz-card"
                    onClick={() => {
                      if (!quiz._id) {
                        console.error("Public quiz without valid ID:", quiz);
                        toast.error(
                          "Cannot view quiz details - Invalid quiz ID"
                        );
                        return;
                      }
                      const quizId = String(quiz._id).trim();
                      navigate(`/quiz/${quizId}`);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <FiBook className="text-xl text-indigo-600" />
                        <h3 className="quiz-card-title font-semibold text-lg text-gray-800">{quiz.title}</h3>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                        <FiGlobe className="text-sm" />
                        <span>Public</span>
                      </span>
                    </div>
                    <p className="quiz-card-info text-gray-600 mb-2 flex items-center space-x-2">
                      <FiCheckCircle className="text-indigo-600" />
                      <span>{quiz.questions ? `${quiz.questions.length} questions` : "Loading questions..."}</span>
                    </p>
                    <p className="quiz-card-info text-gray-500 mb-4 flex items-center space-x-2">
                      <FiUser className="text-indigo-600" />
                      <span>Created by: {quiz.createdBy?.username || "Unknown"}</span>
                    </p>
                    <div className="quiz-card-actions">
                      <Link
                        to={`/quiz/${quiz._id}`}
                        className="take-quiz-btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:shadow-md transition-shadow rounded-xl px-4 py-2 font-medium w-full text-center flex items-center justify-center space-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!quiz._id) {
                            e.preventDefault();
                            console.error(
                              "Public quiz without valid ID (Take Quiz button):",
                              quiz
                            );
                            toast.error("Cannot take quiz - Invalid quiz ID");
                            toast.error('Cannot take quiz - Invalid quiz ID');
                          }
                        }}
                      >
                        <FiPlay className="text-lg" />
                        <span>Take Quiz</span>
                      </Link>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="h-80">
          <h2 className="mb-6 text-xl font-bold">My Submissions</h2>
          <CollapsibleSubmissionsTable submissions={submissions} />
        </div>
      )}

      {/* Multiplayer section */}
      <div className="multiplayer-section bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center space-x-4 mb-4">
          <FiGroup className="text-2xl text-indigo-600" />
          <h2 className="multiplayer-title text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Multiplayer Quizzes
          </h2>
        </div>
        <p className="multiplayer-description text-gray-600 mb-6">
          Challenge your friends or join public quiz rooms for a competitive
          experience.
        </p>

        <div className="multiplayer-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="multiplayer-card bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-center space-x-4 mb-3">
              <FiPlusCircle className="text-xl text-indigo-600" />
              <h3 className="multiplayer-card-title font-semibold text-lg text-gray-800">Create a Room</h3>
            </div>
            <p className="multiplayer-card-description text-gray-600 mb-4">
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
              className="multiplayer-btn create-room-btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow rounded-xl px-6 py-3 font-medium w-full flex items-center justify-center space-x-2"
            >
              <FiPlusCircle className="text-lg" />
              <span>Create Room</span>
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="multiplayer-card bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-center space-x-4 mb-3">
              <FiHash className="text-xl text-indigo-600" />
              <h3 className="multiplayer-card-title font-semibold text-lg text-gray-800">Join a Room</h3>
            </div>
            <p className="multiplayer-card-description text-gray-600 mb-4">
              Join an existing quiz room using a room code from another player.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/join-room")}
              className="multiplayer-btn join-room-btn bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-shadow rounded-xl px-6 py-3 font-medium w-full flex items-center justify-center space-x-2"
            >
              <FiHash className="text-lg" />
              <span>Join Room</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      <CreateQuizModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
