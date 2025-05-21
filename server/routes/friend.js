const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const FriendController = require('../controllers/friendController');

router.get('/', authMiddleware, FriendController.getFriends);
router.get('/requests', authMiddleware, FriendController.getFriendRequests);
router.post('/request', authMiddleware, FriendController.sendFriendRequest);
router.post('/respond', authMiddleware, FriendController.respondToFriendRequest);

module.exports = router; 