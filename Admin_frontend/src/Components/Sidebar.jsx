import { NavLink } from 'react-router-dom';
import { FaUsers, FaInfoCircle, FaEnvelope, FaUserAlt, FaClipboardCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../Styles/Sidebar.css';

const Sidebar = () => {
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

                <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaClipboardCheck className="icon" />
                    <span className="label">{t('admin.navbar.attendance')}</span>
                </NavLink>

                <NavLink to="/news" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaInfoCircle className="icon" />
                    <span className="label">{t('admin.navbar.news')}</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaUserAlt className="icon" />
                    <span className="label">{t('admin.navbar.profile')}</span>
                </NavLink>
                <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaEnvelope className="icon" />
                    <span className="label">{t('admin.navbar.messages') || 'Messages'}</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <p>© 2026 Admin Panel</p>
            </div>
        </aside>
    );
};

export default Sidebar;
