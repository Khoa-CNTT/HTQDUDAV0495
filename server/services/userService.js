const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../email/service');

//gen random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

const userService = {

    // user register
    async registerUser(userData) {
        const { username, email, password, displayName } = userData;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            throw new Error(userExists.email === email ? 'Email already registered' : 'Username already taken');
        }

        // gen verification token
        const verificationToken = generateToken();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({
            username,
            email,
            passwordHash: password,
            displayName: displayName || username,
            verificationToken,
            verificationTokenExpiry
        });

        // send verification email
        await emailService.sendVerificationEmail(email, username, verificationToken);

        return {
            message: 'Registration successful. Please check your email to verify your account.',
            userId: user._id
        };


    },

    // user login
    async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        user.lastLogin = new Date();
        await user.save();

        // gen JWT token
        const token = jwt.sign(
            { userId: user._id, accountType: user.accountType },
            process.env.JWT_SECRET || 'quiz_secret_key',
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName || user.username,
                accountType: user.accountType,
                profilePicture: user.profilePicture,
                registrationDate: user.registrationDate
            }
        };
    },

    // get user profile
    async getUserProfile(userId) {
        console.log('UserId received in getUserProfile:', userId); // Log giá trị userId
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            throw new Error('User not found :(' + userId + ')');
        }
        return user;
    },

    // update user profile
    async updateUserProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (updateData.displayName) user.displayName = updateData.displayName;
        if (updateData.profilePicture) user.profilePicture = updateData.profilePicture;

        await user.save();

        return {
            message: 'Profile updated successfully',
            user: {
                displayName: user.displayName,
                profilePicture: user.profilePicture
            }
        };
    },

    // verify user email
    async verifyEmail(token) {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            throw new Error('Invalid or expired verification token');
        }

        // Update user
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        user.isActive = true;
        await user.save();

        // Send welcome email
        await emailService.sendWelcomeEmail(user.email, user.username);

        return {
            message: 'Email verified successfully',
            userId: user._id
        };
    },

    // request password reset
    async requestPasswordReset(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const resetPasswordToken = generateToken();
        const resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
        await user.save();

        await emailService.sendPasswordResetEmail(email, user.username, resetPasswordToken);

        return { message: 'Password reset email sent' };
    },

    // reset password
    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        user.passwordHash = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();

        return { message: 'Password reset successful' };
    }

};

module.exports = userService; 