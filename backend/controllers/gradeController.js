const Grade = require('../models/Grade');
const Student = require('../models/Student');

// @desc    Add a grade
// @route   POST /api/grades
// @access  Private (Teacher/Admin)
const addGrade = async (req, res) => {
    try {
        const { studentId, course, score, semester, year, status } = req.body;

        // Verify student exists and is actually a student
        const student = await Student.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const grade = await Grade.create({
            student: studentId,
            teacher: req.user._id, // Assumes req.user is set by auth middleware
            course,
            score,
            semester,
            year,
            status
        });

        res.status(201).json({
            success: true,
            data: grade
        });
    } catch (error) {
        console.error('Add Grade Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get grades for a specific student
// @route   GET /api/grades/student/:studentId
// @access  Private (Teacher/Admin/Student themselves)
const getGradesByStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Check authorization: Admin, Teacher, or the Student themselves
        if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized to view these grades' });
        }

        const grades = await Grade.find({ student: studentId })
            .populate('teacher', 'name email') // Populate teacher details
            .sort({ year: -1, semester: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: grades.length,
            data: grades
        });
    } catch (error) {
        console.error('Get Grades Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a grade
// @route   PUT /api/grades/:id
// @access  Private (Teacher/Admin)
const updateGrade = async (req, res) => {
    try {
        let grade = await Grade.findById(req.params.id);

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        // Check if user is authorized to update (Admin or the Teacher who created it)
        // For simplicity, we'll allow any teacher to update for now, or restrict to creator:
        if (req.user.role !== 'admin' && grade.teacher.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this grade' });
        }

        grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: grade
        });
    } catch (error) {
        console.error('Update Grade Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a grade
// @route   DELETE /api/grades/:id
// @access  Private (Teacher/Admin)
const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        // Check if user is authorized to delete
        if (req.user.role !== 'admin' && grade.teacher.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this grade' });
        }

        await grade.deleteOne();

        res.status(200).json({ success: true, message: 'Grade removed' });
    } catch (error) {
        console.error('Delete Grade Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get grades by filter (subject, semester, year)
// @route   GET /api/grades
// @access  Private (Teacher/Admin)
const getGradesByFilter = async (req, res) => {
    try {
        const { course, semester, year } = req.query;

        if (!course || !semester || !year) {
            return res.status(400).json({ success: false, message: 'Please provide course, semester, and year' });
        }

        const grades = await Grade.find({ course, semester, year })
            .populate('student', 'name email id')
            .populate('teacher', 'name email');

        res.status(200).json({
            success: true,
            count: grades.length,
            data: grades
        });
    } catch (error) {
        console.error('Get Grades By Filter Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addGrade,
    getGradesByStudent,
    getGradesByFilter,
    updateGrade,
    deleteGrade
};
