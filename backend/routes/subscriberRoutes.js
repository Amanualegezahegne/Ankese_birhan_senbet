const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

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
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed'
            });
        }

        const subscriber = await Subscriber.create({ email });

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

// @desc    Get all subscribers (Admin use cases later)
// @route   GET /api/subscribers
// @access  Admin (placeholder for now)
router.get('/', async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort('-subscribedAt');
        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
