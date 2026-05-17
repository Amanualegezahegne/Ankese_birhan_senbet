import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import '../Styles/GradeReport.css';
import '../Styles/Alert.css';

const GradeReport = () => {
    console.log('GradeReport rendering...');
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
        year: new Date().getFullYear().toString(),
        studentGrade: '' // Add student grade filter
    });

    const [dirtyRows, setDirtyRows] = useState(new Set()); // Track modified rows
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [passingScore, setPassingScore] = useState(50);

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    // Fetch students (Role: Student)
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('studentToken');
            let url = '/students?role=student';
            if (filters.studentGrade) {
                url += `&grade=${filters.studentGrade}`;
            }
            
            const response = await api.get(url, {
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
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            if (response.data.success) {
                const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
                let filteredCourses = response.data.data;

                if (studentInfo.role === 'teacher' && studentInfo.course) {
                    // Split by ", " to support teachers teaching multiple courses (e.g. "Math, Science")
                    const teacherCourses = studentInfo.course.split(', ').map(c => c.trim().toLowerCase());
                    filteredCourses = response.data.data.filter(course => 
                        teacherCourses.includes(course.title.trim().toLowerCase())
                    );
                }

                setCourses(filteredCourses);
                if (filteredCourses.length > 0) {
                    setFilters(prev => ({ ...prev, course: filteredCourses[0].title }));
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
            const response = await api.get(`/grades?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Convert array to map: studentId -> grade
                const newMap = {};
                response.data.data.forEach(grade => {
                    // Handle both populated object and direct ID (prioritizing student_id from Supabase)
                    const studentId = grade.student_id || (typeof grade.student === 'object' ? grade.student.id || grade.student._id : grade.student);
                    if (studentId) {
                        newMap[studentId] = grade;
                    }
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
        setGradesMap(prev => {
            const currentGrade = prev[studentId] || {};
            const updatedGrade = {
                ...currentGrade,
                [field]: value,
                student: studentId
            };

            // Auto-calculate total score if component scores change
            if (['mid_exam', 'final_exam', 'assignment'].includes(field)) {
                const mid = Number(updatedGrade.mid_exam) || 0;
                const final = Number(updatedGrade.final_exam) || 0;
                const assignment = Number(updatedGrade.assignment) || 0;
                updatedGrade.score = mid + final + assignment;
            }

            return {
                ...prev,
                [studentId]: updatedGrade
            };
        });

        setDirtyRows(prev => new Set(prev).add(studentId));
    };

    const toggleRow = (studentId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) newSet.delete(studentId);
            else newSet.add(studentId);
            return newSet;
        });
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
                    mid_exam: Number(gradeData.mid_exam) || 0,
                    final_exam: Number(gradeData.final_exam) || 0,
                    assignment: Number(gradeData.assignment) || 0,
                    status: (Number(gradeData.score) || 0) >= passingScore ? 'Pass' : 'Fail',
                    ...filters
                };

                const gradeId = gradeData.id || gradeData._id;
                if (gradeId) {
                    return api.put(`/grades/${gradeId}`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    return api.post('/grades', payload, {
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
    }, [filters.course, filters.semester, filters.year]);

    // Re-fetch students when grade filter changes
    useEffect(() => {
        fetchStudents();
    }, [filters.studentGrade]);

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
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('signup.grade') || 'Student Grade'}</label>
                    <select
                        value={filters.studentGrade}
                        onChange={(e) => setFilters({ ...filters, studentGrade: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="">{t('gradeReport.allGrades') || 'All Grades'}</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={`grade-${i + 1}`} value={`Grade ${i + 1}`}>
                                Grade {i + 1}
                            </option>
                        ))}
                        <option value="Adult">Adult / Other</option>
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
                            <th>{t('signup.christianName') || 'Christian Name'}</th>
                            <th style={{ width: '150px' }}>{t('gradeReport.score')}</th>
                            <th>{t('gradeReport.status', 'Status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student, index) => {
                                const grade = gradesMap[student.id || student._id] || {};
                                const isDirty = dirtyRows.has(student.id || student._id);
                                const isExpanded = expandedRows.has(student.id || student._id);

                                return (
                                    <tr key={student.id || student._id} className={isExpanded ? 'expanded-row-parent' : ''}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{student.name}</strong>
                                        </td>
                                        <td>{student.christianName}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="number"
                                                        value={grade.score || ''}
                                                        readOnly
                                                        placeholder="Total"
                                                        style={{ width: '80px', padding: '0.4rem', border: isDirty ? '2px solid #007bff' : '1px solid #ccc', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
                                                    />
                                                    <button 
                                                        onClick={() => toggleRow(student.id || student._id)}
                                                        className="score-toggle-btn"
                                                        style={{ 
                                                            padding: '4px 12px', 
                                                            fontSize: '0.8rem', 
                                                            borderRadius: '4px',
                                                            backgroundColor: isExpanded ? '#ffd700' : '#f0f0f0',
                                                            color: '#000',
                                                            border: '1px solid #ccc',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {isExpanded ? 'Close' : 'Score'}
                                                    </button>
                                                </div>
                                                
                                                {isExpanded && (
                                                    <div className="score-details-grid" style={{ 
                                                        display: 'grid', 
                                                        gridTemplateColumns: 'repeat(3, 1fr)', 
                                                        gap: '8px',
                                                        padding: '10px',
                                                        background: 'rgba(255, 215, 0, 0.05)',
                                                        borderRadius: '8px',
                                                        marginTop: '5px',
                                                        border: '1px dashed #ffd700'
                                                    }}>
                                                        <div>
                                                            <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Mid (40)</label>
                                                            <input
                                                                type="number"
                                                                value={grade.mid_exam || ''}
                                                                onChange={(e) => handleGradeChange(student.id || student._id, 'mid_exam', e.target.value)}
                                                                style={{ width: '100%', padding: '3px' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Final (40)</label>
                                                            <input
                                                                type="number"
                                                                value={grade.final_exam || ''}
                                                                onChange={(e) => handleGradeChange(student.id || student._id, 'final_exam', e.target.value)}
                                                                style={{ width: '100%', padding: '3px' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Assign (20)</label>
                                                            <input
                                                                type="number"
                                                                value={grade.assignment || ''}
                                                                onChange={(e) => handleGradeChange(student.id || student._id, 'assignment', e.target.value)}
                                                                style={{ width: '100%', padding: '3px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {(() => {
                                                const currentStatus = (grade.score !== undefined && grade.score !== '') 
                                                    ? (Number(grade.score) >= passingScore ? 'Pass' : 'Fail') 
                                                    : (grade.status || '-');
                                                
                                                return (
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold',
                                                        backgroundColor: currentStatus === 'Pass' ? '#d4edda' : (currentStatus === 'Fail' ? '#f8d7da' : '#e2e3e5'),
                                                        color: currentStatus === 'Pass' ? '#155724' : (currentStatus === 'Fail' ? '#721c24' : '#383d41')
                                                    }}>
                                                        {currentStatus === 'Pass' ? (t('gradeReport.pass') || 'Pass') 
                                                            : (currentStatus === 'Fail' ? (t('gradeReport.fail') || 'Fail') : '-')}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>{t('gradeReport.noStudents')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {loading && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{t('gradeReport.loading')}</p>}
        </div>
    );
};

export default GradeReport;
