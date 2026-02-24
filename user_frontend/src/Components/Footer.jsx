import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Subscription from './Subscription';
import '../Styles/Footer.css';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="main-footer">
            <Subscription />
            <div className="footer-content">
                <div className="footer-section">
                    <h3>{t('navbar.brand')}</h3>
                    <p>{t('about.description')}</p>
                </div>
                <div className="footer-section">
                    <h4>{t('footer.links')}</h4>
                    <ul>
                        <li><Link to="/">{t('navbar.home')}</Link></li>
                        <li><Link to="/about">{t('navbar.about')}</Link></li>
                        <li><Link to="/news">{t('navbar.news')}</Link></li>
                        <li><Link to="/contact">{t('navbar.contact')}</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>{t('footer.contact')}</h4>
                    <p>📧 info@ankesebirhan.org</p>
                    <p>📞 +251 911 000000</p>
                    <p>📍 Addis Ababa, Ethiopia</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 {t('navbar.brand')}. {t('footer.rights')}</p>
            </div>
        </footer>
    );
};

export default Footer;
