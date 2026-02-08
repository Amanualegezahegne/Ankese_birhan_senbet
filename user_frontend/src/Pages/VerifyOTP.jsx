import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/SignIn.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setStatus({ type: 'error', message: 'Email missing. Please go back.' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/students/verify-otp', { email, otp });
            if (response.data.success) {
                navigate('/reset-password', { state: { email, otp } });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('signin.verifyOTPPage.error')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <header className="signin-header">
                    <h1>{t('signin.verifyOTPPage.title')}</h1>
                    <p>{t('signin.verifyOTPPage.subtitle')}</p>
                    <p><strong>{email}</strong></p>
                </header>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            placeholder={t('signin.verifyOTPPage.otpPlaceholder')}
                            className="otp-input"
                            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                        />
                    </div>

                    <button type="submit" className="signin-btn" disabled={isSubmitting}>
                        {isSubmitting ? t('signin.verifyOTPPage.submit') + '...' : t('signin.verifyOTPPage.submit')}
                    </button>
                </form>

                <footer className="signin-footer">
                    <p>
                        <Link to="/forgot-password">{t('signin.forgotPasswordPage.backToLogin')}</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default VerifyOTP;
