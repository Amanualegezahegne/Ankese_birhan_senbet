import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/Subscription.css';

const Subscription = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/subscribers', { email });
            if (response.data.success) {
                setStatus({ type: 'success', message: t('subscription.success') });
                setEmail('');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message === 'This email is already subscribed'
                ? t('subscription.alreadySubscribed')
                : t('subscription.error');
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="subscription-section">
            <div className="subscription-container">
                <div className="subscription-info">
                    <h2>{t('subscription.title')}</h2>
                    <p>{t('subscription.subtitle')}</p>
                </div>
                <form className="subscription-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder={t('subscription.placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <button type="submit" className="subscribe-btn" disabled={loading}>
                        {loading ? '...' : t('subscription.button')}
                    </button>
                </form>
                {status.message && (
                    <div className={`subscription-status ${status.type}`}>
                        {status.message}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Subscription;
