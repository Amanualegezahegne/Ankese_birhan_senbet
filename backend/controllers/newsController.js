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
        let newsData = req.body;

        // If data is sent via FormData, nested objects might be stringified
        if (typeof newsData.title === 'string') newsData.title = JSON.parse(newsData.title);
        if (typeof newsData.content === 'string') newsData.content = JSON.parse(newsData.content);

        // Handle image from upload or URL
        if (req.file) {
            newsData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const news = await News.create(newsData);
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
        let updateData = req.body;

        // Handle stringified FormData
        if (typeof updateData.title === 'string') updateData.title = JSON.parse(updateData.title);
        if (typeof updateData.content === 'string') updateData.content = JSON.parse(updateData.content);

        // Handle image from upload or URL
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const news = await News.findByIdAndUpdate(req.params.id, updateData, {
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
