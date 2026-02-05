const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        en: { type: String, required: true },
        am: { type: String, required: true }
    },
    content: {
        en: { type: String, required: true },
        am: { type: String, required: true }
    },
    category: {
        type: String,
        enum: ['Church', 'School', 'Holiday', 'Service'],
        default: 'Church'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
