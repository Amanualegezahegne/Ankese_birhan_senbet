import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/SignIn.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { email, otp } = location.state || {};
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !otp) {
            return setStatus({ type: 'error', message: 'Session expired. Please restart the process.' });
        }

        if (password !== confirmPassword) {
            return setStatus({ type: 'error', message: t('signin.resetPasswordPage.mismatch') });
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post(`http://localhost:5000/api/students/reset-password`, {
                email,
                otp,
                password
            });
            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: t('signin.resetPasswordPage.success')
                });
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('signin.resetPasswordPage.error')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <header className="signin-header">
                    <h1>{t('signin.resetPasswordPage.title')}</h1>
                </header>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                {!status.message || status.type !== 'success' ? (
                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="input-group password-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder={t('signin.resetPasswordPage.newPassword')}
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>

                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder={t('signin.resetPasswordPage.confirmPassword')}
                                minLength={6}
                            />
                        </div>

                        <button type="submit" className="signin-btn" disabled={isSubmitting}>
                            {isSubmitting ? t('signin.resetPasswordPage.submit') + '...' : t('signin.resetPasswordPage.submit')}
                        </button>
                    </form>
                ) : (
                    <div className="signin-footer">
                        <Link to="/signin">{t('signin.forgotPasswordPage.backToLogin')}</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
