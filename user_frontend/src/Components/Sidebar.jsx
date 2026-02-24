import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaNewspaper, FaUser, FaGraduationCap, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, setIsAuthenticated }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

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
                </div>

                <ul className="sidebar-links">
                    <li>
                        <NavLink to="/news" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                            <FaNewspaper className="icon" title={t('navbar.news')} />
                            <span className="label">{t('navbar.news')}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/profile" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                            <FaUser className="icon" title={t('navbar.profile')} />
                            <span className="label">{t('navbar.profile')}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/grades" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                            <FaGraduationCap className="icon" title={t('navbar.gradeReport')} />
                            <span className="label">{t('navbar.gradeReport')}</span>
                        </NavLink>
                    </li>
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
