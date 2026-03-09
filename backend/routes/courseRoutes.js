const express = require('express');
const router = express.Router();
const {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    uploadMaterial,
    deleteMaterial
} = require('../controllers/courseController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.route('/')
    .get(getCourses)
    .post(protect, admin, upload.single('file'), createCourse);

router.route('/:id')
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

// Materials routes
router.post('/:id/materials', protect, admin, upload.single('file'), uploadMaterial);
router.delete('/:id/materials/:materialId', protect, admin, deleteMaterial);

module.exports = router;
