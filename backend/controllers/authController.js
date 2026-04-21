const { supabase } = require('../config/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

// @desc    Register a new admin (one-time setup or via internal tools)
// @route   POST /api/auth/register
// @access  Public (Should be private in production)
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password manually (since Mongoose hooks are gone)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword }])
            .select()
            .single();

        if (error) throw error;

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
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
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
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
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
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
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updates = {};
        
        // Verify current password if password is being changed
        if (req.body.password) {
            if (!req.body.currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide current password to update password'
                });
            }

            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Incorrect current password'
                });
            }
            
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.body.email) updates.email = req.body.email;

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password (OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', req.body.email)
            .single();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User with this email not found' });
        }

        // Create 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and set to field
        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // Set expire (10 minutes)
        const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const { error: updateError } = await supabase
            .from('users')
            .update({ reset_otp: hashedOTP, reset_otp_expires: expires })
            .eq('id', user.id);

        if (updateError) throw updateError;

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
            await supabase
                .from('users')
                .update({ reset_otp: null, reset_otp_expires: null })
                .eq('id', user.id);
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

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('reset_otp', hashedOTP)
            .gt('reset_otp_expires', new Date().toISOString())
            .single();

        if (!user || error) {
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

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('reset_otp', hashedOTP)
            .gt('reset_otp_expires', new Date().toISOString())
            .single();

        if (!user || fetchError) {
            return res.status(400).json({ success: false, message: 'Token invalid or expired. Please start over.' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                password: hashedPassword, 
                reset_otp: null, 
                reset_otp_expires: null 
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

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
