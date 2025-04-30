import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteQuiz,
  getUserSubmissions,
  getPublicQuizzes,
} from "../services/api";
import QuizCard from "../components/QuizCard";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/Dashboard.css";

const Dashboard = ({ user, logout }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user's quizzes
        const quizzesResponse = await getPublicQuizzes();
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="user-info" ref={dropdownRef}>
          <div className="avatar-container" onClick={toggleDropdown}>
            <div className="avatar">
              {getInitial(user?.username)}
            </div>
            <span className="username">{user?.username || "User"}</span>
          </div>
          
          <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
            <div className="dropdown-header">
              <div className="avatar">
                {getInitial(user?.username)}
              </div>
              <div className="dropdown-header-info">
                <div className="dropdown-header-name">{user?.username || "User"}</div>
                <div className="dropdown-header-email">{user?.email || "user@example.com"}</div>
              </div>
            </div>
            
            <Link to="/profile" className="dropdown-item">
              <div className="dropdown-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="dropdown-item-text">Profile</span>
            </Link>
            
            <Link to="/friends" className="dropdown-item">
              <div className="dropdown-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="dropdown-item-text">Friends</span>
            </Link>
            
            <Link to="/achievements" className="dropdown-item">
              <div className="dropdown-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></path>
                </svg>
              </div>
              <span className="dropdown-item-text">Achievements</span>
            </Link>
            
            <div className="dropdown-divider"></div>
            
            <button onClick={handleLogout} className="dropdown-item">
              <div className="dropdown-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <span className="dropdown-item-text">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === "quizzes" ? "active" : ""}`}
          onClick={() => setActiveTab("quizzes")}
        >
          My Quizzes
        </button>
        <button
          className={`tab-button ${activeTab === "public" ? "active" : ""}`}
          onClick={() => setActiveTab("public")}
        >
          Public Quizzes
        </button>
        <button
          className={`tab-button ${activeTab === "submissions" ? "active" : ""}`}
          onClick={() => setActiveTab("submissions")}
        >
          My Submissions
        </button>
      </div>

      {activeTab === "quizzes" && (
        <div>
          <div className="dashboard-header">
            <h2 className="quiz-card-title">My Quizzes</h2>
            <Link to="/upload" className="create-quiz-btn">
              Create New Quiz
            </Link>
          </div>

          {Array.isArray(quizzes) && quizzes.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">
                You haven't created any quizzes yet.
              </p>
              <Link to="/upload" className="empty-state-link">
                Create your first quiz
              </Link>
            </div>
          ) : (
            <div className="quiz-grid">
              {Array.isArray(quizzes) &&
                quizzes.map((quiz) => (
                  <div key={quiz._id} className="quiz-card">
                    <h3 className="quiz-card-title">{quiz.title}</h3>
                    <p className="quiz-card-info">
                      {quiz.questions
                        ? `${quiz.questions.length} questions`
                        : "Loading questions..."}
                    </p>
                    <div className="quiz-card-actions">
                      <Link
                        to={`/quiz/${quiz._id}`}
                        className="take-quiz-btn"
                      >
                        Take Quiz
                      </Link>
                      {isCreator(quiz) && (
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="delete-quiz-btn"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "public" && (
        <div>
          <h2 className="quiz-card-title">Public Quizzes</h2>

          {Array.isArray(publicQuizzes) && publicQuizzes.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No public quizzes available.</p>
            </div>
          ) : (
            <div className="quiz-grid">
              {Array.isArray(publicQuizzes) &&
                publicQuizzes.map((quiz) => (
                  <div key={quiz._id} className="quiz-card">
                    <h3 className="quiz-card-title">{quiz.title}</h3>
                    <p className="quiz-card-info">
                      {quiz.questions
                        ? `${quiz.questions.length} questions`
                        : "Loading questions..."}
                    </p>
                    <p className="quiz-card-info">
                      Created by: {quiz.createdBy?.username || "Unknown"}
                    </p>
                    <div className="quiz-card-actions">
                      <Link
                        to={`/quiz/${quiz._id}`}
                        className="take-quiz-btn"
                      >
                        Take Quiz
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "submissions" && (
        <div>
          <h2 className="quiz-card-title">My Submissions</h2>

          {Array.isArray(submissions) && submissions.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">
                You haven't taken any quizzes yet.
              </p>
              <Link to="/" className="empty-state-link">
                Find Quizzes to Take
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id}>
                      <td>{submission.quiz?.title || "Unknown Quiz"}</td>
                      <td>{submission.score}%</td>
                      <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link
                          to={`/quiz-results/${submission._id}`}
                          className="take-quiz-btn"
                        >
                          View Results
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Multiplayer section */}
      <div className="multiplayer-section">
        <h2 className="multiplayer-title">Multiplayer Quizzes</h2>
        <p className="multiplayer-description">
          Challenge your friends or join public quiz rooms for a competitive
          experience.
        </p>

        <div className="multiplayer-grid">
          <div className="multiplayer-card">
            <h3 className="multiplayer-card-title">Create a Room</h3>
            <p className="multiplayer-card-description">
              Create a multiplayer room with one of your quizzes and invite
              others to join.
            </p>
            <button
              onClick={() => {
                // Check if we have quizzes available
                if (!Array.isArray(quizzes) || quizzes.length === 0) {
                  toast.error("You need to create a quiz first!");
                  setTimeout(() => navigate("/upload"), 1500);
                } else {
                  navigate("/create-room");
                }
              }}
              className="multiplayer-btn create-room-btn"
            >
              Create Room
            </button>
          </div>

          <div className="multiplayer-card">
            <h3 className="multiplayer-card-title">Join a Room</h3>
            <p className="multiplayer-card-description">
              Join an existing quiz room using a room code from another player.
            </p>
            <button
              onClick={() => navigate("/join-room")}
              className="multiplayer-btn join-room-btn"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
