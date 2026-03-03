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
            return setStatus({ type: 'error', message: t('admin.signin.resetPasswordPage.mismatch') || 'Passwords do not match.' });
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post(`http://localhost:5000/api/auth/reset-password`, {
                email,
                otp,
                password
            });
            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: t('admin.signin.resetPasswordPage.success') || 'Password reset successful!'
                });
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('admin.signin.resetPasswordPage.error') || 'Failed to reset password.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <header className="signin-header">
                    <h1>{t('admin.signin.resetPasswordPage.title') || 'Reset Password'}</h1>
                </header>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                {!status.message || status.type !== 'success' ? (
                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group password-group">
                            <label>{t('admin.signin.resetPasswordPage.newPassword') || 'New Password'}</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', right: '15px', top: '45px' }}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>

                        <div className="form-group">
                            <label>{t('admin.signin.resetPasswordPage.confirmPassword') || 'Confirm Password'}</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? (t('admin.signin.resetPasswordPage.submit') || 'Resetting') + '...' : (t('admin.signin.resetPasswordPage.submit') || 'Reset Password')}
                        </button>
                    </form>
                ) : (
                    <div className="signin-footer">
                        <Link to="/signin">{t('admin.signin.forgotPasswordPage.backToLogin') || 'Back to Sign In'}</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
