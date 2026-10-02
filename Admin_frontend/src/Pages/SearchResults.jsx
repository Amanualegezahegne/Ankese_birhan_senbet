import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaUserGraduate, FaChalkboardTeacher, FaBookOpen } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/UserManagement.css'; // Reuse table styles

const SearchResults = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState({
        students: [],
        teachers: [],
        courses: []
    });

    useEffect(() => {
        if (query) {
            performSearch();
        } else {
            setLoading(false);
        }
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch everything and filter locally for simplicity
            const [studentsRes, teachersRes, coursesRes] = await Promise.all([
                api.get('/students?role=student', { headers }),
                api.get('/students?role=teacher', { headers }),
                api.get('/courses', { headers })
            ]);

            const q = query.toLowerCase();

            const students = (studentsRes.data.data || []).filter(s => 
                s.name?.toLowerCase().includes(q) || 
                s.email?.toLowerCase().includes(q)
            );
            
            const teachers = (teachersRes.data.data || []).filter(t => 
                t.name?.toLowerCase().includes(q) || 
                t.email?.toLowerCase().includes(q)
            );
            
            const courses = (coursesRes.data.data || []).filter(c => 
                c.courseName?.toLowerCase().includes(q) || 
                c.courseCode?.toLowerCase().includes(q)
            );

            setResults({ students, teachers, courses });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-management-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Search Results</h1>
                    <p>Results for "{query}"</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Searching...</div>
            ) : (
                <div className="dashboard-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Students Section */}
                    {results.students.length > 0 && (
                        <div className="premium-chart-card">
                            <h3><FaUserGraduate style={{marginRight: '10px'}}/> Students ({results.students.length})</h3>
                            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Grade</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.students.map(s => (
                                            <tr key={s._id} onClick={() => navigate('/users')} style={{cursor: 'pointer'}}>
                                                <td>{s.name}</td>
                                                <td>{s.email}</td>
                                                <td>{s.grade || 'N/A'}</td>
                                                <td><span className={`status-badge status-${s.status?.toLowerCase() || 'pending'}`}>{s.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Teachers Section */}
                    {results.teachers.length > 0 && (
                        <div className="premium-chart-card">
                            <h3><FaChalkboardTeacher style={{marginRight: '10px'}}/> Teachers ({results.teachers.length})</h3>
                            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.teachers.map(t => (
                                            <tr key={t._id} onClick={() => navigate('/teachers')} style={{cursor: 'pointer'}}>
                                                <td>{t.name}</td>
                                                <td>{t.email}</td>
                                                <td>{t.phone || 'N/A'}</td>
                                                <td><span className={`status-badge status-${t.status?.toLowerCase() || 'pending'}`}>{t.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Courses Section */}
                    {results.courses.length > 0 && (
                        <div className="premium-chart-card">
                            <h3><FaBookOpen style={{marginRight: '10px'}}/> Courses ({results.courses.length})</h3>
                            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>Course Code</th>
                                            <th>Course Name</th>
                                            <th>Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.courses.map(c => (
                                            <tr key={c._id} onClick={() => navigate('/courses')} style={{cursor: 'pointer'}}>
                                                <td><strong>{c.courseCode}</strong></td>
                                                <td>{c.courseName}</td>
                                                <td>{c.credits}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!loading && results.students.length === 0 && results.teachers.length === 0 && results.courses.length === 0 && (
                        <div className="no-data" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
                            <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-color)'}}>No results found for "{query}"</h3>
                            <p style={{ color: 'var(--muted-text)', marginTop: '0.5rem' }}>Try searching with different keywords like a name, email, or course code.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
