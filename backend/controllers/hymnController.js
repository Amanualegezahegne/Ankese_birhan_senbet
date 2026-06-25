const { supabase } = require('../config/db');
const XLSX = require('xlsx');
const fs = require('fs');

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

// @desc    Bulk import hymns from Excel/CSV
// @route   POST /api/hymns/import
// @access  Private (mezmure, admin)
const bulkImportHymns = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        fs.unlinkSync(req.file.path); // clean up temp file

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'File is empty' });
        }

        const hymnsToInsert = [];
        const errors = [];

        rows.forEach((row, i) => {
            const title = row.title || row.Title || row['ርዕስ'];
            if (!title) {
                errors.push(`Row ${i + 2}: missing title`);
                return;
            }
            hymnsToInsert.push({
                title: String(title).trim(),
                lyrics: String(row.lyrics || row.Lyrics || row['ግጥም'] || '').trim(),
                category: String(row.category || row.Category || row['ምድብ'] || '').trim(),
                author: String(row.author || row.Author || row['ደራሲ'] || '').trim(),
                language: String(row.language || row.Language || row['ቋንቋ'] || 'Amharic').trim(),
                created_by: req.user.id
            });
        });

        if (hymnsToInsert.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid hymns found', errors });
        }

        const { error } = await supabase.from('hymns').insert(hymnsToInsert);
        if (error) throw error;

        res.status(201).json({
            success: true,
            message: `Successfully imported ${hymnsToInsert.length} hymn(s).`,
            count: hymnsToInsert.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('Bulk Import Hymns Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHymns, getHymnById, createHymn, updateHymn, deleteHymn, bulkImportHymns };
