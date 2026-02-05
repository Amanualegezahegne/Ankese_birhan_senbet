const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

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

// @desc    Login student
// @route   POST /api/students/login
// @access  Public
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email }).select('+password');

        if (student && (await student.matchPassword(password))) {
            const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.json({
                success: true,
                token,
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Authenticated Student)
const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (student) {
            res.json({
                success: true,
                data: student
            });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Authenticated Student)
const updateStudentProfile = async (req, res) => {
    try {
        // Need to select password explicitly to verify it
        const student = await Student.findById(req.user._id).select('+password');

        if (student) {
            // Check if password change is requested
            if (req.body.password) {
                const { currentPassword } = req.body;

                if (!currentPassword) {
                    return res.status(400).json({ success: false, message: 'Current password is required to change password' });
                }

                const isMatch = await student.matchPassword(currentPassword);
                if (!isMatch) {
                    return res.status(401).json({ success: false, message: 'Invalid current password' });
                }

                student.password = req.body.password;
            }

            student.name = req.body.name || student.name;
            student.email = req.body.email || student.email;
            student.christianName = req.body.christianName || student.christianName;
            student.phone = req.body.phone || student.phone;

            const updatedStudent = await student.save();

            res.json({
                success: true,
                data: {
                    id: updatedStudent._id,
                    name: updatedStudent.name,
                    email: updatedStudent.email
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerStudent,
    loginStudent,
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    getStudentProfile,
    updateStudentProfile
};
