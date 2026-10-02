import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaEdit, FaPlus, FaBook, FaDownload, FaTimes, FaCloudUploadAlt, FaSave } from 'react-icons/fa';
import '../Styles/CourseManagement.css'; 

const CourseManagement = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', grade: '' });
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    
    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);
    
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [materialFile, setMaterialFile] = useState(null);
    const [materialName, setMaterialName] = useState('');
    const [uploadingMaterial, setUploadingMaterial] = useState(false);
    const [creationFile, setCreationFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setStatus({ type: 'error', message: 'Failed to load courses' });
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(courses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCourses = courses.slice(startIndex, startIndex + itemsPerPage);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const token = sessionStorage.getItem('adminToken');

            if (editingId) {
                const response = await api.put(`/courses/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setStatus({ type: 'success', message: t('admin.coursemanagement.successUpdate') });
                    setEditingId(null);
                    setShowFormModal(false);
                }
            } else {
                const data = new FormData();
                data.append('title', formData.title);
                data.append('description', formData.description);
                data.append('grade', formData.grade);
                if (creationFile) {
                    data.append('file', creationFile);
                }

                const response = await api.post('/courses', data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.success) {
                    setStatus({ type: 'success', message: t('admin.coursemanagement.successAdd') });
                    setCreationFile(null);
                    setShowFormModal(false);
                }
            }
            setFormData({ title: '', description: '', grade: '' });
            fetchCourses();
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setFormData({ 
            title: course.title, 
            description: course.description || '', 
            grade: course.grade || '' 
        });
        setEditingId(course._id || course.id);
        setShowFormModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.coursemanagement.confirmDelete'))) return;

        try {
            const token = sessionStorage.getItem('adminToken');
            await api.delete(`/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: t('admin.coursemanagement.successDelete') });
            fetchCourses();
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to delete course' });
        }
    };

    const handleManageMaterials = (course) => {
        setSelectedCourse(course);
        setShowMaterialsModal(true);
        setStatus({ type: '', message: '' });
    };

    const handleMaterialUpload = async (e) => {
        e.preventDefault();
        if (!materialFile || !selectedCourse) return;

        setUploadingMaterial(true);
        const formData = new FormData();
        formData.append('file', materialFile);
        formData.append('name', materialName || materialFile.name);

        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await api.post(`/courses/${selectedCourse._id || selectedCourse.id}/materials`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const updatedCourse = { ...selectedCourse };
                updatedCourse.materials = [...(updatedCourse.materials || []), response.data.data];
                setSelectedCourse(updatedCourse);
                setCourses(courses.map(c => (c._id || c.id) === (selectedCourse._id || selectedCourse.id) ? updatedCourse : c));
                setMaterialFile(null);
                setMaterialName('');
                document.getElementById('materialFileInput').value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.response?.data?.error || 'Failed to upload material');
        } finally {
            setUploadingMaterial(false);
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const token = sessionStorage.getItem('adminToken');
            const response = await api.delete(`/courses/${selectedCourse._id || selectedCourse.id}/materials/${materialId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const updatedCourse = { ...selectedCourse };
                updatedCourse.materials = updatedCourse.materials.filter(m => (m._id || m.id) !== materialId);
                setSelectedCourse(updatedCourse);
                setCourses(courses.map(c => (c._id || c.id) === (selectedCourse._id || selectedCourse.id) ? updatedCourse : c));
            }
        } catch (error) {
            console.error('Delete material error:', error);
            alert('Failed to delete material');
        }
    };

    return (
        <div className="course-management-page">
            <div className="course-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>{t('admin.coursemanagement.title')}</h1>
                    <p className="subtitle">{t('admin.coursemanagement.subtitle')}</p>
                </div>
                <button 
                    className="btn-primary" 
                    onClick={() => { 
                        setEditingId(null); 
                        setFormData({ title: '', description: '', grade: '' }); 
                        setShowFormModal(true); 
                    }}
                >
                    <FaPlus /> Add Course
                </button>
            </div>

            {status.message && (
                <div className={`alert-modern alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            {/* List Section */}
            <div className="premium-table-wrapper">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>{t('admin.coursemanagement.titleLabel')}</th>
                            <th>Target Grade</th>
                            <th>{t('admin.coursemanagement.descLabel')}</th>
                            <th style={{ width: '150px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCourses.length > 0 ? (
                            currentCourses.map((course) => (
                                <tr key={course._id || course.id}>
                                    <td className="course-title-cell">{course.title}</td>
                                    <td><span className="badge">{course.grade || 'General'}</span></td>
                                    <td className="course-desc-cell">{course.description || 'No description provided.'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn edit" onClick={() => handleEdit(course)} title={t('admin.coursemanagement.editCourse')}>
                                                <FaEdit />
                                            </button>
                                            <button className="action-btn material" onClick={() => handleManageMaterials(course)} title="Manage Materials">
                                                <FaBook />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(course._id || course.id)} title={t('admin.coursemanagement.deleteCourse')}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    {t('admin.coursemanagement.noCourses')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && totalPages > 1 && (
                <div className="pagination-container" style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1rem', borderRadius: '16px', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                    <button 
                        className="btn-cancel" 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Previous
                    </button>
                    <span style={{ color: '#e2e8f0' }}>
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <button 
                        className="btn-cancel" 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Next
                    </button>
                </div>
            )}

            {loading && <p style={{ textAlign: 'center', marginTop: '1rem', color: '#ffd700' }}>{t('admin.results.loading')}</p>}

            {/* Form Modal */}
            {showFormModal && (
                <div className="premium-modal-overlay" onClick={() => setShowFormModal(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="premium-modal-header">
                            <h2>
                                {editingId ? <FaEdit style={{ marginRight: '0.8rem' }} /> : <FaPlus style={{ marginRight: '0.8rem' }} />}
                                {editingId ? t('admin.coursemanagement.editCourse') : t('admin.coursemanagement.addCourse')}
                            </h2>
                            <button className="close-icon-btn" onClick={() => setShowFormModal(false)}><FaTimes /></button>
                        </div>
                        <div className="premium-modal-body">
                            <form onSubmit={handleSubmit} className="course-form">
                                <div className="form-group">
                                    <label>{t('admin.coursemanagement.titleLabel')}</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="e.g. Advanced Theology"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>{t('admin.coursemanagement.descLabel')}</label>
                                    <textarea
                                        className="premium-textarea"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Briefly describe the course contents..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Target Grade</label>
                                    <select
                                        className="premium-select"
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {[...Array(12)].map((_, i) => (
                                            <option key={`grade-${i + 1}`} value={`Grade ${i + 1}`}>
                                                Grade {i + 1}
                                            </option>
                                        ))}
                                        <option value="Adult">Adult / Other</option>
                                    </select>
                                </div>

                                {!editingId && (
                                    <div className="form-group">
                                        <label>Initial Course Material (Optional)</label>
                                        <div className="file-upload-wrapper">
                                            <input
                                                id="creationFileInput"
                                                type="file"
                                                onChange={(e) => setCreationFile(e.target.files[0])}
                                            />
                                            <div className="file-upload-display">
                                                <FaCloudUploadAlt size={24} />
                                                <span>{creationFile ? creationFile.name : 'Upload PDF, PPT, Word...'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="btn-group" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setShowFormModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {editingId ? <FaSave /> : <FaPlus />} 
                                        {t('admin.coursemanagement.saveCourse')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Materials Modal */}
            {showMaterialsModal && selectedCourse && (
                <div className="premium-modal-overlay" onClick={() => setShowMaterialsModal(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="premium-modal-header">
                            <h2>{selectedCourse.title} - Materials</h2>
                            <button className="close-icon-btn" onClick={() => setShowMaterialsModal(false)}><FaTimes /></button>
                        </div>
                        <div className="premium-modal-body">
                            
                            {/* Upload Section */}
                            <div className="upload-card">
                                <h3>Upload New Material</h3>
                                <form onSubmit={handleMaterialUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            className="premium-input"
                                            placeholder="Display Name (optional)"
                                            value={materialName}
                                            onChange={(e) => setMaterialName(e.target.value)}
                                        />
                                        <div className="file-upload-wrapper">
                                            <input
                                                id="materialFileInput"
                                                type="file"
                                                onChange={(e) => setMaterialFile(e.target.files[0])}
                                                required
                                            />
                                            <div className="file-upload-display" style={{ padding: '0.8rem 1rem' }}>
                                                <FaCloudUploadAlt size={20} />
                                                <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {materialFile ? materialFile.name : 'Choose File'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-upload"
                                        disabled={uploadingMaterial || !materialFile}
                                        style={{ alignSelf: 'flex-start' }}
                                    >
                                        {uploadingMaterial ? 'Uploading...' : <><FaCloudUploadAlt /> Upload Material</>}
                                    </button>
                                </form>
                            </div>

                            {/* List Section */}
                            <div className="material-list">
                                <h3>Current Materials</h3>
                                <div className="premium-table-wrapper" style={{ boxShadow: 'none', background: 'rgba(15, 23, 42, 0.4)' }}>
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th style={{ width: '100px' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                                                selectedCourse.materials.map((m) => (
                                                    <tr key={m._id || m.id}>
                                                        <td style={{ fontWeight: 500, color: '#f8fafc' }}>{m.name}</td>
                                                        <td><span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.2)' }}>{m.fileType?.toUpperCase()}</span></td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <a
                                                                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${m.url}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="action-btn material"
                                                                    title="Download"
                                                                >
                                                                    <FaDownload />
                                                                </a>
                                                                <button
                                                                    className="action-btn delete"
                                                                    onClick={() => handleDeleteMaterial(m._id || m.id)}
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                        No materials uploaded yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
