import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import '../Styles/UserManagement.css';
import '../Styles/Alert.css';

const UserManagement = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterGrade, setFilterGrade] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [importing, setImporting] = useState(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerData, setRegisterData] = useState({
        name: '',
        christianName: '',
        email: '',
        password: '',
        phone: '',
        sex: 'male',
        nationalId: '',
        dob: '',
        grade: '',
        hasServed: 'no',
        previousChurch: '',
        role: 'student',
        status: 'Approved'
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const response = await api.get('/students?role=student', {
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

            const response = await api.post('/students/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
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
            const token = sessionStorage.getItem('adminToken');
            const response = await api.delete('/students/all', {
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

            const token = sessionStorage.getItem('adminToken');
            const response = await api.delete(`/students/${id}`, {
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
            const token = sessionStorage.getItem('adminToken');
            const response = await api.put(`/students/${id}/status`, { status: newStatus }, {
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

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditData({ ...selectedStudent });
        }
        setIsEditing(!isEditing);
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const response = await api.put(`/students/${selectedStudent._id}`, editData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: 'Student details updated successfully!' });
                setStudents(students.map(s => s._id === selectedStudent._id ? response.data.data : s));
                setSelectedStudent(response.data.data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating student:', error);
            setStatus({ type: 'error', message: 'Failed to update student details.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const response = await api.post('/students/register', registerData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: 'New student registered successfully!' });
                setStudents([response.data.data, ...students]);
                setShowRegisterModal(false);
                setRegisterData({
                    name: '',
                    christianName: '',
                    email: '',
                    password: '',
                    phone: '',
                    sex: 'male',
                    nationalId: '',
                    dob: '',
                    grade: '',
                    hasServed: 'no',
                    previousChurch: '',
                    role: 'student',
                    status: 'Approved'
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to register student.' });
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.christianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
        const matchesGrade = filterGrade === 'All' || student.grade === filterGrade;

        return matchesSearch && matchesStatus && matchesGrade;
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
                    <button 
                        className="view-btn" 
                        style={{ backgroundColor: '#28a745', color: '#fff', padding: '0.6rem 1.2rem' }}
                        onClick={() => setShowRegisterModal(true)}
                    >
                        Register New
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
                        <select
                            className="status-filter"
                            value={filterGrade}
                            onChange={(e) => setFilterGrade(e.target.value)}
                        >
                            <option value="All">{t('admin.usermanagement.filter.allGrades') || 'All Grades'}</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={`filter-grade-${i + 1}`} value={`Grade ${i + 1}`}>
                                    Grade {i + 1}
                                </option>
                            ))}
                            <option value="Adult">Adult / Other</option>
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
                    <table className="management-table user-table">
                        <thead>
                            <tr>
                                <th>{t('admin.usermanagement.table.name') || 'Name'}</th>
                                <th>{t('admin.usermanagement.table.christianName') || 'Christian Name'}</th>
                                <th>{t('admin.usermanagement.table.grade') || 'Grade'}</th>
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
                                        <td>{student.grade || 'N/A'}</td>
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
                            <h2>{isEditing ? 'Edit Student' : t('admin.usermanagement.details.title')}</h2>
                            <button className="close-btn" onClick={() => { setSelectedStudent(null); setIsEditing(false); }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.name')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedStudent.name}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.christianName')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.christianName || ''} onChange={(e) => setEditData({ ...editData, christianName: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedStudent.christianName}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.grade') || 'Grade'}</label>
                                    {isEditing ? (
                                        <select
                                            value={editData.grade || ''}
                                            onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem' }}
                                        >
                                            <option value="">Select Grade</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={`edit-grade-${i + 1}`} value={`Grade ${i + 1}`}>
                                                    Grade {i + 1}
                                                </option>
                                            ))}
                                            <option value="Adult">Adult / Other</option>
                                        </select>
                                    ) : (
                                        <p>{selectedStudent.grade || 'N/A'}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.email')}</label>
                                    {isEditing ? (
                                        <input type="email" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedStudent.email}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.phone')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedStudent.phone}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.sex')}</label>
                                    {isEditing ? (
                                        <select value={editData.sex || ''} onChange={(e) => setEditData({ ...editData, sex: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    ) : (
                                        <p>{selectedStudent.sex}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.nationalId')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.nationalId || ''} onChange={(e) => setEditData({ ...editData, nationalId: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedStudent.nationalId}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.dob')}</label>
                                    {isEditing ? (
                                        <input type="date" value={editData.dob ? new Date(editData.dob).toISOString().split('T')[0] : ''} onChange={(e) => setEditData({ ...editData, dob: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{formatDate(selectedStudent.dob)}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.usermanagement.details.serviceStatus')}</label>
                                    {isEditing ? (
                                        <select value={editData.hasServed || 'no'} onChange={(e) => setEditData({ ...editData, hasServed: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    ) : (
                                        <p>{selectedStudent.hasServed === 'yes' ? 'Yes' : 'No'}</p>
                                    )}
                                </div>
                                {(isEditing ? editData.hasServed === 'yes' : selectedStudent.hasServed === 'yes') && (
                                    <div className="detail-item full-width">
                                        <label>{t('admin.usermanagement.details.previousChurch')}</label>
                                        {isEditing ? (
                                            <input type="text" value={editData.previousChurch || ''} onChange={(e) => setEditData({ ...editData, previousChurch: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                        ) : (
                                            <p>{selectedStudent.previousChurch}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                {isEditing ? (
                                    <>
                                        <button className="view-btn" onClick={handleSaveEdit} style={{ backgroundColor: '#28a745', marginRight: '10px' }}>Save Changes</button>
                                        <button className="btn-close" onClick={() => setIsEditing(false)}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="view-btn" onClick={handleEditToggle} style={{ backgroundColor: '#ffc107', color: '#000' }}>Edit Details</button>
                                )}
                            </div>
                            <button className="btn-close" onClick={() => { setSelectedStudent(null); setIsEditing(false); }}>
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

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Register New Student</h2>
                            <button className="close-btn" onClick={() => setShowRegisterModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="modal-body">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Full Name *</label>
                                        <input required type="text" value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Christian Name</label>
                                        <input type="text" value={registerData.christianName} onChange={(e) => setRegisterData({ ...registerData, christianName: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Email *</label>
                                        <input required type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Password *</label>
                                        <input required type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone</label>
                                        <input type="text" value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Sex</label>
                                        <select value={registerData.sex} onChange={(e) => setRegisterData({ ...registerData, sex: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <div className="detail-item">
                                        <label>National ID</label>
                                        <input type="text" value={registerData.nationalId} onChange={(e) => setRegisterData({ ...registerData, nationalId: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Date of Birth</label>
                                        <input type="date" value={registerData.dob} onChange={(e) => setRegisterData({ ...registerData, dob: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Grade</label>
                                        <select
                                            value={registerData.grade}
                                            onChange={(e) => setRegisterData({ ...registerData, grade: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem' }}
                                        >
                                            <option value="">Select Grade</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={`reg-grade-${i + 1}`} value={`Grade ${i + 1}`}>
                                                    Grade {i + 1}
                                                </option>
                                            ))}
                                            <option value="Adult">Adult / Other</option>
                                        </select>
                                    </div>
                                    <div className="detail-item">
                                        <label>Service Status</label>
                                        <select value={registerData.hasServed} onChange={(e) => setRegisterData({ ...registerData, hasServed: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    {registerData.hasServed === 'yes' && (
                                        <div className="detail-item full-width">
                                            <label>Previous Church</label>
                                            <input type="text" value={registerData.previousChurch} onChange={(e) => setRegisterData({ ...registerData, previousChurch: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                                <button type="submit" className="view-btn" style={{ backgroundColor: '#28a745' }} disabled={loading}>
                                    {loading ? 'Registering...' : 'Register Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
