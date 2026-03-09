const Course = require('../models/Course');
const path = require('path');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ title: 1 });
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
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
                name: req.body.materialName || req.file.originalname,
                url: `/uploads/${req.file.filename}`,
                fileType: path.extname(req.file.originalname).substring(1)
            }];
        }

        const course = await Course.create(courseData);
        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Course title already exists'
            });
        }
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
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
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
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        await course.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
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

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const newMaterial = {
            name: req.body.name || req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            fileType: path.extname(req.file.originalname).substring(1)
        };

        course.materials.push(newMaterial);
        await course.save();

        res.status(200).json({
            success: true,
            data: course.materials[course.materials.length - 1]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete material from course
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private/Admin
exports.deleteMaterial = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const material = course.materials.id(req.params.materialId);
        if (!material) {
            return res.status(404).json({ success: false, error: 'Material not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', material.url);
        if (require('fs').existsSync(filePath)) {
            require('fs').unlinkSync(filePath);
        }

        material.deleteOne();
        await course.save();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
