const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true
    },
    christianName: {
        type: String,
        required: [true, 'Please provide christian name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        trim: true
    },
    sex: {
        type: String,
        enum: ['male', 'female', 'ወንድ', 'ሴት'],
        required: [true, 'Please provide sex']
    },
    nationalId: {
        type: String,
        required: [true, 'Please provide national id'],
        trim: true
    },
    dob: {
        type: Date,
        required: [true, 'Please provide date of birth']
    },
    hasServed: {
        type: String,
        enum: ['yes', 'no'],
        required: [true, 'Please provide if served before']
    },
    previousChurch: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
        select: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    resetOTP: String,
    resetOTPExpires: Date
}, {
    timestamps: true
});

const bcrypt = require('bcryptjs');

studentSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
