const express = require('express');
const router = express.Router();
const { getHymns, getHymnById, createHymn, updateHymn, deleteHymn } = require('../controllers/hymnController');
const { protect, mezmure } = require('../middleware/authMiddleware');

// GET is open to all authenticated users (students can read)
// POST/PUT/DELETE require mezmure or admin role
router.route('/')
    .get(protect, getHymns)
    .post(protect, mezmure, createHymn);

router.route('/:id')
    .get(protect, getHymnById)
    .put(protect, mezmure, updateHymn)
    .delete(protect, mezmure, deleteHymn);

module.exports = router;
