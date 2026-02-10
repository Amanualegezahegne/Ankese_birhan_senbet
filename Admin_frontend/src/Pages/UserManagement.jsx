import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/UserManagement.css';
import '../Styles/Alert.css';

const UserManagement = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [importing, setImporting] = useState(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('http://localhost:5000/api/students?role=student', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setStatus({ type: 'error', message: 'Failed to fetch registered students.' });
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
            setStatus({ type: 'info', message: t('admin.usermanagement.import.uploading') });

            const response = await axios.post('http://localhost:5000/api/students/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: t('admin.usermanagement.import.success', { count: response.data.count })
                });
                fetchStudents();
            }
        } catch (error) {
            console.error('Import error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('admin.usermanagement.import.error')
            });
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDeleteAll = async () => {
        try {
            setShowDeleteAllModal(false);
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.delete('http://localhost:5000/api/students/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: t('admin.usermanagement.delete.success') });
                setStudents([]);
            }
        } catch (error) {
            console.error('Delete all error:', error);
            setStatus({ type: 'error', message: t('admin.usermanagement.delete.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;

        try {
            const id = studentToDelete._id;
            const name = studentToDelete.name;
            setStudentToDelete(null);
            setLoading(true);

            const token = localStorage.getItem('adminToken');
            const response = await axios.delete(`http://localhost:5000/api/students/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: t('admin.usermanagement.delete.successSingle', { name }) });
                setStudents(students.filter(s => s._id !== id));
            }
        } catch (error) {
            console.error('Delete student error:', error);
            setStatus({ type: 'error', message: t('admin.usermanagement.delete.errorSingle') });
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
                setStudents(students.map(s => s._id === id ? { ...s, status: newStatus } : s));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.christianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || student.status === filterStatus;

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
                    <h1>{t('admin.usermanagement.title') || 'Student Management'}</h1>
                    <p>{t('admin.usermanagement.subtitle') || 'Manage Sunday School registrations'}</p>
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
                        <button
                            className="import-btn"
                            onClick={() => document.getElementById('import-excel').click()}
                            disabled={importing}
                        >
                            {importing ? t('admin.usermanagement.import.uploading') : t('admin.usermanagement.table.import')}
                        </button>
                    </div>
                    <button
                        className="delete-all-btn"
                        onClick={() => setShowDeleteAllModal(true)}
                        disabled={students.length === 0 || loading}
                    >
                        {t('admin.usermanagement.table.deleteAll')}
                    </button>
                    <div className="filter-group">
                        <select
                            className="status-filter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">{t('admin.usermanagement.filter.all')}</option>
                            <option value="Pending">{t('admin.usermanagement.filter.pending')}</option>
                            <option value="Approved">{t('admin.usermanagement.filter.approved')}</option>
                            <option value="Rejected">{t('admin.usermanagement.filter.rejected')}</option>
                        </select>
                    </div>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder={t('admin.usermanagement.placeholder.search') || 'Search by name or email...'}
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
                <div className="loading-state">Loading students...</div>
            ) : (
                <div className="table-wrapper">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>{t('admin.usermanagement.table.name') || 'Name'}</th>
                                <th>{t('admin.usermanagement.table.christianName') || 'Christian Name'}</th>
                                <th>{t('admin.usermanagement.table.regDate') || 'Reg. Date'}</th>
                                <th>{t('admin.usermanagement.table.status') || 'Status'}</th>
                                <th>{t('admin.usermanagement.table.actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td><strong>{student.name}</strong></td>
                                        <td>{student.christianName}</td>
                                        <td>{formatDate(student.createdAt)}</td>
                                        <td>
                                            <div className="status-cell-container">
                                                <span className={`status-badge status-${student.status.toLowerCase()}`}>
                                                    {student.status}
                                                </span>
                                                <select
                                                    value={student.status}
                                                    onChange={(e) => handleStatusUpdate(student._id, e.target.value)}
                                                    className="status-selector-mini"
                                                    title={t('admin.usermanagement.table.status')}
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
                                                    onClick={() => setSelectedStudent(student)}
                                                >
                                                    {t('admin.usermanagement.table.view')}
                                                </button>
                                                <button
                                                    className="delete-item-btn"
                                                    onClick={() => setStudentToDelete(student)}
                                                    title={t('admin.usermanagement.table.delete')}
                                                >
                                                    <span className="trash-icon">🗑️</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">No students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* User Details Modal */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('admin.usermanagement.details.title')}</h2>
                            <button className="close-btn" onClick={() => setSelectedStudent(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.name')}</label>
                                    <p>{selectedStudent.name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.christianName')}</label>
                                    <p>{selectedStudent.christianName}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.email')}</label>
                                    <p>{selectedStudent.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.phone')}</label>
                                    <p>{selectedStudent.phone}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.sex')}</label>
                                    <p>{selectedStudent.sex}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.nationalId')}</label>
                                    <p>{selectedStudent.nationalId}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.dob')}</label>
                                    <p>{formatDate(selectedStudent.dob)}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.regDate')}</label>
                                    <p>{formatDate(selectedStudent.createdAt)}</p>
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.serviceStatus')}</label>
                                    <p>{selectedStudent.hasServed === 'yes' ? 'Yes' : 'No'}</p>
                                </div>
                                {selectedStudent.hasServed === 'yes' && (
                                    <div className="detail-item full-width">
                                        <label>{t('admin.usermanagement.details.previousChurch')}</label>
                                        <p>{selectedStudent.previousChurch}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={() => setSelectedStudent(null)}>
                                {t('admin.usermanagement.details.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete All Confirmation Modal */}
            {showDeleteAllModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteAllModal(false)}>
                    <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header danger">
                            <h2>{t('admin.usermanagement.delete.all')}</h2>
                            <button className="close-btn" onClick={() => setShowDeleteAllModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body centered">
                            <div className="warning-icon">⚠️</div>
                            <p className="confirmation-text">{t('admin.usermanagement.delete.confirm')}</p>
                        </div>
                        <div className="modal-footer centered">
                            <button className="btn-cancel" onClick={() => setShowDeleteAllModal(false)}>
                                {t('admin.usermanagement.details.close')}
                            </button>
                            <button className="btn-confirm-delete" onClick={handleDeleteAll}>
                                {t('admin.usermanagement.table.deleteAll')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Single Confirmation Modal */}
            {studentToDelete && (
                <div className="modal-overlay" onClick={() => setStudentToDelete(null)}>
                    <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header danger">
                            <h2>{t('admin.usermanagement.delete.single')}</h2>
                            <button className="close-btn" onClick={() => setStudentToDelete(null)}>&times;</button>
                        </div>
                        <div className="modal-body centered">
                            <div className="warning-icon">⚠️</div>
                            <p className="confirmation-text">
                                {t('admin.usermanagement.delete.confirmSingle', { name: studentToDelete.name })}
                            </p>
                        </div>
                        <div className="modal-footer centered">
                            <button className="btn-cancel" onClick={() => setStudentToDelete(null)}>
                                {t('admin.usermanagement.details.close')}
                            </button>
                            <button className="btn-confirm-delete" onClick={handleDeleteStudent}>
                                {t('admin.usermanagement.table.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
