const { validationResult } = require('express-validator');
const friendService = require('../services/friendService');

class FriendController {
  /**
   * Get all friends for the authenticated user
   */
  async getFriends(req, res, next) {
    try {
      const friends = await friendService.getFriends(req.user.id);
      res.json(friends);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all friend requests for the authenticated user
   */
  async getFriendRequests(req, res, next) {
    try {
      const requests = await friendService.getFriendRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send a friend request to another user
   */
  async sendFriendRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { userId } = req.params;
      
      // Check if trying to add self
      if (userId === req.user.id) {
        return res.status(400).json({ msg: 'Cannot send friend request to yourself' });
      }
      
      const request = await friendService.sendFriendRequest(req.user.id, userId);
      res.json(request);
    } catch (error) {
      if (error.message === 'User not found' || error.message === 'Friend request already sent' || error.message === 'Users are already friends') {
        return res.status(400).json({ msg: error.message });
      }
      next(error);
    }
  }

  /**
   * Accept or reject a friend request
   */
  async respondToFriendRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { requestId } = req.params;
      const { accept } = req.body;
      
      const result = await friendService.respondToFriendRequest(requestId, req.user.id, accept);
      res.json(result);
    } catch (error) {
      if (error.message === 'Friend request not found' || error.message === 'Not authorized to respond to this request') {
        return res.status(400).json({ msg: error.message });
      }
      next(error);
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { friendId } = req.params;
      
      await friendService.removeFriend(req.user.id, friendId);
      res.json({ msg: 'Friend removed successfully' });
    } catch (error) {
      if (error.message === 'Friend not found') {
        return res.status(404).json({ msg: error.message });
      }
      next(error);
    }
  }
}

module.exports = new FriendController(); 