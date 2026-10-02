import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronRight, FaChevronLeft, FaGlobe, FaMoon, FaSun, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import '../Styles/Navbar.css';

const Navbar = ({ theme, toggleTheme, isAuthenticated, handleLogout, toggleSidebar, isSidebarOpen }) => {
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const changeLanguage = () => {
        const newLang = i18n.language === 'en' ? 'am' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav className="navbar">
            {/* Sidebar Toggle */}
            {isAuthenticated && (
                <div className="nav-left-group">
                    <button
                        className={`sidebar-toggle-btn ${isSidebarOpen ? 'open' : ''}`}
                        onClick={toggleSidebar}
                        aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                    >
                        {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                    </button>
                </div>
            )}

            {/* Brand */}
            <div className="navbar-brand">
                <Link
                    to="/"
                    className={i18n.language === 'am' ? 'compact' : ''}
                >
                    {t('admin.navbar.brand')}
                </Link>
            </div>

            {/* Links */}
            <div className="navbar-links">
                {isAuthenticated ? (
                    <div className="navbar-search">
                        <FaSearch className="search-icon" onClick={() => {
                            if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        }} style={{cursor: 'pointer'}} />
                        <input 
                            type="text" 
                            placeholder="Search globally..." 
                            className="search-input" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                        />
                    </div>
                ) : (
                    <Link to="/signin" className="btn-signin">{t('admin.navbar.signIn')}</Link>
                )}

                <button
                    onClick={changeLanguage}
                    className="theme-toggle-btn lang-btn"
                    aria-label="Change Language"
                    title={i18n.language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
                >
                    <FaGlobe className="nav-icon" />
                    <span>{i18n.language === 'en' ? 'AM' : 'EN'}</span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn mode-btn"
                    aria-label="Toggle Dark Mode"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>

                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="theme-toggle-btn logout-btn"
                        aria-label="Logout"
                        title={t('admin.navbar.logout') || 'Logout'}
                        style={{ marginLeft: '10px', color: '#ef4444' }}
                    >
                        <FaSignOutAlt className="nav-icon" />
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
