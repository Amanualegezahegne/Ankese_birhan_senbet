const { supabase } = require('../config/db');

// @desc    Create a new message
// @route   POST /api/messages
// @access  Public
const createMessage = async (req, res) => {
    try {
        const { name, email, message, subject, source } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        // Create message in Supabase
        const { data: newMessage, error } = await supabase
            .from('messages')
            .insert([{
                name,
                email,
                message,
                subject: subject || null,
                is_read: false,
                source: source || 'user'
            }])
            .select()
            .single();

        if (error) throw error;

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
// @access  Private (Admin only)
const getAllMessages = async (req, res) => {
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

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
// @access  Private (Admin only)
const markAsRead = async (req, res) => {
    try {
        const { data: message, error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Message not found' });
            throw error;
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

// @desc    Get unread messages count
// @route   GET /api/messages/unread-count
// @access  Private (Admin only)
const getUnreadCount = async (req, res) => {
    try {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (error) throw error;
        
        res.status(200).json({
            success: true,
            count: count || 0
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message
        });
    }
};

module.exports = {
    createMessage,
    getAllMessages,
    getUnreadCount,
    markAsRead
};
