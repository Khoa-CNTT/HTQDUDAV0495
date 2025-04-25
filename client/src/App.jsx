import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, saveUser, isAuthenticated } from "./utils/jwtUtils";

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
import Footer from "./components/Footer";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      setUser(getUser());
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Nếu đã đăng nhập rồi thì không cho vào /login nữa */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" /> : <Login login={login} user={user} />
          }
        />

        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
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

        <Route path="/quiz/:quizId" element={<QuizDetails user={user} />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuiz user={user} />} />
        <Route path="/results/:submissionId" element={<QuizResults user={user} />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
