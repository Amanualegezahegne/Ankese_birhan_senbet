const { supabase } = require('../config/db');

// @desc    Get all hymns
// @route   GET /api/hymns
// @access  Private (mezmure, admin)
const getHymns = async (req, res) => {
    try {
        const { category, language, search } = req.query;
        let query = supabase.from('hymns').select('*').order('created_at', { ascending: false });

        if (category) query = query.eq('category', category);
        if (language) query = query.eq('language', language);
        if (search) query = query.ilike('title', `%${search}%`);

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Get Hymns Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single hymn
// @route   GET /api/hymns/:id
// @access  Private (mezmure, admin)
const getHymnById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('hymns')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!data || error) {
            return res.status(404).json({ success: false, message: 'Hymn not found' });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create hymn
// @route   POST /api/hymns
// @access  Private (mezmure, admin)
const createHymn = async (req, res) => {
    try {
        const { title, lyrics, category, author, language } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const { data, error } = await supabase
            .from('hymns')
            .insert([{
                title,
                lyrics: lyrics || '',
                category: category || '',
                author: author || '',
                language: language || 'Amharic',
                created_by: req.user.id
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create Hymn Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update hymn
// @route   PUT /api/hymns/:id
// @access  Private (mezmure, admin)
const updateHymn = async (req, res) => {
    try {
        const { title, lyrics, category, author, language } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (lyrics !== undefined) updates.lyrics = lyrics;
        if (category !== undefined) updates.category = category;
        if (author !== undefined) updates.author = author;
        if (language !== undefined) updates.language = language;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('hymns')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (!data || error) {
            return res.status(404).json({ success: false, message: 'Hymn not found' });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Update Hymn Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete hymn
// @route   DELETE /api/hymns/:id
// @access  Private (mezmure, admin)
const deleteHymn = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('hymns')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (!data || error) {
            return res.status(404).json({ success: false, message: 'Hymn not found' });
        }

        res.status(200).json({ success: true, message: 'Hymn deleted successfully' });
    } catch (error) {
        console.error('Delete Hymn Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHymns, getHymnById, createHymn, updateHymn, deleteHymn };
