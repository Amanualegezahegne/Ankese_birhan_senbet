import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/Contact.css';
import '../styles/Alert.css';

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/messages', {
                ...formData,
                source: 'user'
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: t('contact.form.successMessage') });
                setFormData({ name: '', email: '', message: '' });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus({
                type: 'error',
                message: t('contact.form.errorMessage')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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

                <form className="contact-form" onSubmit={handleSubmit}>
                    {status.message && (
                        <div className={`alert alert-${status.type}`}>
                            {status.message}
                        </div>
                    )}

                    <div className="form-group">
                        <label>{t('contact.form.name')}</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('contact.form.placeholders.name')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('contact.form.email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('contact.form.placeholders.email')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('contact.form.message')}</label>
                        <textarea
                            rows="5"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder={t('contact.form.placeholders.message')}
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
