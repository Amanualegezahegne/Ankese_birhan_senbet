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
            const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
            if (response.data.success) {
                navigate('/reset-password', { state: { email, otp } });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('admin.signin.verifyOTPPage.error') || 'Invalid or expired OTP.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <header className="signin-header">
                    <h1>{t('admin.signin.verifyOTPPage.title') || 'Verify OTP'}</h1>
                    <p>{t('admin.signin.verifyOTPPage.subtitle') || 'Enter the 6-digit code sent to'}</p>
                    <p><strong style={{ color: '#fff' }}>{email}</strong></p>
                </header>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="form-group">
                        <label>{t('admin.signin.verifyOTPPage.otpPlaceholder') || 'Enter code'}</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            placeholder="000000"
                            className="otp-input"
                            style={{ textAlign: 'center' }}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (t('admin.signin.verifyOTPPage.submit') || 'Verifying') + '...' : (t('admin.signin.verifyOTPPage.submit') || 'Verify')}
                    </button>
                </form>

                <footer className="signin-footer">
                    <p>
                        <Link to="/forgot-password">{t('admin.signin.forgotPasswordPage.backToLogin') || 'Back'}</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default VerifyOTP;
