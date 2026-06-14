const express = require('express');
const router = express.Router();
const { getHymns, getHymnById, createHymn, updateHymn, deleteHymn } = require('../controllers/hymnController');
const { protect, mezmure } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, mezmure, getHymns)
    .post(protect, mezmure, createHymn);

router.route('/:id')
    .get(protect, mezmure, getHymnById)
    .put(protect, mezmure, updateHymn)
    .delete(protect, mezmure, deleteHymn);

module.exports = router;
