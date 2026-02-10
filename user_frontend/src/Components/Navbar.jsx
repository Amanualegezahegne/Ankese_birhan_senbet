import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ theme, toggleTheme, isAuthenticated, setIsAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentInfo');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <Link to="/">{t('navbar.brand')}</Link>
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
        <Link to="/" onClick={() => setIsOpen(false)}>{t('navbar.home')}</Link>
        <Link to="/about" onClick={() => setIsOpen(false)}>{t('navbar.about')}</Link>
        <Link to="/contact" onClick={() => setIsOpen(false)}>{t('navbar.contact')}</Link>

        {isAuthenticated && (
          <>
            <Link to="/news" onClick={() => setIsOpen(false)}>{t('navbar.news')}</Link>
            <Link to="/profile" onClick={() => setIsOpen(false)}>{t('navbar.profile')}</Link>
            {JSON.parse(localStorage.getItem('studentInfo'))?.role === 'teacher' && (
              <Link to="/grades" onClick={() => setIsOpen(false)}>{t('navbar.gradeReport')}</Link>
            )}
          </>
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

        {isAuthenticated ? (
          <button
            className="btn-signin logout-btn"
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
          >
            {t('navbar.logout')}
          </button>
        ) : (
          <Link
            to="/signin"
            className="btn-signin"
            onClick={() => setIsOpen(false)}
          >
            {t('navbar.signIn')}
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
