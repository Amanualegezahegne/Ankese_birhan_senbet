const express = require('express');
const router = express.Router();
const {
    addGrade,
    getGradesByStudent,
    getGradesByFilter,
    getGradesReport,
    importGrades,
    updateGrade,
    deleteGrade
} = require('../controllers/gradeController');
const { protect, teacher } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// All routes are protected
router.use(protect);

router.post('/', teacher, addGrade);
router.post('/import', teacher, upload.single('file'), importGrades);
router.get('/', teacher, getGradesByFilter);
router.get('/report', teacher, getGradesReport);
router.get('/student/:studentId', getGradesByStudent); // Access control handled in controller
router.route('/:id')
    .put(teacher, updateGrade)
    .delete(teacher, deleteGrade);

module.exports = router;
