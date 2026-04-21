const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // Check if already subscribed
        const { data: existingSubscriber } = await supabase
            .from('subscribers')
            .select('id')
            .eq('email', email)
            .single();

        if (existingSubscriber) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed'
            });
        }

        const { data: subscriber, error } = await supabase
            .from('subscribers')
            .insert([{ email }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: subscriber,
            message: 'Thank you for subscribing!'
        });
    } catch (err) {
        console.error('Subscription error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Admin
router.get('/', async (req, res) => {
    try {
        const { data: subscribers, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (err) {
        console.error('Fetch subscribers error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
