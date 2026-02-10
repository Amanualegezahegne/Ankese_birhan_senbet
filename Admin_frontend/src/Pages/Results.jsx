import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../Styles/GradeReport.css'; // Reuse styles
import '../Styles/Alert.css';

const Results = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [gradesMap, setGradesMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [filters, setFilters] = useState({
        course: '',
        semester: '1st',
        year: new Date().getFullYear().toString()
    });

    const [dirtyRows, setDirtyRows] = useState(new Set());

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('http://localhost:5000/api/students?role=student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const sortedStudents = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
                setStudents(sortedStudents);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setStatus({ type: 'error', message: t('admin.results.errorFetchStudents') });
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courses');
            if (response.data.success) {
                setCourses(response.data.data);
                if (response.data.data.length > 0) {
                    setFilters(prev => ({ ...prev, course: response.data.data[0].title }));
                }
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const loadGrades = async () => {
        if (!filters.course || !filters.semester || !filters.year) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const query = new URLSearchParams(filters).toString();
            const response = await axios.get(`http://localhost:5000/api/grades?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const newMap = {};
                response.data.data.forEach(grade => {
                    const studentId = typeof grade.student === 'object' ? grade.student._id || grade.student.id : grade.student;
                    newMap[studentId] = grade;
                });
                setGradesMap(newMap);
                setDirtyRows(new Set());
                setStatus({ type: 'success', message: 'Grades loaded successfully' });
            }
        } catch (error) {
            console.error('Error loading grades:', error);
            setStatus({ type: 'error', message: t('admin.results.errorFetchGrades') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.course && filters.semester && filters.year) {
                loadGrades();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleGradeChange = (studentId, field, value) => {
        setGradesMap(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
                student: studentId
            }
        }));
        setDirtyRows(prev => new Set(prev).add(studentId));
    };

    const handleSaveAll = async () => {
        if (dirtyRows.size === 0) return;
        if (!window.confirm(`Save changes for ${dirtyRows.size} students?`)) return;

        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const token = localStorage.getItem('adminToken');
            const promises = Array.from(dirtyRows).map(async (studentId) => {
                const gradeData = gradesMap[studentId];
                if (!gradeData || (!gradeData.score && gradeData.score !== 0)) return null;

                const payload = {
                    studentId,
                    score: gradeData.score,
                    comment: gradeData.comment,
                    ...filters
                };

                if (gradeData._id) {
                    return axios.put(`http://localhost:5000/api/grades/${gradeData._id}`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    return axios.post('http://localhost:5000/api/grades', payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            });

            await Promise.all(promises);
            setStatus({ type: 'success', message: t('admin.results.successSave') || 'All grades saved!' });
            setDirtyRows(new Set());
            loadGrades();
        } catch (error) {
            console.error('Error saving grades:', error);
            setStatus({ type: 'error', message: t('admin.results.errorSave') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-management-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1>{t('admin.results.title')}</h1>
                    <p className="subtitle">{t('admin.results.subtitle')}</p>
                </div>
                {dirtyRows.size > 0 && (
                    <button onClick={handleSaveAll} className="save-all-btn">
                        {t('admin.results.saveAll') || 'Save All'} ({dirtyRows.size})
                    </button>
                )}
            </div>

            {status.message && <div className={`alert alert-${status.type}`}>{status.message}</div>}

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('admin.results.course')}</label>
                    <select
                        value={filters.course}
                        onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                            <option key={course._id} value={course.title}>{course.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('admin.results.semester')}</label>
                    <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                        <option value="1st">{t('admin.results.semester1')}</option>
                        <option value="2nd">{t('admin.results.semester2')}</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('admin.results.year')}</label>
                    <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                        {Array.from({ length: 11 }, (_, i) => (new Date().getFullYear()) - 5 + i).map(year => (
                            <option key={year} value={year.toString()}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>{t('admin.results.studentName') || 'Student Name'}</th>
                            <th style={{ width: '150px' }}>{t('admin.results.score')}</th>
                            <th>{t('admin.results.comment')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => {
                            const grade = gradesMap[student._id] || {};
                            const isDirty = dirtyRows.has(student._id);
                            return (
                                <tr key={student._id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{student.name}</strong></td>
                                    <td>
                                        <input
                                            type="number"
                                            value={grade.score || ''}
                                            onChange={(e) => handleGradeChange(student._id, 'score', e.target.value)}
                                            style={{ width: '100%', padding: '0.4rem', border: isDirty ? '1px solid #007bff' : '1px solid #ccc' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={grade.comment || ''}
                                            onChange={(e) => handleGradeChange(student._id, 'comment', e.target.value)}
                                            style={{ width: '100%', padding: '0.4rem', border: isDirty ? '1px solid #007bff' : '1px solid #ccc' }}
                                            placeholder="Comment"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {loading && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{t('admin.results.loading')}</p>}
        </div>
    );
};

export default Results;
