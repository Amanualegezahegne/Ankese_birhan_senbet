const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

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
            // Check status
            if (student.status === 'Pending') {
                return res.status(403).json({ success: false, message: 'Your account is pending approval' });
            }
            if (student.status === 'Rejected') {
                return res.status(403).json({ success: false, message: 'Your account has been rejected' });
            }

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

const XLSX = require('xlsx');
const fs = require('fs');

// @desc    Import students from Excel/CSV
// @route   POST /api/students/import
// @access  Private (Admin Only)
const importStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: 'File is empty' });
        }

        const studentsToInsert = [];
        const errors = [];
        const existingEmails = new Set((await Student.find({}, 'email')).map(s => s.email));

        for (const row of data) {
            // Basic mapping - case insensitive header checks could be added here
            const studentData = {
                name: row.Name || row.name || row['Full Name'],
                christianName: row['Christian Name'] || row.christianName || row['ክርስትና ስም'],
                email: row.Email || row.email || row['ኢሜይል'],
                phone: row.Phone || row.phone || row['ስልክ'],
                sex: row.Sex || row.sex || row['ጾታ'],
                nationalId: row['National ID'] || row.nationalId || row['መታወቂያ'],
                dob: row.DOB || row.dob || row['የትውልድ ቀን'],
                password: 'student123', // Default password
                status: 'Approved',
                hasServed: row.hasServed || 'no'
            };

            // Basic validation
            if (!studentData.name || !studentData.email) {
                errors.push(`Row missing name or email: ${JSON.stringify(row)}`);
                continue;
            }

            if (existingEmails.has(studentData.email)) {
                errors.push(`Email already exists: ${studentData.email}`);
                continue;
            }

            studentsToInsert.push(studentData);
            existingEmails.add(studentData.email);
        }

        if (studentsToInsert.length > 0) {
            // Using a loop with create to ensure pre-save hooks (like password hashing) run
            for (const student of studentsToInsert) {
                await Student.create(student);
            }
        }

        // Clean up file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${studentsToInsert.length} students.`,
            count: studentsToInsert.length,
            errors: errors.length > 0 ? errors : null
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Import Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete all students
// @route   DELETE /api/students/all
// @access  Private (Admin Only)
const deleteAllStudents = async (req, res) => {
    try {
        await Student.deleteMany({});
        res.status(200).json({ success: true, message: 'All students deleted successfully.' });
    } catch (error) {
        console.error('Delete All Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete single student
// @route   DELETE /api/students/:id
// @access  Private (Admin Only)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete Student Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const crypto = require('crypto');

// @desc    Forgot password (OTP)
// @route   POST /api/students/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.body.email });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student with this email not found' });
        }

        // Create 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and set to field
        student.resetOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // Set expire (10 minutes)
        student.resetOTPExpires = Date.now() + 10 * 60 * 1000;

        await student.save({ validateBeforeSave: false });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #007bff;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested a password reset. Please use the following 6-digit code to verify your account:</p>
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
                email: student.email,
                subject: 'Password Reset OTP',
                message
            });

            res.status(200).json({
                success: true,
                message: 'OTP sent to your email successfully.'
            });
        } catch (err) {
            console.error('Email sending failed:', err);
            student.resetOTP = undefined;
            student.resetOTPExpires = undefined;
            await student.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please check your credentials.' });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/students/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const student = await Student.findOne({
            email,
            resetOTP: hashedOTP,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!student) {
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
// @route   POST /api/students/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const student = await Student.findOne({
            email,
            resetOTP: hashedOTP,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!student) {
            return res.status(400).json({ success: false, message: 'Token invalid or expired. Please start over.' });
        }

        // Set new password
        student.password = password;
        student.resetOTP = undefined;
        student.resetOTPExpires = undefined;

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
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
    updateStudentProfile,
    importStudents,
    deleteAllStudents,
    deleteStudent,
    forgotPassword,
    verifyOTP,
    resetPassword
};
