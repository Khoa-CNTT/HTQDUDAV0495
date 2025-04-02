const User = require('../models/User');

const userService = {

    // user register
    async registerUser(userData) {
        const { username, email, password, displayName } = userData;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            throw new Error(userExists.email === email ? 'Email already registered' : 'Username already taken');
        }

        const user = await User.create({
            username,
            email,
            passwordHash: password,
            displayName: displayName || username
        });

        return {
            message: 'Registration successful.',
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

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName || user.username,
                accountType: user.accountType,
                profilePicture: user.profilePicture
            }
        };
    },

};

module.exports = userService; 