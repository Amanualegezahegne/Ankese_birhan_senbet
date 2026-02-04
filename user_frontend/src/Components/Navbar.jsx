import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
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

        <Link
          to="/signin"
          className="btn-signin"
          onClick={() => setIsOpen(false)}
        >
          {t('navbar.signIn')}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
