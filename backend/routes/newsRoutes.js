const express = require('express');
const router = express.Router();
const { getNews, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');

// TODO: Add auth middleware for createNews (Admin only)
router.route('/')
    .get(getNews)
    .post(protect, createNews);

router.route('/:id')
    .put(protect, updateNews)
    .delete(protect, deleteNews);

module.exports = router;
