const Student = require('../models/Student');

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = async (req, res) => {
    try {
        console.log('Registration Payload:', req.body);
        const studentExists = await Student.findOne({ email: req.body.email });
        if (studentExists) {
            console.log('Student exists for email:', req.body.email);
            return res.status(400).json({ success: false, message: 'Student with this email already exists' });
        }

        const student = await Student.create(req.body);
        console.log('Student registered successfully:', student.email);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: student
        });
    } catch (error) {
        console.error('Registration Error Details:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin Only)
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Fetch Students Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin Only)
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update student status
// @route   PUT /api/students/:id/status
// @access  Private (Admin Only)
const updateStudentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerStudent,
    getAllStudents,
    getStudentById,
    updateStudentStatus
};
