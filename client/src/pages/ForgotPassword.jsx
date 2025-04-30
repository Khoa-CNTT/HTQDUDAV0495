import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement password reset logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-success">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <h2 className="success-title">Check Your Email</h2>
            <p className="success-message">
              We've sent password reset instructions to:
              <br />
              <span className="success-email">{email}</span>
              <br />
              <small style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem', display: 'block' }}>
                Please check your spam folder if you don't see it in your inbox
              </small>
            </p>
            <Link to="/login" className="auth-button">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Error</h2>
            <p className="error-message">{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Sending Instructions...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
