const { supabase } = require('../config/db');

// @desc    Add a grade
// @route   POST /api/grades
// @access  Private (Teacher/Admin)
const addGrade = async (req, res) => {
    try {
        const { studentId, course, score, semester, year, status } = req.body;

        // Verify student exists and is actually a student
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('id, role')
            .eq('id', studentId)
            .single();

        if (!student || studentError || student.role !== 'student') {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const { data: grade, error: gradeError } = await supabase
            .from('grades')
            .insert([{
                student_id: studentId,
                teacher_id: req.user.id,
                course,
                score,
                semester,
                year,
                status: status || '-'
            }])
            .select()
            .single();

        if (gradeError) throw gradeError;

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
        if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized to view these grades' });
        }

        const { data: grades, error } = await supabase
            .from('grades')
            .select(`
                *,
                teacher:students!teacher_id (name, email)
            `)
            .eq('student_id', studentId)
            .order('year', { ascending: false })
            .order('semester', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

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
        const { data: existingGrade, error: fetchError } = await supabase
            .from('grades')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!existingGrade || fetchError) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        // Check if user is authorized to update (Admin or the Teacher who created it)
        if (req.user.role !== 'admin' && existingGrade.teacher_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this grade' });
        }

        const { data: updatedGrade, error: updateError } = await supabase
            .from('grades')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.status(200).json({
            success: true,
            data: updatedGrade
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
        const { data: existingGrade, error: fetchError } = await supabase
            .from('grades')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!existingGrade || fetchError) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        // Check if user is authorized to delete
        if (req.user.role !== 'admin' && existingGrade.teacher_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this grade' });
        }

        const { error: deleteError } = await supabase
            .from('grades')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

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

        const { data: grades, error } = await supabase
            .from('grades')
            .select(`
                *,
                student:students!student_id (name, email),
                teacher:students!teacher_id (name, email)
            `)
            .eq('course', course)
            .eq('semester', semester)
            .eq('year', year);

        if (error) throw error;

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
