import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../Styles/Navbar.css';

const Navbar = ({ theme, toggleTheme, isAuthenticated, handleLogout }) => {
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
        <nav className="admin-navbar">
            {/* Brand */}
            <div className="navbar-brand">
                <Link to="/">{t('admin.navbar.brand')}</Link>
            </div>

            {/* Hamburger */}
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
                        <Link to="/users" onClick={() => setIsOpen(false)}>{t('admin.navbar.users') || 'User Management'}</Link>
                        <Link to="/messages" onClick={() => setIsOpen(false)}>{t('admin.navbar.messages')}</Link>
                        <Link to="/contact" onClick={() => setIsOpen(false)}>{t('admin.navbar.contact')}</Link>

                        <button
                            onClick={handleLogout}
                            className="btn-signin logout"
                            style={{
                                backgroundColor: '#dc3545',
                                border: 'none',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '30px',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginLeft: '1rem'
                            }}
                        >
                            {t('admin.navbar.logout')}
                        </button>
                    </>
                ) : (
                    <Link
                        to="/signin"
                        className="btn-signin"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('admin.navbar.signIn')}
                    </Link>
                )}

                <button
                    onClick={changeLanguage}
                    className="theme-toggle-btn"
                    aria-label="Change Language"
                    style={{ fontSize: '1rem', fontWeight: 'bold' }}
                >
                    {i18n.language === 'en' ? 'AM' : 'EN'}
                </button>

                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    aria-label="Toggle Dark Mode"
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
