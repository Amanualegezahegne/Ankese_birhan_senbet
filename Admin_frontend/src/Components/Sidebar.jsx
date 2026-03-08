import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaUsers, FaInfoCircle, FaEnvelope, FaCog, FaClipboardCheck, FaChalkboardTeacher, FaBookOpen, FaSignOutAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import '../Styles/Sidebar.css';

const Sidebar = ({ handleLogout, isOpen, toggleSidebar }) => {
    const { t } = useTranslation();
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Refresh count when navigating (e.g., coming back from Messages page)
        fetchUnreadCount();
    }, [location]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/messages/unread-count');
            if (response.data.success) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    return (
        <aside className={`admin-sidebar ${isOpen ? 'show' : ''}`}>
            <div className="sidebar-header">
                <h3>Management</h3>
                <button className="sidebar-close-btn" onClick={toggleSidebar}>&times;</button>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/users" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaUsers className="icon" />
                    <span className="label">{t('admin.navbar.users') || 'Students'}</span>
                </NavLink>

                <NavLink to="/teachers" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaChalkboardTeacher className="icon" />
                    <span className="label">{t('admin.teachermanagement.title') || 'Teachers'}</span>
                </NavLink>

                <NavLink to="/attendance" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaClipboardCheck className="icon" />
                    <span className="label">{t('admin.navbar.attendance')}</span>
                </NavLink>

                <NavLink to="/courses" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaBookOpen className="icon" />
                    <span className="label">{t('admin.navbar.courses') || 'Courses'}</span>
                </NavLink>

                <NavLink to="/results" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaChalkboardTeacher className="icon" />
                    <span className="label">{t('admin.navbar.results') || 'Results'}</span>
                </NavLink>

                <NavLink to="/news" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaInfoCircle className="icon" />
                    <span className="label">{t('admin.navbar.news')}</span>
                </NavLink>
                <NavLink to="/settings" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaCog className="icon" />
                    <span className="label">{t('admin.navbar.settings')}</span>
                </NavLink>
                <NavLink to="/messages" onClick={() => isOpen && toggleSidebar()} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <div className="icon-wrapper">
                        <FaEnvelope className="icon" />
                        {unreadCount > 0 && <span className="notification-dot"></span>}
                    </div>
                    <span className="label">{t('admin.navbar.messages') || 'Messages'}</span>
                </NavLink>

                <div className="sidebar-divider" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>

                <button
                    onClick={handleLogout}
                    className="nav-item logout-nav-item"
                    style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', color: '#ff4444' }}
                >
                    <FaSignOutAlt className="icon" />
                    <span className="label">{t('admin.navbar.logout')}</span>
                </button>
            </nav>
            <div className="sidebar-footer">
                <p>© 2026 Admin Panel</p>
            </div>
        </aside>
    );
};

export default Sidebar;
