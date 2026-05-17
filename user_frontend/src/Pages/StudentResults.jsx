import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGraduationCap, FaCalendarAlt, FaChalkboardTeacher } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/StudentResults.css';

const StudentResults = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState([]);
    const [courseFilter, setCourseFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');

    useEffect(() => {
        const fetchResults = async () => {
            if (!studentInfo.id && !studentInfo._id) {
                setError('Student information not found. Please log in again.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('studentToken');
                const studentId = studentInfo.id || studentInfo._id;
                const response = await api.get(`/grades/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setResults(response.data.data);
                } else {
                    setError('Failed to fetch results.');
                }
            } catch (err) {
                console.error('Error fetching student results:', err);
                setError('An error occurred while fetching your results.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) return <div className="results-loading">{t('courses.loading') || 'Loading...'}</div>;

    // Get unique courses for filter
    const uniqueCourses = [...new Set(results.map(g => g.course))].sort();

    // Filter and group results by Year and Semester
    const filteredResults = courseFilter 
        ? results.filter(g => g.course && g.course.toLowerCase().includes(courseFilter.toLowerCase()))
        : results;

    const groupedResults = filteredResults.reduce((acc, grade) => {
        const key = `${grade.year} - ${grade.semester} Semester`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(grade);
        return acc;
    }, {});

    return (
        <div className="student-results-page">
            <header className="results-header">
                <h2><FaGraduationCap /> Grade Result</h2>
                <p>View your academic performance across all courses.</p>
            </header>

            <div className="container">
                {error && <div className="error-message">{error}</div>}

                {results.length > 0 && !error && (
                    <div className="filter-container search-filter-container">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <input 
                                type="text"
                                value={courseFilter} 
                                onChange={(e) => setCourseFilter(e.target.value)}
                                placeholder="Search or select course..."
                                list="courses-list"
                                className="course-filter-select search-filter-input"
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <datalist id="courses-list">
                                {uniqueCourses.map(course => (
                                    <option key={course} value={course} />
                                ))}
                            </datalist>
                            {courseFilter && (
                                <button 
                                    className="clear-search-btn"
                                    onClick={() => setCourseFilter('')}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--secondary-color)',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {Object.keys(groupedResults).length === 0 && !error ? (
                    <div className="no-results">
                        <FaGraduationCap className="no-results-icon" />
                        <p>No grades have been posted yet.</p>
                    </div>
                ) : (
                    Object.keys(groupedResults).map(term => (
                        <div key={term} className="term-section">
                            <h3 className="term-title"><FaCalendarAlt /> {term}</h3>
                            <div className="results-grid">
                                {groupedResults[term].map(grade => (
                                    <div key={grade.id} className={`result-card ${grade.status === 'Pass' ? 'pass' : (grade.status === 'Fail' ? 'fail' : '')}`}>
                                        <div className="result-course">
                                            <h4>{grade.course}</h4>
                                            {grade.teacher && (
                                                <span className="teacher-name"><FaChalkboardTeacher /> {grade.teacher.name}</span>
                                            )}
                                        </div>
                                        <div className="result-details">
                                            <div className="score-breakdown">
                                                <div className="score-item">
                                                    <span className="score-label">Mid</span>
                                                    <span className="score-value">{grade.mid_exam || 0}</span>
                                                </div>
                                                <div className="score-item">
                                                    <span className="score-label">Final</span>
                                                    <span className="score-value">{grade.final_exam || 0}</span>
                                                </div>
                                                <div className="score-item">
                                                    <span className="score-label">Assign.</span>
                                                    <span className="score-value">{grade.assignment || 0}</span>
                                                </div>
                                            </div>
                                            <div className="total-score-container">
                                                <div className="total-score">
                                                    <span className="total-label">Total</span>
                                                    <span className="total-value">{grade.score !== null ? grade.score : '-'} / 100</span>
                                                </div>
                                                <div className={`status-badge ${grade.status?.toLowerCase() || 'pending'}`}>
                                                    {grade.status === 'Pass' ? (t('gradeReport.pass') || 'Pass') : (grade.status === 'Fail' ? (t('gradeReport.fail') || 'Fail') : (grade.status || 'Pending'))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentResults;
