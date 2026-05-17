const { supabase } = require('../config/db');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

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
                teacher_id: req.user.role === 'admin' ? null : req.user.id,
                course,
                mid_exam: req.body.mid_exam || 0,
                final_exam: req.body.final_exam || 0,
                assignment: req.body.assignment || 0,
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
        fs.appendFileSync(path.join(__dirname, '../error_log.txt'), `Add Grade Error at ${new Date().toISOString()}: ${error.message}\n${error.stack}\n\n`);
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

        const validFields = ['course', 'mid_exam', 'final_exam', 'assignment', 'score', 'semester', 'year', 'status'];
        const updateData = {};
        for (const key of validFields) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        }

        const { data: updatedGrade, error: updateError } = await supabase
            .from('grades')
            .update(updateData)
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
        fs.appendFileSync(path.join(__dirname, '../error_log.txt'), `Update Grade Error at ${new Date().toISOString()}: ${error.message}\n${error.stack}\n\n`);
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

// @desc    Get report/analysis of grades by grade level
// @route   GET /api/grades/report
// @access  Private (Teacher/Admin)
const getGradesReport = async (req, res) => {
    try {
        const { data: grades, error } = await supabase
            .from('grades')
            .select(`
                score,
                status,
                student:students!student_id (grade)
            `);

        if (error) throw error;

        // Aggregate by grade level
        const report = {};
        let totalPass = 0;
        let totalFail = 0;
        let scoreSum = 0;
        let scoreCount = 0;

        grades.forEach(g => {
            const gradeLevel = (g.student && g.student.grade) ? g.student.grade : 'Unknown';
            if (!report[gradeLevel]) {
                report[gradeLevel] = {
                    grade: gradeLevel,
                    totalGrades: 0,
                    pass: 0,
                    fail: 0,
                    scoreSum: 0,
                    scoreCount: 0
                };
            }

            report[gradeLevel].totalGrades++;
            if (g.status === 'Pass') {
                report[gradeLevel].pass++;
                totalPass++;
            } else if (g.status === 'Fail') {
                report[gradeLevel].fail++;
                totalFail++;
            }

            if (g.score !== null && g.score !== undefined && g.score !== '') {
                const score = Number(g.score);
                report[gradeLevel].scoreSum += score;
                report[gradeLevel].scoreCount++;
                scoreSum += score;
                scoreCount++;
            }
        });

        const reportData = Object.values(report).map(r => ({
            ...r,
            averageScore: r.scoreCount > 0 ? (r.scoreSum / r.scoreCount).toFixed(2) : 0,
            passRate: r.totalGrades > 0 ? ((r.pass / r.totalGrades) * 100).toFixed(2) : 0
        })).sort((a, b) => {
            // Sort by grade level numerically if possible
            const aNum = parseInt(a.grade);
            const bNum = parseInt(b.grade);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return a.grade.localeCompare(b.grade);
        });

        res.status(200).json({
            success: true,
            data: {
                byGrade: reportData,
                summary: {
                    totalGrades: grades.length,
                    totalPass,
                    totalFail,
                    overallAverage: scoreCount > 0 ? (scoreSum / scoreCount).toFixed(2) : 0,
                    overallPassRate: grades.length > 0 ? ((totalPass / grades.length) * 100).toFixed(2) : 0
                }
            }
        });
    } catch (error) {
        console.error('Get Grades Report Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Import grades from Excel/CSV
// @route   POST /api/grades/import
// @access  Private (Teacher/Admin)
const importGrades = async (req, res) => {
    try {
        const { course, semester, year, passingScore } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        if (!course || !semester || !year) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide course, semester, and year' });
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

        // Fetch all students to match by email or name
        const { data: students, error: studentError } = await supabase
            .from('students')
            .select('id, name, email')
            .eq('role', 'student');

        if (studentError) throw studentError;

        const gradesToUpsert = [];
        const errors = [];
        const limit = Number(passingScore) || 50;

        for (const row of data) {
            const studentEmail = row.Email || row.email || row['ኢሜይል'];
            const studentName = row.Name || row.name || row['Full Name'] || row['የተማሪ ስም'];
            const score = row.Score || row.score || row['ውጤት'];

            if (score === undefined || score === null) {
                errors.push(`Row missing score: ${JSON.stringify(row)}`);
                continue;
            }

            let student = null;
            if (studentEmail) {
                student = students.find(s => s.email?.toLowerCase() === studentEmail.toString().toLowerCase());
            }
            
            if (!student && studentName) {
                student = students.find(s => s.name?.toLowerCase() === studentName.toString().toLowerCase());
            }

            if (!student) {
                errors.push(`Student not found: ${studentEmail || studentName}`);
                continue;
            }

            const scoreVal = Number(score);
            const statusVal = scoreVal >= limit ? 'Pass' : 'Fail';

            gradesToUpsert.push({
                student_id: student.id,
                teacher_id: req.user.id,
                course,
                semester,
                year,
                score: scoreVal,
                status: statusVal
            });
        }

        if (gradesToUpsert.length > 0) {
            // Upsert: check for existing grades for the same student/course/semester/year
            for (const grade of gradesToUpsert) {
                const { data: existing, error: findError } = await supabase
                    .from('grades')
                    .select('id')
                    .eq('student_id', grade.student_id)
                    .eq('course', grade.course)
                    .eq('semester', grade.semester)
                    .eq('year', grade.year)
                    .maybeSingle();

                if (existing) {
                    await supabase.from('grades').update(grade).eq('id', existing.id);
                } else {
                    await supabase.from('grades').insert([grade]);
                }
            }
        }

        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: `Successfully processed ${gradesToUpsert.length} grades.`,
            count: gradesToUpsert.length,
            errors: errors.length > 0 ? errors : null
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Import Grades Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addGrade,
    getGradesByStudent,
    getGradesByFilter,
    getGradesReport,
    importGrades,
    updateGrade,
    deleteGrade
};
