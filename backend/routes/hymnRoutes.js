const express = require('express');
const router = express.Router();
const { getHymns, getHymnById, createHymn, updateHymn, deleteHymn, bulkImportHymns } = require('../controllers/hymnController');
const { protect, mezmure } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// Bulk import — mezmure/admin only
router.post('/import', protect, mezmure, upload.single('file'), bulkImportHymns);

// GET open to all authenticated users (students can read)
router.route('/')
    .get(protect, getHymns)
    .post(protect, mezmure, createHymn);

router.route('/:id')
    .get(protect, getHymnById)
    .put(protect, mezmure, updateHymn)
    .delete(protect, mezmure, deleteHymn);

module.exports = router;
