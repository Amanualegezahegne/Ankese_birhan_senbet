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

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/students');
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

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/students/${id}/status`, { status: newStatus });
            if (response.data.success) {
                setStudents(students.map(s => s._id === id ? { ...s, status: newStatus } : s));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.christianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="user-management-page">
            <div className="page-header">
                <div>
                    <h1>{t('admin.usermanagement.title') || 'User Management'}</h1>
                    <p>{t('admin.usermanagement.subtitle') || 'Manage Sunday School registrations'}</p>
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
                                <th>{t('admin.usermanagement.table.contact') || 'Contact'}</th>
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
                                        <td>
                                            <div className="contact-info">
                                                <span>{student.email}</span>
                                                <small>{student.phone}</small>
                                            </div>
                                        </td>
                                        <td>{formatDate(student.createdAt)}</td>
                                        <td>
                                            <span className={`status-badge status-${student.status.toLowerCase()}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <select
                                                value={student.status}
                                                onChange={(e) => handleStatusUpdate(student._id, e.target.value)}
                                                className="status-selector"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
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
        </div>
    );
};

export default UserManagement;
