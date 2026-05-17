const { supabase } = require('../config/db');
const path = require('path');
const fs = require('fs');

const mapCourseForFrontend = (course) => {
    if (!course) return course;
    return {
        ...course,
        _id: course.id,
        materials: Array.isArray(course.materials) ? course.materials.map(m => ({
            ...m,
            _id: m.id
        })) : []
    };
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .order('title', { ascending: true });

        if (error) throw error;

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses.map(mapCourseForFrontend)
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const courseData = { ...req.body };

        // If a file was uploaded during creation, add it to materials
        if (req.file) {
            courseData.materials = [{
                id: crypto.randomUUID(),
                name: req.body.materialName || req.file.originalname,
                url: `/uploads/${req.file.filename}`,
                fileType: path.extname(req.file.originalname).substring(1)
            }];
        } else {
            courseData.materials = [];
        }

        const { data: course, error } = await supabase
            .from('courses')
            .insert([courseData])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({
                    success: false,
                    error: 'Course title already exists'
                });
            }
            throw error;
        }

        res.status(201).json({
            success: true,
            data: mapCourseForFrontend(course)
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const { data: course, error } = await supabase
            .from('courses')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ success: false, error: 'Course not found' });
            throw error;
        }

        res.status(200).json({
            success: true,
            data: mapCourseForFrontend(course)
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const { data: course, error } = await supabase
            .from('courses')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ success: false, error: 'Course not found' });
            throw error;
        }

        // Optional: Clean up material files from filesystem
        if (course.materials && Array.isArray(course.materials)) {
            course.materials.forEach(mat => {
                const filePath = path.join(__dirname, '..', mat.url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Upload material to course
// @route   POST /api/courses/:id/materials
// @access  Private/Admin
exports.uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const { data: course, error: fetchError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!course || fetchError) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const newMaterial = {
            id: require('crypto').randomUUID(),
            name: req.body.name || req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            fileType: path.extname(req.file.originalname).substring(1)
        };

        const materials = [...(course.materials || []), newMaterial];

        const { data: updatedCourse, error: updateError } = await supabase
            .from('courses')
            .update({ materials })
            .eq('id', course.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.status(200).json({
            success: true,
            data: { ...newMaterial, _id: newMaterial.id }
        });
    } catch (error) {
        console.error('Error uploading material:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete material from course
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private/Admin
exports.deleteMaterial = async (req, res) => {
    try {
        const { data: course, error: fetchError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!course || fetchError) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const materialIndex = course.materials.findIndex(m => m.id === req.params.materialId);
        if (materialIndex === -1) {
            return res.status(404).json({ success: false, error: 'Material not found' });
        }

        const material = course.materials[materialIndex];

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', material.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const newMaterials = course.materials.filter(m => m.id !== req.params.materialId);

        const { error: updateError } = await supabase
            .from('courses')
            .update({ materials: newMaterials })
            .eq('id', course.id);

        if (updateError) throw updateError;

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
