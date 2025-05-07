import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import toast from "react-hot-toast";
import "../styles/Auth.css";

const Login = ({ login: loginUser, user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Redirect nếu đã đăng nhập → về dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login({ email, password });
      loginUser(userData);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (error) {
      toast.error("Invalid email or password   ", { duration: 4000 });
    }
  }, [error]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
