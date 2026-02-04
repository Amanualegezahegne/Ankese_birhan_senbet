import { useTranslation } from 'react-i18next';
import '../styles/Contact.css';

const Contact = () => {
    const { t } = useTranslation();

    return (
        <div className="page-container contact-page">
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.intro')}</p>

            <div className="contact-content">
                <div className="contact-info">
                    <h3>{t('contact.getInTouch')}</h3>
                    <p><strong>Email:</strong> support@brandname.com</p>
                    <p><strong>Phone:</strong> +251 9 111 111 11</p>
                    <p><strong>Address:</strong> Addis Ababa ,KOLFE KERANYO, ANFO AROUND 105 BUS STOP </p>
                </div>

                <form className="contact-form">
                    <div className="form-group">
                        <label>{t('contact.form.name')}</label>
                        <input type="text" placeholder={t('contact.form.placeholders.name')} />
                    </div>
                    <div className="form-group">
                        <label>{t('contact.form.email')}</label>
                        <input type="email" placeholder={t('contact.form.placeholders.email')} />
                    </div>
                    <div className="form-group">
                        <label>{t('contact.form.message')}</label>
                        <textarea rows="5" placeholder={t('contact.form.placeholders.message')}></textarea>
                    </div>
                    <button type="submit" className="submit-btn">{t('contact.form.send')}</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
