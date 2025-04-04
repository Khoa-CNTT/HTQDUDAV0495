const User = require('../models/User');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const crypto = require('crypto');
const emailConfig = require('../email/config');
const emailService = require('../email/service');

// route POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('already registered') || error.message.includes('already taken')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error registering user' });
  }
};

// route POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
};

/**
 * Request password reset
 * @route POST /api/users/request-password-reset
 * @access Public
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetPasswordToken = generateToken();
    const resetPasswordTokenExpiry = new Date(Date.now() + emailConfig.tokenExpiry.passwordReset); // 1 hour

    // Update user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    await user.save();

    // Send reset email - don't throw error if email sending fails
    try {
      await emailService.sendPasswordResetEmail(email, user.username, resetPasswordToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Continue with reset process even if email fails
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
};

/**
 * Reset password
 * @route POST /api/users/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// get userprofile GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.userId);
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(404).json({ message: error.message });
  }
};

// update userprofile PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const result = await userService.updateUserProfile(req.user.userId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Verify email
 * @route GET /api/users/verify-email/:token
 * @access Public
 */
const verifyEmail = async (req, res) => {
  try {
    const result = await userService.verifyEmail(req.params.token);
    // Redirect to login page after successful verification
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error('Verification error:', error);
    // Redirect to login page with error message
    res.redirect(`${process.env.CLIENT_URL}/login?verified=false&error=${encodeURIComponent(error.message)}`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  verifyEmail
}; 