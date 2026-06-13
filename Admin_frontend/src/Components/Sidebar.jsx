import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaUsers, FaInfoCircle, FaEnvelope, FaCog, FaClipboardCheck, FaChalkboardTeacher, FaBookOpen, FaSignOutAlt, FaChartBar, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import '../Styles/Sidebar.css';

const Sidebar = ({ handleLogout, isOpen, toggleSidebar }) => {
    const { t } = useTranslation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingCounts, setPendingCounts] = useState({ students: 0, teachers: 0 });
    const location = useLocation();

    useEffect(() => {
        fetchUnreadCount();
        fetchPendingCounts();
        const interval = setInterval(() => {
            fetchUnreadCount();
            fetchPendingCounts();
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Refresh count when navigating (e.g., coming back from Messages page)
        fetchUnreadCount();
        fetchPendingCounts();
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

    const fetchPendingCounts = async () => {
        try {
            const response = await api.get('/students/pending/counts');
            if (response.data.success) {
                setPendingCounts(response.data.counts);
            }
        } catch (error) {
            console.error('Error fetching pending counts:', error);
        }
    };

    return (
        <aside className={`admin-sidebar ${isOpen ? 'show' : ''}`}>
            <div className="sidebar-header-mobile">
                <button className="sidebar-close-btn" onClick={toggleSidebar}>
                    <FaTimes />
                </button>
            </div>
            <nav className="sidebar-nav">
                <NavLink 
                    to="/users" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.users') || 'Students'}
                >
                    <div className="icon-wrapper">
                        <FaUsers className="icon" />
                        {pendingCounts.students > 0 && <span className="notification-dot"></span>}
                    </div>
                    <span className="label">{t('admin.navbar.users') || 'Students'}</span>
                </NavLink>

                <NavLink 
                    to="/teachers" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.teachermanagement.title') || 'Teachers'}
                >
                    <div className="icon-wrapper">
                        <FaChalkboardTeacher className="icon" />
                        {pendingCounts.teachers > 0 && <span className="notification-dot"></span>}
                    </div>
                    <span className="label">{t('admin.teachermanagement.title') || 'Teachers'}</span>
                </NavLink>

                <NavLink 
                    to="/attendance" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.attendance')}
                >
                    <FaClipboardCheck className="icon" />
                    <span className="label">{t('admin.navbar.attendance')}</span>
                </NavLink>

                <NavLink 
                    to="/attendance-date-report" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title="Attendance Report"
                >
                    <FaCalendarAlt className="icon" />
                    <span className="label">Attendance Report</span>
                </NavLink>

                <NavLink 
                    to="/courses" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.courses') || 'Courses'}
                >
                    <FaBookOpen className="icon" />
                    <span className="label">{t('admin.navbar.courses') || 'Courses'}</span>
                </NavLink>

                <NavLink 
                    to="/results" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.results') || 'Results'}
                >
                    <FaChalkboardTeacher className="icon" />
                    <span className="label">{t('admin.navbar.results') || 'Results'}</span>
                </NavLink>

                <NavLink 
                    to="/report" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.report') || 'Reports'}
                >
                    <FaChartBar className="icon" />
                    <span className="label">{t('admin.navbar.report') || 'Reports'}</span>
                </NavLink>

                <NavLink 
                    to="/news" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.news')}
                >
                    <FaInfoCircle className="icon" />
                    <span className="label">{t('admin.navbar.news')}</span>
                </NavLink>
                
                <NavLink 
                    to="/settings" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.settings')}
                >
                    <FaCog className="icon" />
                    <span className="label">{t('admin.navbar.settings')}</span>
                </NavLink>
                
                <NavLink 
                    to="/messages" 
                    onClick={() => isOpen && window.innerWidth <= 768 && toggleSidebar()} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={t('admin.navbar.messages') || 'Messages'}
                >
                    <div className="icon-wrapper">
                        <FaEnvelope className="icon" />
                        {unreadCount > 0 && <span className="notification-dot"></span>}
                    </div>
                    <span className="label">{t('admin.navbar.messages') || 'Messages'}</span>
                </NavLink>

                <div className="sidebar-divider"></div>

                <button
                    onClick={handleLogout}
                    className="nav-item logout-nav-item"
                    title={t('admin.navbar.logout')}
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
