const { supabase } = require('../config/db');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
    try {
        const { data: news, error } = await supabase
            .from('news')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

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
        let newsData = { ...req.body };

        // Handle stringified FormData
        if (typeof newsData.title === 'string' && newsData.title.startsWith('{')) newsData.title = JSON.parse(newsData.title);
        if (typeof newsData.content === 'string' && newsData.content.startsWith('{')) newsData.content = JSON.parse(newsData.content);

        // Handle image from upload or URL
        if (req.file) {
            newsData.image_url = `/uploads/${req.file.filename}`;
        } else if (newsData.imageUrl) {
            newsData.image_url = newsData.imageUrl;
            delete newsData.imageUrl;
        }

        const { data: news, error } = await supabase
            .from('news')
            .insert([newsData])
            .select()
            .single();

        if (error) throw error;

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
        let updateData = { ...req.body };

        // Handle stringified FormData
        if (typeof updateData.title === 'string' && updateData.title.startsWith('{')) updateData.title = JSON.parse(updateData.title);
        if (typeof updateData.content === 'string' && updateData.content.startsWith('{')) updateData.content = JSON.parse(updateData.content);

        // Handle image from upload or URL
        if (req.file) {
            updateData.image_url = `/uploads/${req.file.filename}`;
        } else if (updateData.imageUrl) {
            updateData.image_url = updateData.imageUrl;
            delete updateData.imageUrl;
        }

        const { data: news, error } = await supabase
            .from('news')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: 'News item not found' });
            throw error;
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
        const { data: news, error } = await supabase
            .from('news')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: 'News item not found' });
            throw error;
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
