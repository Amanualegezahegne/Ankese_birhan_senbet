import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaNewspaper, FaUser, FaGraduationCap, FaSignOutAlt, FaBook, FaCalendarCheck, FaMusic } from 'react-icons/fa';
import '../Styles/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, setIsAuthenticated }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('studentInfo'));
    const role = userInfo?.role;
    const isTeacher = role === 'teacher';
    const isMezmure = role === 'mezmure';
    const isStudent = !isTeacher && !isMezmure;

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentInfo');
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={toggleSidebar}
            ></div>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>{t('navbar.brand')}</h3>
                    {isMezmure && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--secondary-color)', fontWeight: 600, letterSpacing: '0.05em' }}>
                            MEZMURE KIFEL
                        </span>
                    )}
                </div>

                <ul className="sidebar-links">
                    {/* Common links for all roles */}
                    {!isMezmure && (
                        <li>
                            <NavLink to="/news" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                <FaNewspaper className="icon" title={t('navbar.news')} />
                                <span className="label">{t('navbar.news')}</span>
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink to="/profile" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                            <FaUser className="icon" title={t('navbar.profile')} />
                            <span className="label">{t('navbar.profile')}</span>
                        </NavLink>
                    </li>

                    {/* Student-only links */}
                    {isStudent && (
                        <>
                            <li>
                                <NavLink to="/courses" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaBook className="icon" title={t('navbar.courses') || 'Courses'} />
                                    <span className="label">{t('navbar.courses') || 'Courses'}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/mezmur" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaMusic className="icon" title={t('navbar.hymns') || 'Hymns'} />
                                    <span className="label">{t('navbar.hymns') || 'መዝሙሮች'}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/my-grades" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaGraduationCap className="icon" title="Grade Result" />
                                    <span className="label">Grade Result</span>
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* Teacher-only links */}
                    {isTeacher && (
                        <>
                            <li>
                                <NavLink to="/attendance" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaCalendarCheck className="icon" title="Attendance" />
                                    <span className="label">Attendance</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/grades" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaGraduationCap className="icon" title={t('navbar.gradeReport')} />
                                    <span className="label">{t('navbar.gradeReport')}</span>
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* Mezmure Kifel links */}
                    {isMezmure && (
                        <>
                            <li>
                                <NavLink to="/mezmure" end onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaMusic className="icon" title="Hymns" />
                                    <span className="label">Hymns</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/mezmure/attendance" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaCalendarCheck className="icon" title="Attendance" />
                                    <span className="label">Attendance</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/mezmure/grades" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                                    <FaGraduationCap className="icon" title="Grade Report" />
                                    <span className="label">Grade Report</span>
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt className="icon" title={t('navbar.logout')} />
                        <span className="label">{t('navbar.logout')}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
