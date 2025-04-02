const User = require('../models/User');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

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

module.exports = {
    registerUser,
    loginUser
}; 