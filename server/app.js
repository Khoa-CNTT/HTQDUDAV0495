const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const leaderboardRoutes = require('./routes/leaderboard');
const app = express();
const port = process.env.PORT || 5000;

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body,
        headers: req.headers
    });
    next();
});

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Leaderboard routes
app.use('/api/leaderboard', leaderboardRoutes);
console.log('Registered leaderboard routes');

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});