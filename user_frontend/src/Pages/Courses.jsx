import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaBook, FaDownload, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileAlt, FaSearch } from 'react-icons/fa';
import '../Styles/Courses.css';

const Courses = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
    const studentGrade = studentInfo.grade;
    const isTeacher = studentInfo.role === 'teacher';

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/courses`);
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(t('courses.error'));
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileType) => {
        const type = fileType?.toLowerCase();
        if (type === 'pdf') return <FaFilePdf className="file-icon pdf" />;
        if (['doc', 'docx'].includes(type)) return <FaFileWord className="file-icon word" />;
        if (['ppt', 'pptx'].includes(type)) return <FaFilePowerpoint className="file-icon ppt" />;
        if (['xls', 'xlsx'].includes(type)) return <FaFileExcel className="file-icon excel" />;
        return <FaFileAlt className="file-icon generic" />;
    };

    const filteredCourses = courses.filter(course => {
        // Grade matching logic
        let matchesGrade = false;
        if (isTeacher) {
            matchesGrade = true;
        } else if (!course.grade || course.grade === 'General') {
            matchesGrade = true;
        } else if (studentGrade && course.grade === studentGrade) {
            matchesGrade = true;
        }

        if (!matchesGrade) return false;

        // Search matching logic
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesTitle = course.title?.toLowerCase().includes(term);
            const matchesDesc = course.description?.toLowerCase().includes(term);
            const matchesMaterial = course.materials?.some(m => m.name?.toLowerCase().includes(term));
            
            if (!matchesTitle && !matchesDesc && !matchesMaterial) return false;
        }

        return true;
    }).map(course => {
        // If there's a search term, filter the materials to only show those that match 
        // (unless the course title/desc matched, then maybe show all? Let's filter materials anyway so it's focused)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesTitle = course.title?.toLowerCase().includes(term);
            const matchesDesc = course.description?.toLowerCase().includes(term);
            
            // If the course matches, we show all materials. If only a specific material matches, filter materials.
            if (!matchesTitle && !matchesDesc) {
                return {
                    ...course,
                    materials: course.materials?.filter(m => m.name?.toLowerCase().includes(term))
                };
            }
        }
        return course;
    });

    if (loading) return <div className="courses-loading">{t('courses.loading')}</div>;

    return (
        <div className="courses-page">
            <header className="courses-header">
                <div className="container">
                    <h1>{t('courses.title')}</h1>
                    <p>{t('courses.subtitle')}</p>
                </div>
            </header>

            <div className="container">
                <div className="courses-search-container">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search course here..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="courses-search-input"
                        />
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="courses-grid">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <div key={course._id} className="course-card">
                                <div className="course-card-header">
                                    <FaBook className="course-icon" />
                                    <h3>{course.title}</h3>
                                    {course.grade && (
                                        <span className="grade-badge">
                                            {course.grade}
                                        </span>
                                    )}
                                </div>
                                <p className="course-description">{course.description}</p>

                                <div className="materials-section">
                                    <h4>{t('courses.materials')}</h4>
                                    {course.materials && course.materials.length > 0 ? (
                                        <ul className="materials-list">
                                            {course.materials.map((m, index) => (
                                                <li key={m._id} style={{ marginBottom: '0.8rem' }}>
                                                    <a
                                                        href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${m.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="download-only-btn"
                                                        title={t('courses.download')}
                                                    >
                                                        <FaDownload /> {t('courses.download') || 'Download'} {index + 1}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-materials">{t('courses.noMaterials')}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-courses">{t('courses.noCourses')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Courses;
