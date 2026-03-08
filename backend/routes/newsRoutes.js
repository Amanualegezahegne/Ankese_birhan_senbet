const express = require('express');
const router = express.Router();
const { getNews, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// TODO: Add auth middleware for createNews (Admin only)
router.route('/')
    .get(getNews)
    .post(protect, upload.single('image'), createNews);

router.route('/:id')
    .put(protect, upload.single('image'), updateNews)
    .delete(protect, deleteNews);

module.exports = router;
