import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/SignIn.css';
import '../Styles/Alert.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        const endpoint = isRegistering ? 'register' : 'login';

        try {
            const response = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, {
                email,
                password
            });

            if (response.data.success) {
                // Store token and user data in sessionStorage for session-only persistence
                sessionStorage.setItem('adminToken', response.data.token);
                sessionStorage.setItem('adminUser', JSON.stringify(response.data.user));

                setStatus({
                    type: 'success',
                    message: isRegistering ? 'Account created! Redirecting...' : 'Signed in successfully! Redirecting...'
                });

                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Auth error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Authentication failed.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-signin-page">
            <div className="signin-card">
                <h2>{isRegistering ? 'Create Admin Account' : t('admin.signin.title')}</h2>
                {isRegistering && <p>Register as the first administrator</p>}

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">{t('admin.signin.email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">{t('admin.signin.password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="********"
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting
                            ? (isRegistering ? 'Registering...' : 'Signing in...')
                            : (isRegistering ? 'Create Account' : t('admin.signin.button'))}
                    </button>

                    <div className="auth-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <Link
                            to="/forgot-password"
                            className="forgot-password-link"
                            style={{
                                color: 'var(--secondary-color)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                textAlign: 'center',
                                fontSize: '0.9rem'
                            }}
                        >
                            {t('admin.signin.forgotPassword') || 'Forgot Password?'}
                        </Link>

                        <button
                            type="button"
                            className="toggle-auth-btn"
                            onClick={() => setIsRegistering(!isRegistering)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--secondary-color)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.9rem'
                            }}
                        >
                            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register First Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
