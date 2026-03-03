const express = require('express');
const router = express.Router();
const {
    createMessage,
    getAllMessages,
    markAsRead,
    getUnreadCount
} = require('../controllers/messageController');

// Public routes
router.post('/', createMessage);

// Admin routes (TODO: Add authentication middleware)
router.get('/', getAllMessages);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);

module.exports = router;
