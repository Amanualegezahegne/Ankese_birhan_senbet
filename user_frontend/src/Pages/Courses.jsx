import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaBook, FaDownload, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileAlt } from 'react-icons/fa';
import '../Styles/Courses.css';

const Courses = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                {error && <div className="error-message">{error}</div>}

                <div className="courses-grid">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <div key={course._id} className="course-card">
                                <div className="course-card-header">
                                    <FaBook className="course-icon" />
                                    <h3>{course.title}</h3>
                                </div>
                                <p className="course-description">{course.description}</p>

                                <div className="materials-section">
                                    <h4>{t('courses.materials')}</h4>
                                    {course.materials && course.materials.length > 0 ? (
                                        <ul className="materials-list">
                                            {course.materials.map((m) => (
                                                <li key={m._id} className="material-item">
                                                    <div className="material-info">
                                                        {getFileIcon(m.fileType)}
                                                        <span className="material-name">{m.name}</span>
                                                    </div>
                                                    <a
                                                        href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${m.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="download-link"
                                                        title={t('courses.download')}
                                                    >
                                                        <FaDownload />
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
