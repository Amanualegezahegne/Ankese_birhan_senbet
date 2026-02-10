import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/UserManagement.css';
import '../Styles/Alert.css';

const TeacherManagement = () => {
    const { t } = useTranslation();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [importing, setImporting] = useState(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('http://localhost:5000/api/students?role=teacher', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setTeachers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setStatus({ type: 'error', message: 'Failed to fetch registered teachers.' });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setImporting(true);
            setStatus({ type: 'info', message: t('admin.teachermanagement.import.uploading') });

            const response = await axios.post('http://localhost:5000/api/students/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: t('admin.teachermanagement.import.success', { count: response.data.count })
                });
                fetchTeachers();
            }
        } catch (error) {
            console.error('Import error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('admin.teachermanagement.import.error')
            });
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDeleteAll = async () => {
        // Caution: This API might delete ALL students if not careful.
        // We need a specific API to delete only Teachers or modify the backend.
        // For now, let's assume the backend 'delete all' deletes everything, which is dangerous.
        // Modifying the backend to support delete by role would be better, but 'deleteAllStudents' 
        // in backend deletes ALL.
        // Let's SKIP Implementing Delete All for teachers for now to avoid accidental data loss of students, 
        // unless we update backend. The user asked for "Teacher Management", so let's check if Delete All is critical.
        // The existing code has it. I'll include it but maybe warn or just support single delete for safety 
        // unless I update the backend.
        // Actually, the backend 'deleteAllStudents' deletes `Student.deleteMany({})`. It deletes EVERYONE.
        // I should NOT use that for Teachers unless I update backend.
        // I will implement SINGLE delete only for now to be safe, or just hide "Delete All" button.
        // Hiding "Delete All" button for Teachers seems safer without backend changes.

        // Wait, I can't leave a broken feature. I will just OMIT the key 'deleteAll' in UI or disable it.
        // I will commented out the Delete All button in the UI for this page.
    };

    const handleDeleteTeacher = async () => {
        if (!teacherToDelete) return;

        try {
            const id = teacherToDelete._id;
            const name = teacherToDelete.name;
            setTeacherToDelete(null);
            setLoading(true);

            const token = localStorage.getItem('adminToken');
            const response = await axios.delete(`http://localhost:5000/api/students/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: t('admin.teachermanagement.delete.successSingle', { name }) });
                setTeachers(teachers.filter(s => s._id !== id));
            }
        } catch (error) {
            console.error('Delete teacher error:', error);
            setStatus({ type: 'error', message: t('admin.teachermanagement.delete.errorSingle') });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(`http://localhost:5000/api/students/${id}/status`, { status: newStatus }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setTeachers(teachers.map(s => s._id === id ? { ...s, status: newStatus } : s));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.christianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || teacher.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="user-management-page">
            <div className="page-header">
                <div>
                    <h1>{t('admin.teachermanagement.title') || 'Teacher Management'}</h1>
                    <p>{t('admin.teachermanagement.subtitle') || 'Manage Sunday School teachers'}</p>
                </div>
                <div className="header-actions">
                    <div className="import-container">
                        <input
                            type="file"
                            id="import-excel"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                            disabled={importing}
                        />
                        {/* Reusing existing translation for import button as it is generic enough "Import from External" or "Import" */}
                        <button
                            className="import-btn"
                            onClick={() => document.getElementById('import-excel').click()}
                            disabled={importing}
                        >
                            {importing ? t('admin.teachermanagement.import.uploading') : t('admin.teachermanagement.table.import')}
                        </button>
                    </div>
                    {/* Delete All Disabled for Safety */}
                    {/* <button
                        className="delete-all-btn"
                        onClick={() => setShowDeleteAllModal(true)}
                        disabled={teachers.length === 0 || loading}
                    >
                        {t('admin.teachermanagement.table.deleteAll')}
                    </button> */}
                    <div className="filter-group">
                        <select
                            className="status-filter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">{t('admin.teachermanagement.filter.all')}</option>
                            <option value="Pending">{t('admin.teachermanagement.filter.pending')}</option>
                            <option value="Approved">{t('admin.teachermanagement.filter.approved')}</option>
                            <option value="Rejected">{t('admin.teachermanagement.filter.rejected')}</option>
                        </select>
                    </div>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder={t('admin.teachermanagement.placeholder.search') || 'Search...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {status.message && (
                <div className={`alert alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            {loading ? (
                <div className="loading-state">Loading teachers...</div>
            ) : (
                <div className="table-wrapper">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>{t('admin.teachermanagement.table.name') || 'Name'}</th>
                                <th>{t('admin.teachermanagement.table.christianName') || 'Christian Name'}</th>
                                <th>{t('admin.teachermanagement.table.regDate') || 'Reg. Date'}</th>
                                <th>{t('admin.teachermanagement.table.status') || 'Status'}</th>
                                <th>{t('admin.teachermanagement.table.actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                    <tr key={teacher._id}>
                                        <td><strong>{teacher.name}</strong></td>
                                        <td>{teacher.christianName}</td>
                                        <td>{formatDate(teacher.createdAt)}</td>
                                        <td>
                                            <div className="status-cell-container">
                                                <span className={`status-badge status-${teacher.status.toLowerCase()}`}>
                                                    {teacher.status}
                                                </span>
                                                <select
                                                    value={teacher.status}
                                                    onChange={(e) => handleStatusUpdate(teacher._id, e.target.value)}
                                                    className="status-selector-mini"
                                                    title={t('admin.teachermanagement.table.status')}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-row">
                                                <button
                                                    className="view-btn"
                                                    onClick={() => setSelectedTeacher(teacher)}
                                                >
                                                    {t('admin.teachermanagement.table.view')}
                                                </button>
                                                <button
                                                    className="delete-item-btn"
                                                    onClick={() => setTeacherToDelete(teacher)}
                                                    title={t('admin.teachermanagement.table.delete')}
                                                >
                                                    <span className="trash-icon">🗑️</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">No teachers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Teacher Details Modal */}
            {selectedTeacher && (
                <div className="modal-overlay" onClick={() => setSelectedTeacher(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('admin.teachermanagement.details.title')}</h2>
                            <button className="close-btn" onClick={() => setSelectedTeacher(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.name')}</label>
                                    <p>{selectedTeacher.name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.christianName')}</label>
                                    <p>{selectedTeacher.christianName}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.email')}</label>
                                    <p>{selectedTeacher.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.phone')}</label>
                                    <p>{selectedTeacher.phone}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.sex')}</label>
                                    <p>{selectedTeacher.sex}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.nationalId')}</label>
                                    <p>{selectedTeacher.nationalId}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.dob')}</label>
                                    <p>{formatDate(selectedTeacher.dob)}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.regDate')}</label>
                                    <p>{formatDate(selectedTeacher.createdAt)}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.serviceStatus')}</label>
                                    <p>{selectedTeacher.hasServed === 'yes' ? 'Yes' : 'No'}</p>
                                </div>
                                {selectedTeacher.hasServed === 'yes' && (
                                    <div className="detail-item full-width">
                                        <label>{t('admin.teachermanagement.details.previousChurch')}</label>
                                        <p>{selectedTeacher.previousChurch}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={() => setSelectedTeacher(null)}>
                                {t('admin.teachermanagement.details.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Single Confirmation Modal */}
            {teacherToDelete && (
                <div className="modal-overlay" onClick={() => setTeacherToDelete(null)}>
                    <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header danger">
                            <h2>{t('admin.teachermanagement.delete.single')}</h2>
                            <button className="close-btn" onClick={() => setTeacherToDelete(null)}>&times;</button>
                        </div>
                        <div className="modal-body centered">
                            <div className="warning-icon">⚠️</div>
                            <p className="confirmation-text">
                                {t('admin.teachermanagement.delete.confirmSingle', { name: teacherToDelete.name })}
                            </p>
                        </div>
                        <div className="modal-footer centered">
                            <button className="btn-cancel" onClick={() => setTeacherToDelete(null)}>
                                {t('admin.teachermanagement.details.close')}
                            </button>
                            <button className="btn-confirm-delete" onClick={handleDeleteTeacher}>
                                {t('admin.teachermanagement.table.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherManagement;
