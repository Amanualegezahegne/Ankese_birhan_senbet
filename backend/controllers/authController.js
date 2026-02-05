const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register a new admin (one-time setup or via internal tools)
// @route   POST /api/auth/register
// @access  Public (Should be private in production)
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ email, password });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                success: true,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private/Admin
const updateAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (user) {
            // Verify current password if password is being changed
            if (req.body.password) {
                if (!req.body.currentPassword) {
                    return res.status(400).json({
                        success: false,
                        message: 'Please provide current password to update password'
                    });
                }

                const isMatch = await user.matchPassword(req.body.currentPassword);
                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect current password'
                    });
                }
                user.password = req.body.password;
            }

            user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            res.json({
                success: true,
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    role: updatedUser.role
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getAdminProfile, updateAdminProfile };
