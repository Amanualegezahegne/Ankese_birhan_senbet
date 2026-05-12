import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronRight, FaChevronLeft, FaTimes, FaGlobe, FaMoon, FaSun } from 'react-icons/fa';
import '../Styles/Navbar.css';

const Navbar = ({ theme, toggleTheme, isAuthenticated, handleLogout, toggleSidebar, isSidebarOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const changeLanguage = () => {
        const newLang = i18n.language === 'en' ? 'am' : 'en';
        i18n.changeLanguage(newLang);
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
                    onClick={() => setIsOpen(false)}
                    className={i18n.language === 'am' ? 'compact' : ''}
                >
                    {t('admin.navbar.brand')}
                </Link>
            </div>

            {/* Hamburger for mobile navbar links */}
            <button
                className="hamburger"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            {/* Links */}
            <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
                {isAuthenticated ? (
                    <>
                        <Link to="/" onClick={() => setIsOpen(false)}>{t('admin.navbar.home')}</Link>
                        <Link to="/about" onClick={() => setIsOpen(false)}>{t('admin.navbar.about')}</Link>
                        <Link to="/contact" onClick={() => setIsOpen(false)}>{t('admin.navbar.contact')}</Link>
                    </>
                ) : (
                    <Link to="/signin" onClick={() => setIsOpen(false)} className="btn-signin">{t('admin.navbar.signIn')}</Link>
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
            </div>
        </nav>
    );
};

export default Navbar;
