const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Teachers are also in the Student collection with role='teacher'
        required: true
    },
    course: {
        type: String,
        required: [true, 'Please add a course']
    },
    score: {
        type: Number,
        required: [true, 'Please add a score']
    },
    semester: {
        type: String,
        required: [true, 'Please add a semester']
    },
    year: {
        type: String,
        required: [true, 'Please add a year']
    },
    status: {
        type: String,
        default: '-'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Grade', gradeSchema);
