import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getUser,
  saveUser,
  isAuthenticated,
  removeUser,
} from "./utils/jwtUtils";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadQuiz from "./pages/UploadQuiz";
import QuizDetails from "./pages/QuizDetails";
import TakeQuiz from "./pages/TakeQuiz";
import QuizResults from "./pages/QuizResults";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Room from "./pages/Room";
import QuizGame from "./pages/QuizGame";
import Footer from "./components/Footer";
import { SidebarProvider } from "./components/ui/sidebar";
import Friends from "./components/Friends";
import CreateQuiz from "./pages/CreateQuiz";
import Achievements from "./pages/Achievements";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  useEffect(() => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      setUser(getUser());
    }
    // Set a 3-second delay before removing the loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Login handler
  const login = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  // Logout handler
  const logout = () => {
    removeUser();
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Decorative Elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl" />

        {/* Loading Content */}
        <div className="relative z-10">
          {/* Logo Animation */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              CTEWhiz
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="h-1 mt-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
            />
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-8 space-x-2"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-indigo-600 rounded-full"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Nếu đã đăng nhập rồi thì không cho vào /login nữa */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login login={login} user={user} />
            )
          }
        />
        <Route path="/friends" element={<Friends />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <SidebarProvider>
                {/* Your main content here */}
                <Dashboard user={user} logout={logout} />
              </SidebarProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/achievements"
          element={
            <ProtectedRoute user={user}>
              <Achievements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <UserProfile user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute user={user}>
              <UploadQuiz user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-room"
          element={
            <ProtectedRoute user={user}>
              <CreateRoom user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/join-room"
          element={
            <ProtectedRoute user={user}>
              <JoinRoom user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:code"
          element={
            <ProtectedRoute user={user}>
              <Room user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-game/:code"
          element={
            <ProtectedRoute user={user}>
              <QuizGame user={user} />
            </ProtectedRoute>
          }
        />

        <Route path="/quiz/:id" element={<QuizDetails user={user} />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuiz user={user} />} />
        <Route
          path="/results/:submissionId"
          element={<QuizResults user={user} />}
        />

        <Route path="/create-quiz" element={<CreateQuiz />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
