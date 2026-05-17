import { useState, useEffect } from 'react';
import api from '../api/axios';
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
    const [importing, setImporting] = useState(false);

    const [filters, setFilters] = useState({
        course: '',
        grade: 'All',
        semester: '1st',
        year: new Date().getFullYear().toString()
    });

    const [dirtyRows, setDirtyRows] = useState(new Set());
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [passingScore, setPassingScore] = useState(50);

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = sessionStorage.getItem('adminToken');
            let url = '/students?role=student';
            if (filters.grade && filters.grade !== 'All') {
                url += `&grade=${encodeURIComponent(filters.grade)}`;
            }
            
            const response = await api.get(url, {
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

    useEffect(() => {
        fetchStudents();
    }, [filters.grade]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
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
            const token = sessionStorage.getItem('adminToken');
            const query = new URLSearchParams(filters).toString();
            const response = await api.get(`/grades?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const newMap = {};
                response.data.data.forEach(grade => {
                    const studentId = grade.student_id || (typeof grade.student === 'object' ? grade.student.id || grade.student._id : grade.student);
                    if (studentId) {
                        newMap[studentId] = grade;
                    }
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
        // Enforce score constraints (Mid: 40, Final: 40, Assignment: 20)
        if (value !== '') {
            const numVal = Number(value);
            if (!isNaN(numVal)) {
                if (numVal < 0) {
                    value = '0';
                } else if (field === 'mid_exam' && numVal > 40) {
                    value = '40';
                } else if (field === 'final_exam' && numVal > 40) {
                    value = '40';
                } else if (field === 'assignment' && numVal > 20) {
                    value = '20';
                }
            }
        }

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

    const handleSaveAll = async () => {
        if (dirtyRows.size === 0) return;
        if (!window.confirm(`Save changes for ${dirtyRows.size} students?`)) return;

        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const token = sessionStorage.getItem('adminToken');
            const promises = Array.from(dirtyRows).map(async (studentId) => {
                const gradeData = gradesMap[studentId];
                if (!gradeData || (!gradeData.score && gradeData.score !== 0)) return null;

                const scoreVal = Number(gradeData.score);
                const statusVal = scoreVal >= passingScore ? 'Pass' : 'Fail';

                const payload = {
                    studentId,
                    score: scoreVal,
                    status: statusVal,
                    mid_exam: Number(gradeData.mid_exam) || 0,
                    final_exam: Number(gradeData.final_exam) || 0,
                    assignment: Number(gradeData.assignment) || 0,
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

            await Promise.all(promises);
            setStatus({ type: 'success', message: t('admin.results.successSave') || 'All grades saved!' });
            setDirtyRows(new Set());
            loadGrades();
        } catch (error) {
            console.error('Error saving grades:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || t('admin.results.errorSave') || 'Error saving grades' });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!filters.course || !filters.semester || !filters.year) {
            setStatus({ type: 'error', message: 'Please select course, semester and year first' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('course', filters.course);
        formData.append('semester', filters.semester);
        formData.append('year', filters.year);
        formData.append('passingScore', passingScore);

        try {
            setImporting(true);
            setStatus({ type: 'info', message: t('admin.results.importing') });

            const token = sessionStorage.getItem('adminToken');
            const response = await api.post('/grades/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: t('admin.results.importSuccess', { count: response.data.count })
                });
                loadGrades();
            }
        } catch (error) {
            console.error('Import error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('admin.results.importError')
            });
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDownloadCSV = () => {
        if (!students.length) return;

        const headers = [
            t('admin.results.studentName') || 'Student Name',
            t('admin.results.score') || 'Score',
            t('admin.results.statusColumn') || 'Status'
        ];

        const rows = students.map(student => {
            const grade = gradesMap[student._id] || {};
            let statusVal = grade.status || '-';
            if (grade.score !== undefined && grade.score !== '') {
                statusVal = Number(grade.score) >= passingScore ? 'Pass' : 'Fail';
            }

            // Translate status for CSV if needed, or keep as English/Code
            // Let's use the code for consistency or translated if preferred. 
            // Using translated values for the report:
            const statusDisplay = statusVal === 'Pass' ? (t('admin.results.pass') || 'Pass')
                : statusVal === 'Fail' ? (t('admin.results.fail') || 'Fail')
                    : '-';

            return [
                `"${student.name}"`, // Quote name to handle commas
                grade.score || '',
                statusDisplay
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Add BOM for Excel verification of UTF-8
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Results_${filters.course}_${filters.year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="user-management-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1>{t('admin.results.title')}</h1>
                    <p className="subtitle">{t('admin.results.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleDownloadCSV} className="save-all-btn" style={{ backgroundColor: '#28a745' }}>
                        {t('admin.results.downloadCSV') || 'Download Result'}
                    </button>
                    <div className="import-container" style={{ display: 'inline-block' }}>
                        <input
                            type="file"
                            id="import-results"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                            disabled={importing}
                        />
                        <button
                            className="save-all-btn"
                            style={{ backgroundColor: '#17a2b8' }}
                            onClick={() => document.getElementById('import-results').click()}
                            disabled={importing}
                        >
                            {importing ? t('admin.results.importing') : t('admin.results.import')}
                        </button>
                    </div>
                    {dirtyRows.size > 0 && (
                        <button onClick={handleSaveAll} className="save-all-btn">
                            {t('admin.results.saveAll') || 'Save All'} ({dirtyRows.size})
                        </button>
                    )}
                </div>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('admin.usermanagement.table.grade') || 'Grade'}</label>
                    <select
                        value={filters.grade}
                        onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem' }}
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
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#ffd700' }}>{t('admin.results.passingScore')}</label>
                    <input
                        type="number"
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        style={{ width: '100%', padding: '0.5rem', border: '2px solid #ffd700', borderRadius: '4px' }}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>{t('admin.results.studentName') || 'Student Name'}</th>
                            <th style={{ width: '150px' }}>{t('admin.results.score')}</th>
                            <th>{t('admin.results.statusColumn')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => {
                            const grade = gradesMap[student._id] || {};
                            const isDirty = dirtyRows.has(student._id);
                            const isExpanded = expandedRows.has(student._id);

                            // Calculate provisional status if score exists, else verify stored status
                            let currentStatus = grade.status || '-';
                            if (grade.score !== undefined && grade.score !== '') {
                                currentStatus = Number(grade.score) >= passingScore ? 'Pass' : 'Fail';
                            }

                            return (
                                <tr key={student._id} className={isExpanded ? 'expanded-row-parent' : ''}>
                                    <td>{index + 1}</td>
                                    <td><strong>{student.name}</strong></td>
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
                                                    onClick={() => toggleRow(student._id)}
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
                                                            min="0"
                                                            max="40"
                                                            value={grade.mid_exam || ''}
                                                            onChange={(e) => handleGradeChange(student._id, 'mid_exam', e.target.value)}
                                                            style={{ width: '100%', padding: '3px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Final (40)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="40"
                                                            value={grade.final_exam || ''}
                                                            onChange={(e) => handleGradeChange(student._id, 'final_exam', e.target.value)}
                                                            style={{ width: '100%', padding: '3px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Assign (20)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="20"
                                                            value={grade.assignment || ''}
                                                            onChange={(e) => handleGradeChange(student._id, 'assignment', e.target.value)}
                                                            style={{ width: '100%', padding: '3px' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            backgroundColor: currentStatus === 'Pass' ? '#d4edda' : (currentStatus === 'Fail' ? '#f8d7da' : '#e2e3e5'),
                                            color: currentStatus === 'Pass' ? '#155724' : (currentStatus === 'Fail' ? '#721c24' : '#383d41')
                                        }}>
                                            {currentStatus === 'Pass' ? t('admin.results.pass') : (currentStatus === 'Fail' ? t('admin.results.fail') : '-')}
                                        </span>
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
