import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import '../Styles/UserManagement.css'; // Reusing table and card styles

const CourseManagement = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/courses');
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
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (editingId) {
                const response = await axios.put(`http://localhost:5000/api/courses/${editingId}`, formData, config);
                if (response.data.success) {
                    setStatus({ type: 'success', message: t('admin.coursemanagement.successUpdate') });
                    setEditingId(null);
                }
            } else {
                const response = await axios.post('http://localhost:5000/api/courses', formData, config);
                if (response.data.success) {
                    setStatus({ type: 'success', message: t('admin.coursemanagement.successAdd') });
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
            await axios.delete(`http://localhost:5000/api/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: t('admin.coursemanagement.successDelete') });
            fetchCourses();
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to delete course' });
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
                                            <button className="view-btn" onClick={() => handleEdit(course)} style={{ padding: '0.5rem' }}>
                                                <FaEdit />
                                            </button>
                                            <button className="delete-item-btn" onClick={() => handleDelete(course._id)} style={{ padding: '0.5rem' }}>
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
        </div>
    );
};

export default CourseManagement;
