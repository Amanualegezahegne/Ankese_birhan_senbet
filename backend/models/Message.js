const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        lowercase: true
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
