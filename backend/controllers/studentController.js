const { supabase } = require('../config/db');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data: studentExists } = await supabase
            .from('students')
            .select('id')
            .eq('email', email)
            .single();

        if (studentExists) {
            return res.status(400).json({ success: false, message: 'Student with this email already exists' });
        }

        // Hash password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const studentData = { ...req.body, password: hashedPassword };

        const { data: student, error } = await supabase
            .from('students')
            .insert([studentData])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: student
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all students (or teachers based on role query)
// @route   GET /api/students
// @access  Private (Admin Only)
const getAllStudents = async (req, res) => {
    try {
        const { role } = req.query;
        let query = supabase.from('students').select('*').order('created_at', { ascending: false });

        if (role) {
            query = query.eq('role', role);
        }

        const { data: students, error } = await query;

        if (error) throw error;

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Fetch Students/Teachers Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin Only)
const getStudentById = async (req, res) => {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!student || error) {
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
        const { data: student, error } = await supabase
            .from('students')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (!student || error) {
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

        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .single();

        if (student && (await bcrypt.compare(password, student.password))) {
            // Check status
            if (student.status === 'Pending') {
                return res.status(403).json({ success: false, message: 'Your account is pending approval' });
            }
            if (student.status === 'Rejected') {
                return res.status(403).json({ success: false, message: 'Your account has been rejected' });
            }

            const token = jwt.sign({ id: student.id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.json({
                success: true,
                token,
                student: {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    role: student.role
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
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', req.user.id)
            .single();

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
        const { data: student, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (!student || fetchError) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const updates = { ...req.body };
        
        // Check if password change is requested
        if (req.body.password) {
            const { currentPassword } = req.body;

            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Current password is required to change password' });
            }

            const isMatch = await bcrypt.compare(currentPassword, student.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid current password' });
            }

            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(req.body.password, salt);
        } else {
            delete updates.password;
        }

        const { data: updatedStudent, error: updateError } = await supabase
            .from('students')
            .update(updates)
            .eq('id', student.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            data: {
                id: updatedStudent.id,
                name: updatedStudent.name,
                email: updatedStudent.email,
                role: updatedStudent.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

        const { data: existingStudents } = await supabase.from('students').select('email');
        const existingEmails = new Set(existingStudents.map(s => s.email));

        const studentsToInsert = [];
        const errors = [];
        const salt = await bcrypt.genSalt(10);
        const defaultHashedPassword = await bcrypt.hash('student123', salt);

        for (const row of data) {
            const studentData = {
                name: row.Name || row.name || row['Full Name'],
                christian_name: row['Christian Name'] || row.christianName || row['ክርስትና ስም'],
                email: row.Email || row.email || row['ኢሜይል'],
                phone: row.Phone || row.phone || row['ስልክ'],
                sex: row.Sex || row.sex || row['ጾታ'],
                national_id: row['National ID'] || row.nationalId || row['መታወቂያ'],
                dob: row.DOB || row.dob || row['የትውልድ ቀን'],
                password: defaultHashedPassword,
                status: 'Approved',
                has_served: row.hasServed || row.has_served || 'no'
            };

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
            const { error } = await supabase.from('students').insert(studentsToInsert);
            if (error) throw error;
        }

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
        const { error } = await supabase.from('students').delete().neq('role', 'admin'); // Safely delete only non-admins if role mixed
        if (error) throw error;
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
        const { data: student, error } = await supabase
            .from('students')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (!student || error) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete Student Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password (OTP)
// @route   POST /api/students/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', req.body.email)
            .single();

        if (!student || error) {
            return res.status(404).json({ success: false, message: 'Student with this email not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await supabase
            .from('students')
            .update({ reset_otp: hashedOTP, reset_otp_expires: expires })
            .eq('id', student.id);

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
            await sendEmail({ email: student.email, subject: 'Password Reset OTP', message });
            res.status(200).json({ success: true, message: 'OTP sent to your email successfully.' });
        } catch (err) {
            await supabase.from('students').update({ reset_otp: null, reset_otp_expires: null }).eq('id', student.id);
            return res.status(500).json({ success: false, message: 'Email could not be sent.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/students/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const { data: student, error } = await supabase
            .from('students')
            .select('id')
            .eq('email', email)
            .eq('reset_otp', hashedOTP)
            .gt('reset_otp_expires', new Date().toISOString())
            .single();

        if (!student || error) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/students/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const { data: student, error } = await supabase
            .from('students')
            .select('id')
            .eq('email', email)
            .eq('reset_otp', hashedOTP)
            .gt('reset_otp_expires', new Date().toISOString())
            .single();

        if (!student || error) {
            return res.status(400).json({ success: false, message: 'Token invalid or expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await supabase
            .from('students')
            .update({ password: hashedPassword, reset_otp: null, reset_otp_expires: null })
            .eq('id', student.id);

        res.status(200).json({ success: true, message: 'Password reset successful' });
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
    updateStudentProfile,
    importStudents,
    deleteAllStudents,
    deleteStudent,
    forgotPassword,
    verifyOTP,
    resetPassword
};
