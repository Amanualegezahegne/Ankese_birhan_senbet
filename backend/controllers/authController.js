const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

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

// @desc    Forgot password (OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User with this email not found' });
        }

        // Create 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and set to field
        user.resetOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #007bff;">Admin Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested a password reset for the Admin panel. Please use the following 6-digit code to verify your account:</p>
                <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777;">Ankese Birhan Sunday School Management System</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message
            });

            res.status(200).json({
                success: true,
                message: 'OTP sent to your email successfully.'
            });
        } catch (err) {
            console.error('Email sending failed:', err);
            user.resetOTP = undefined;
            user.resetOTPExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please check your credentials.' });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const user = await User.findOne({
            email,
            resetOTP: hashedOTP,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const user = await User.findOne({
            email,
            resetOTP: hashedOTP,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Token invalid or expired. Please start over.' });
        }

        // Set new password
        user.password = password;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getAdminProfile, updateAdminProfile, forgotPassword, verifyOTP, resetPassword };
