const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
    try {
        const news = await News.find().sort({ date: -1 });
        res.status(200).json({ success: true, count: news.length, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private (Admin)
const createNews = async (req, res) => {
    try {
        const news = await News.create(req.body);
        res.status(201).json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private (Admin)
const updateNews = async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!news) {
            return res.status(404).json({ success: false, message: 'News item not found' });
        }

        res.status(200).json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private (Admin)
const deleteNews = async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'News item not found' });
        }

        res.status(200).json({ success: true, message: 'News item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNews,
    createNews,
    updateNews,
    deleteNews
};
