import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../Styles/GradeReport.css';
import '../Styles/Alert.css';

const GradeReport = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [gradesMap, setGradesMap] = useState({}); // Map studentId -> grade object
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Filters
    const [filters, setFilters] = useState({
        course: '',
        semester: '1st',
        year: new Date().getFullYear().toString()
    });

    const [dirtyRows, setDirtyRows] = useState(new Set()); // Track modified rows

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    // Fetch students (Role: Student)
    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('studentToken');
            const response = await axios.get('http://localhost:5000/api/students?role=student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                // Sort alphabetically
                const sortedStudents = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
                setStudents(sortedStudents);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setStatus({ type: 'error', message: t('gradeReport.errorFetchStudents') });
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

    // Load grades based on filters
    const loadGrades = async () => {
        if (!filters.course || !filters.semester || !filters.year) {
            setStatus({ type: 'warning', message: t('gradeReport.selectPrompt') });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('studentToken');
            const query = new URLSearchParams(filters).toString();
            const response = await axios.get(`http://localhost:5000/api/grades?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Convert array to map: studentId -> grade
                const newMap = {};
                response.data.data.forEach(grade => {
                    // Handle both populated object and direct ID
                    const studentId = typeof grade.student === 'object' ? grade.student._id || grade.student.id : grade.student;
                    newMap[studentId] = grade;
                });
                setGradesMap(newMap);
                setDirtyRows(new Set()); // Clear dirty state
                setStatus({ type: 'success', message: t('gradeReport.loadSuccess') });
            }
        } catch (error) {
            console.error('Error loading grades:', error);
            setStatus({ type: 'error', message: t('gradeReport.errorFetchGrades') });
        } finally {
            setLoading(false);
        }
    };

    // Handle input change in the grid
    const handleGradeChange = (studentId, field, value) => {
        setGradesMap(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
                student: studentId // Ensure relationship is key
            }
        }));

        setDirtyRows(prev => new Set(prev).add(studentId));
    };

    // Save all modified rows
    const handleSaveAll = async () => {
        if (dirtyRows.size === 0) return;

        if (!window.confirm(t('gradeReport.confirmSaveAll', { count: dirtyRows.size }))) {
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('studentToken');
            const promises = Array.from(dirtyRows).map(async (studentId) => {
                const gradeData = gradesMap[studentId];
                if (!gradeData || (!gradeData.score && gradeData.score !== 0)) return null;

                const payload = {
                    studentId,
                    score: gradeData.score,
                    // comment removed
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

            const results = await Promise.all(promises);

            // Check for failures
            const successfulUpdates = results.filter(r => r && r.data.success);

            if (successfulUpdates.length === dirtyRows.size) {
                setStatus({ type: 'success', message: t('gradeReport.saveSuccess') });
                setDirtyRows(new Set());
                // Refresh data to ensure sync
                loadGrades();
            } else {
                setStatus({ type: 'warning', message: t('gradeReport.partialSave', { success: successfulUpdates.length, total: dirtyRows.size }) });
            }

        } catch (error) {
            console.error('Error saving grades:', error);
            setStatus({ type: 'error', message: t('gradeReport.errorSave') });
        } finally {
            setLoading(false);
        }
    };

    // Auto-load grades when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.course && filters.semester && filters.year) {
                loadGrades();
            }
        }, 800); // Debounce for 800ms

        return () => clearTimeout(timer);
    }, [filters]);

    return (
        <div className="user-management-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>{t('gradeReport.title')}</h1>
                {dirtyRows.size > 0 && (
                    <button
                        onClick={handleSaveAll}
                        className="save-all-btn"
                    >
                        {t('gradeReport.saveAll')} ({dirtyRows.size})
                    </button>
                )}
            </div>

            {status.message && (
                <div className={`alert alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            {/* Filters Section */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('gradeReport.course')}</label>
                    <select
                        value={filters.course}
                        onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="">{t('gradeReport.selectCourse')}</option>
                        {courses.map(course => (
                            <option key={course._id} value={course.title}>{course.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('gradeReport.semester')}</label>
                    <select
                        value={filters.semester}
                        onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="1st">{t('gradeReport.semester1')}</option>
                        <option value="2nd">{t('gradeReport.semester2')}</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('gradeReport.year')}</label>
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        {Array.from({ length: 11 }, (_, i) => (new Date().getFullYear()) - 5 + i).map(year => (
                            <option key={year} value={year.toString()}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Excel-like Grid */}
            <div className="table-wrapper">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>{t('gradeReport.studentName')}</th>
                            <th style={{ width: '150px' }}>{t('gradeReport.score')}</th>
                            {/* Comment column removed */}
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student, index) => {
                                const grade = gradesMap[student._id] || {};
                                const isDirty = dirtyRows.has(student._id);

                                return (
                                    <tr key={student._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{student.name}</strong>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={grade.score || ''}
                                                onChange={(e) => handleGradeChange(student._id, 'score', e.target.value)}
                                                style={{ width: '100%', padding: '0.4rem', border: isDirty ? '1px solid #007bff' : '1px solid #ccc' }}
                                            />
                                        </td>
                                        {/* Comment input removed */}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>{t('gradeReport.noStudents')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {loading && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{t('gradeReport.loading')}</p>}
        </div>
    );
};

export default GradeReport;
