const Message = require('../models/Message');

// @desc    Create a new message
// @route   POST /api/messages
// @access  Public
const createMessage = async (req, res) => {
    try {
        const { name, email, message, source } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        // Create message
        const newMessage = await Message.create({
            name,
            email,
            message,
            source: source || 'user'
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully!',
            data: newMessage
        });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin only - TODO: Add auth)
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private (Admin only - TODO: Add auth)
const markAsRead = async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update message',
            error: error.message
        });
    }
};

module.exports = {
    createMessage,
    getAllMessages,
    markAsRead
};
