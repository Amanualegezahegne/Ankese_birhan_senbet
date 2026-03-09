import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaEdit, FaPlus, FaBook, FaDownload, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import '../Styles/UserManagement.css'; // Reusing table and card styles

const CourseManagement = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [materialFile, setMaterialFile] = useState(null);
    const [materialName, setMaterialName] = useState('');
    const [uploadingMaterial, setUploadingMaterial] = useState(false);
    const [creationFile, setCreationFile] = useState(null);

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
                }
            } else {
                const data = new FormData();
                data.append('title', formData.title);
                data.append('description', formData.description);
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
                    // Reset file input if possible
                    const fileInput = document.getElementById('creationFileInput');
                    if (fileInput) fileInput.value = '';
                }
            }
            setFormData({ title: '', description: '' });
            fetchCourses();
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setFormData({ title: course.title, description: course.description || '' });
        setEditingId(course._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            const response = await api.post(`/courses/${selectedCourse._id}/materials`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Update selected course materials locally
                const updatedCourse = { ...selectedCourse };
                updatedCourse.materials = [...(updatedCourse.materials || []), response.data.data];
                setSelectedCourse(updatedCourse);

                // Update main courses list
                setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));

                setMaterialFile(null);
                setMaterialName('');
                // Reset file input
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
            const response = await api.delete(`/courses/${selectedCourse._id}/materials/${materialId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const updatedCourse = { ...selectedCourse };
                updatedCourse.materials = updatedCourse.materials.filter(m => m._id !== materialId);
                setSelectedCourse(updatedCourse);
                setCourses(courses.map(c => c._id === selectedCourse._id ? updatedCourse : c));
            }
        } catch (error) {
            console.error('Delete material error:', error);
            alert('Failed to delete material');
        }
    };

    return (
        <div className="user-management-page">
            <div className="header-container">
                <h1>{t('admin.coursemanagement.title')}</h1>
                <p className="subtitle">{t('admin.coursemanagement.subtitle')}</p>
            </div>

            {status.message && (
                <div className={`alert alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            {/* Form Section */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>
                    {editingId ? t('admin.coursemanagement.editCourse') : t('admin.coursemanagement.addCourse')}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('admin.coursemanagement.titleLabel')}</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('admin.coursemanagement.descLabel')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '100px' }}
                        />
                    </div>
                    {!editingId && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Initial Course Material (PDF, PPT, Word - Optional)</label>
                            <input
                                id="creationFileInput"
                                type="file"
                                onChange={(e) => setCreationFile(e.target.files[0])}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="view-btn" disabled={loading} style={{ padding: '0.8rem 2rem' }}>
                            <FaPlus style={{ marginRight: '0.5rem' }} /> {t('admin.coursemanagement.saveCourse')}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="delete-item-btn"
                                onClick={() => { setEditingId(null); setFormData({ title: '', description: '' }); }}
                                style={{ padding: '0.8rem 2rem', border: '1px solid #ccc', color: '#666' }}
                            >
                                {t('admin.usermanagement.details.close')}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="table-wrapper">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>{t('admin.coursemanagement.titleLabel')}</th>
                            <th>{t('admin.coursemanagement.descLabel')}</th>
                            <th style={{ width: '120px' }}>{t('admin.usermanagement.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <tr key={course._id}>
                                    <td><strong>{course.title}</strong></td>
                                    <td>{course.description}</td>
                                    <td>
                                        <div className="action-row">
                                            <button className="view-btn" onClick={() => handleEdit(course)} title={t('admin.coursemanagement.editCourse')} style={{ padding: '0.5rem' }}>
                                                <FaEdit />
                                            </button>
                                            <button className="view-btn" onClick={() => handleManageMaterials(course)} title="Manage Materials" style={{ padding: '0.5rem', backgroundColor: '#4f46e5', color: 'white' }}>
                                                <FaBook />
                                            </button>
                                            <button className="delete-item-btn" onClick={() => handleDelete(course._id)} title={t('admin.coursemanagement.deleteCourse')} style={{ padding: '0.5rem' }}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                                    {t('admin.coursemanagement.noCourses')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {loading && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{t('admin.results.loading')}</p>}

            {/* Materials Modal */}
            {showMaterialsModal && selectedCourse && (
                <div className="modal-overlay" onClick={() => setShowMaterialsModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Materials: {selectedCourse.title}</h2>
                            <button className="close-btn" onClick={() => setShowMaterialsModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            {/* Upload Section */}
                            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: '#f9fafb' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Upload New Material</h3>
                                <form onSubmit={handleMaterialUpload} style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Display Name (optional)"
                                            value={materialName}
                                            onChange={(e) => setMaterialName(e.target.value)}
                                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                        />
                                        <input
                                            id="materialFileInput"
                                            type="file"
                                            onChange={(e) => setMaterialFile(e.target.files[0])}
                                            required
                                            style={{ padding: '0.4rem' }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="view-btn"
                                        disabled={uploadingMaterial || !materialFile}
                                        style={{ justifySelf: 'start', padding: '0.6rem 1.5rem', backgroundColor: '#10b981', color: 'white' }}
                                    >
                                        {uploadingMaterial ? 'Uploading...' : <><FaCloudUploadAlt style={{ marginRight: '0.5rem' }} /> Upload Material</>}
                                    </button>
                                </form>
                            </div>

                            {/* List Section */}
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Current Materials</h3>
                            <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid #eee' }}>
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th style={{ width: '120px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                                            selectedCourse.materials.map((m) => (
                                                <tr key={m._id}>
                                                    <td>{m.name}</td>
                                                    <td><span className="status-badge status-pending" style={{ fontSize: '0.7rem' }}>{m.fileType?.toUpperCase()}</span></td>
                                                    <td>
                                                        <div className="action-row">
                                                            <a
                                                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${m.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="view-btn"
                                                                style={{ padding: '0.4rem', display: 'flex' }}
                                                                title="Download"
                                                            >
                                                                <FaDownload />
                                                            </a>
                                                            <button
                                                                className="delete-item-btn"
                                                                onClick={() => handleDeleteMaterial(m._id)}
                                                                style={{ padding: '0.4rem' }}
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
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '1.5rem', color: '#666' }}>
                                                    No materials uploaded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={() => setShowMaterialsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
