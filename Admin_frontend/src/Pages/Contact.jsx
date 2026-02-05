import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/Contact.css';
import '../Styles/Alert.css';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/messages', {
                name,
                email,
                message,
                source: 'admin'
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: t('admin.contact.successMessage') });
                setName('');
                setEmail('');
                setMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus({ type: 'error', message: t('admin.contact.errorMessage') });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-contact">
            <div className="contact-header">
                <h2>{t('admin.contact.title')}</h2>
                <p>{t('admin.contact.subtitle')}</p>
            </div>

            {status.message && (
                <div className={`alert alert-${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">{t('admin.contact.name')}</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={t('admin.contact.namePlaceholder')}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">{t('admin.contact.email')}</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t('admin.contact.emailPlaceholder')}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="message">{t('admin.contact.message')}</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows="5"
                        placeholder={t('admin.contact.messagePlaceholder')}
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? t('admin.contact.sending') : t('admin.contact.send')}
                </button>
            </form>
        </div>
    );
};

export default Contact;
