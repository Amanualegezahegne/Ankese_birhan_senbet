import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h3>{t('navbar.brand')}</h3>
                <button className="close-btn" onClick={toggleSidebar}>&times;</button>
            </div>

            <ul className="sidebar-links">
                <li>
                    <NavLink to="/news" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                        {t('navbar.news')}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/profile" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                        {t('navbar.profile')}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/grades" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                        {t('navbar.gradeReport')}
                    </NavLink>
                </li>
            </ul>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    {t('navbar.logout')}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
