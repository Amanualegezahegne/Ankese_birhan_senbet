import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import '../Styles/UserManagement.css';
import '../Styles/Alert.css';

const parseCourses = (courseStr, allCourses) => {
    if (!courseStr || !allCourses || allCourses.length === 0) return [];
    const found = [];
    const sortedCourses = [...allCourses].sort((a, b) => b.title.length - a.title.length);
    
    // Normalize spaces for robust matching
    let tempStr = courseStr.toLowerCase().replace(/\s+/g, '');
    for (const course of sortedCourses) {
        const titleNormalized = course.title.toLowerCase().replace(/\s+/g, '');
        if (tempStr.includes(titleNormalized)) {
            found.push(course.title);
            // Remove all occurrences of this course title
            tempStr = tempStr.split(titleNormalized).join('');
        }
    }
    return found;
};

const TeacherManagement = () => {
    const { t } = useTranslation();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterGrade, setFilterGrade] = useState('All');
    const [courses, setCourses] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [importing, setImporting] = useState(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
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
        role: 'teacher',
        status: 'Approved',
        course: ''
    });

    useEffect(() => {
        fetchTeachers();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const response = await api.get('/students?role=teacher', {
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

            const response = await api.post('/students/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
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

            const token = sessionStorage.getItem('adminToken');
            const response = await api.delete(`/students/${id}`, {
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

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditData({ ...selectedTeacher });
        }
        setIsEditing(!isEditing);
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const response = await api.put(`/students/${selectedTeacher._id}`, editData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: 'Teacher details updated successfully!' });
                setTeachers(teachers.map(s => s._id === selectedTeacher._id ? response.data.data : s));
                setSelectedTeacher(response.data.data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating teacher:', error);
            setStatus({ type: 'error', message: 'Failed to update teacher details.' });
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
                setStatus({ type: 'success', message: 'New teacher registered successfully!' });
                setTeachers([response.data.data, ...teachers]);
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
                    role: 'teacher',
                    status: 'Approved',
                    course: ''
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to register teacher.' });
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
        const matchesGrade = filterGrade === 'All' || teacher.grade === filterGrade;

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
                        <button 
                            className="view-btn" 
                            style={{ backgroundColor: '#28a745', color: '#fff', padding: '0.6rem 1.2rem', marginLeft: '10px' }}
                            onClick={() => setShowRegisterModal(true)}
                        >
                            Register New
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
                                <th>{t('admin.usermanagement.table.grade') || 'Grade'}</th>
                                <th>Teaching Course</th>
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
                                        <td>{teacher.grade || 'N/A'}</td>
                                        <td>{teacher.course || 'Not Assigned'}</td>
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
                <div className="modal-overlay" onClick={() => { setSelectedTeacher(null); setIsEditing(false); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Teacher' : t('admin.teachermanagement.details.title')}</h2>
                            <button className="close-btn" onClick={() => { setSelectedTeacher(null); setIsEditing(false); }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.name')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedTeacher.name}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.christianName')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.christianName || ''} onChange={(e) => setEditData({ ...editData, christianName: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedTeacher.christianName}</p>
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
                                        <p>{selectedTeacher.grade || 'N/A'}</p>
                                    )}
                                </div>
                                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Teaching Courses (Select all that apply)</label>
                                    {isEditing ? (
                                        <div style={{ 
                                            maxHeight: '130px', 
                                            overflowY: 'auto', 
                                            border: '1px solid #ccc', 
                                            borderRadius: '6px', 
                                            padding: '10px',
                                            backgroundColor: '#2b2b2b',
                                            color: '#fff',
                                            marginTop: '5px',
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                                        }}>
                                            {courses.length > 0 ? (
                                                (() => {
                                                    const selectedList = parseCourses(editData.course, courses);
                                                    return courses.map(course => {
                                                        const isChecked = selectedList.includes(course.title);
                                                        return (
                                                            <label key={course._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        let currentList = [...selectedList];
                                                                        if (e.target.checked) {
                                                                            if (!currentList.includes(course.title)) {
                                                                                currentList.push(course.title);
                                                                            }
                                                                        } else {
                                                                            currentList = currentList.filter(item => item !== course.title);
                                                                        }
                                                                        setEditData({ ...editData, course: currentList.join(', ') });
                                                                    }}
                                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                                />
                                                                <span>{course.title}</span>
                                                            </label>
                                                        );
                                                    });
                                                })()
                                            ) : (
                                                <p style={{ color: '#aaa', margin: 0 }}>No courses available.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ fontWeight: 'bold', color: '#ffd700' }}>{selectedTeacher.course || 'Not Assigned'}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.email')}</label>
                                    {isEditing ? (
                                        <input type="email" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedTeacher.email}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.phone')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedTeacher.phone}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.sex')}</label>
                                    {isEditing ? (
                                        <select value={editData.sex || ''} onChange={(e) => setEditData({ ...editData, sex: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    ) : (
                                        <p>{selectedTeacher.sex}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.nationalId')}</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.nationalId || ''} onChange={(e) => setEditData({ ...editData, nationalId: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{selectedTeacher.nationalId}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.dob')}</label>
                                    {isEditing ? (
                                        <input type="date" value={editData.dob ? new Date(editData.dob).toISOString().split('T')[0] : ''} onChange={(e) => setEditData({ ...editData, dob: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                    ) : (
                                        <p>{formatDate(selectedTeacher.dob)}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{t('admin.teachermanagement.details.serviceStatus')}</label>
                                    {isEditing ? (
                                        <select value={editData.hasServed || 'no'} onChange={(e) => setEditData({ ...editData, hasServed: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    ) : (
                                        <p>{selectedTeacher.hasServed === 'yes' ? 'Yes' : 'No'}</p>
                                    )}
                                </div>
                                {(isEditing ? editData.hasServed === 'yes' : selectedTeacher.hasServed === 'yes') && (
                                    <div className="detail-item full-width">
                                        <label>{t('admin.teachermanagement.details.previousChurch')}</label>
                                        {isEditing ? (
                                            <input type="text" value={editData.previousChurch || ''} onChange={(e) => setEditData({ ...editData, previousChurch: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                        ) : (
                                            <p>{selectedTeacher.previousChurch}</p>
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
                            <button className="btn-close" onClick={() => { setSelectedTeacher(null); setIsEditing(false); }}>
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

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Register New Teacher</h2>
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
                                    <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Teaching Courses (Select all that apply)</label>
                                        <div style={{ 
                                            maxHeight: '130px', 
                                            overflowY: 'auto', 
                                            border: '1px solid #ccc', 
                                            borderRadius: '6px', 
                                            padding: '10px',
                                            backgroundColor: '#2b2b2b',
                                            color: '#fff',
                                            marginTop: '5px',
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                                        }}>
                                            {courses.length > 0 ? (
                                                (() => {
                                                    const selectedList = parseCourses(registerData.course, courses);
                                                    return courses.map(course => {
                                                        const isChecked = selectedList.includes(course.title);
                                                        return (
                                                            <label key={course._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        let currentList = [...selectedList];
                                                                        if (e.target.checked) {
                                                                            if (!currentList.includes(course.title)) {
                                                                                currentList.push(course.title);
                                                                            }
                                                                        } else {
                                                                            currentList = currentList.filter(item => item !== course.title);
                                                                        }
                                                                        setRegisterData({ ...registerData, course: currentList.join(', ') });
                                                                    }}
                                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                                />
                                                                <span>{course.title}</span>
                                                            </label>
                                                        );
                                                    });
                                                })()
                                            ) : (
                                                <p style={{ color: '#aaa', margin: 0 }}>No courses available.</p>
                                            )}
                                        </div>
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
                                    {loading ? 'Registering...' : 'Register Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherManagement;
