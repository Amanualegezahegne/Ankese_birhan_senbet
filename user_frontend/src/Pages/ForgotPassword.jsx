import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/SignIn.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/students/forgot-password', { email });
            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: t('signin.forgotPasswordPage.success')
                });
                // Redirect to Verify OTP page after a short delay
                setTimeout(() => {
                    navigate('/verify-otp', { state: { email } });
                }, 1500);
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('signin.forgotPasswordPage.error')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <header className="signin-header">
                    <h1>{t('signin.forgotPasswordPage.title')}</h1>
                    <p>{t('signin.forgotPasswordPage.subtitle')}</p>
                </header>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="input-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={t('signin.forgotPasswordPage.emailPlaceholder')}
                        />
                    </div>

                    <button type="submit" className="signin-btn" disabled={isSubmitting}>
                        {isSubmitting ? t('signin.forgotPasswordPage.submit') + '...' : t('signin.forgotPasswordPage.submit')}
                    </button>
                </form>

                <footer className="signin-footer">
                    <p>
                        <Link to="/signin">{t('signin.forgotPasswordPage.backToLogin')}</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default ForgotPassword;
