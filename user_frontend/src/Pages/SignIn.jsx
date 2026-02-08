import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/SignIn.css';
import '../Styles/Alert.css';

const SignIn = ({ setAuthState }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/students/login', { email, password, rememberMe });
            if (response.data.success) {
                localStorage.setItem('studentToken', response.data.token);
                localStorage.setItem('studentInfo', JSON.stringify(response.data.student));
                setAuthState(true);
                navigate('/news');
            }
        } catch (error) {
            let errorMessage = error.response?.data?.message || 'Invalid email or password';
            if (errorMessage === 'Your account is pending approval') {
                errorMessage = t('signin.pendingError');
            } else if (errorMessage === 'Your account has been rejected') {
                errorMessage = t('signin.rejectedError');
            }
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <header className="signin-header">
                    <h1>{t('signin.title')}</h1>
                    <p>{t('signin.subtitle')}</p>
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
                            placeholder={t('signin.email')}
                        />
                    </div>

                    <div className="input-group password-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder={t('signin.password')}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                    </div>

                    <div className="signin-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>{t('signin.rememberMe')}</span>
                        </label>
                        <Link to="/forgot-password" title={t('signin.forgotPassword')} className="forgot-link">
                            {t('signin.forgotPassword')}
                        </Link>
                    </div>

                    <button type="submit" className="signin-btn" disabled={isSubmitting}>
                        {isSubmitting ? t('signin.button') + '...' : t('signin.button')}
                    </button>
                </form>

                <footer className="signin-footer">
                    <p>
                        {t('signin.noAccount')} <Link to="/signup">{t('signin.createOne')}</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default SignIn;
