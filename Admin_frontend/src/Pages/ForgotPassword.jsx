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
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: t('admin.signin.forgotPasswordPage.success') || 'OTP sent to your email successfully.'
                });
                // Redirect to Verify OTP page after a short delay
                setTimeout(() => {
                    navigate('/verify-otp', { state: { email } });
                }, 1500);
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('admin.signin.forgotPasswordPage.error') || 'Failed to send OTP.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <header className="signin-header">
                    <h1>{t('admin.signin.forgotPasswordPage.title') || 'Forgot Password'}</h1>
                    <p>{t('admin.signin.forgotPasswordPage.subtitle') || 'Enter your email to receive a reset code'}</p>
                </header>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="form-group">
                        <label>{t('admin.signin.email') || 'Email'}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={t('admin.signin.forgotPasswordPage.emailPlaceholder') || 'Enter your email'}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (t('admin.signin.forgotPasswordPage.submit') || 'Sending') + '...' : (t('admin.signin.forgotPasswordPage.submit') || 'Send Code')}
                    </button>
                </form>

                <footer className="signin-footer">
                    <p>
                        <Link to="/signin">{t('admin.signin.forgotPasswordPage.backToLogin') || 'Back to Sign In'}</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default ForgotPassword;
