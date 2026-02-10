import { NavLink } from 'react-router-dom';
import { FaUsers, FaInfoCircle, FaEnvelope, FaCog, FaClipboardCheck, FaChalkboardTeacher, FaBookOpen, FaSignOutAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../Styles/Sidebar.css';

const Sidebar = ({ handleLogout }) => {
    const { t } = useTranslation();

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h3>Management</h3>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaUsers className="icon" />
                    <span className="label">{t('admin.navbar.users') || 'Students'}</span>
                </NavLink>

                <NavLink to="/teachers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaChalkboardTeacher className="icon" />
                    <span className="label">{t('admin.teachermanagement.title') || 'Teachers'}</span>
                </NavLink>

                <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaClipboardCheck className="icon" />
                    <span className="label">{t('admin.navbar.attendance')}</span>
                </NavLink>

                <NavLink to="/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaBookOpen className="icon" />
                    <span className="label">{t('admin.navbar.courses') || 'Courses'}</span>
                </NavLink>

                <NavLink to="/results" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaChalkboardTeacher className="icon" />
                    <span className="label">{t('admin.navbar.results') || 'Results'}</span>
                </NavLink>

                <NavLink to="/news" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaInfoCircle className="icon" />
                    <span className="label">{t('admin.navbar.news')}</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaCog className="icon" />
                    <span className="label">{t('admin.navbar.settings')}</span>
                </NavLink>
                <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaEnvelope className="icon" />
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
