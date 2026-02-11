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
            {/* Show these only if NOT a teacher */}
            {JSON.parse(localStorage.getItem('studentInfo'))?.role !== 'teacher' && (
              <>
                <Link to="/news" onClick={() => setIsOpen(false)}>{t('navbar.news')}</Link>
                <Link to="/profile" onClick={() => setIsOpen(false)}>{t('navbar.profile')}</Link>
              </>
            )}

            {/* Grade Report is usually for teachers in your request, but you said "remove from navbar", 
               so I will hide it here for teachers too, as it will be in Sidebar. 
               Students don't access GradeReport here? 
               Wait, previously logic was: teacher -> grades. 
               Now: teacher -> hide from navbar (move to sidebar).
            */}
            {/* If student needs to see grades? Usually students see grades. 
                But the previous code only showed it for teachers? 
                "JSON.parse(...)?.role === 'teacher' && <Link to="/grades"..."
                So previously ONLY teachers saw grades in Navbar.
                Now we remove it from Navbar for teachers.
                So NO ONE sees grades in Navbar now? 
                (Students might access it differently or not implemented here yet).
             */}
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
