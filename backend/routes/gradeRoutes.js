const express = require('express');
const router = express.Router();
const {
    addGrade,
    getGradesByStudent,
    getGradesByFilter,
    updateGrade,
    deleteGrade
} = require('../controllers/gradeController');
const { protect, teacher } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.post('/', teacher, addGrade);
router.get('/', teacher, getGradesByFilter);
router.get('/student/:studentId', getGradesByStudent); // Access control handled in controller
router.route('/:id')
    .put(teacher, updateGrade)
    .delete(teacher, deleteGrade);

module.exports = router;
