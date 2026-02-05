const express = require('express');
const router = express.Router();
const {
    createMessage,
    getAllMessages,
    markAsRead
} = require('../controllers/messageController');

// Public routes
router.post('/', createMessage);

// Admin routes (TODO: Add authentication middleware)
router.get('/', getAllMessages);
router.put('/:id/read', markAsRead);

module.exports = router;
