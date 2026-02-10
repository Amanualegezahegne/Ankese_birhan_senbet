const express = require('express');
const router = express.Router();
const {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, admin, createCourse);

router.route('/:id')
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

module.exports = router;
