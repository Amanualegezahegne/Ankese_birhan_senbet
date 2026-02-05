import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/SignIn.css';
import '../Styles/Alert.css';

const SignIn = ({ setAuthState }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/students/login', { email, password });
            if (response.data.success) {
                localStorage.setItem('studentToken', response.data.token);
                localStorage.setItem('studentInfo', JSON.stringify(response.data.student));
                setAuthState(true);
                navigate('/news');
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Invalid email or password'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container signin-page">
            <div className="signin-card">
                <h2>{t('signin.title')}</h2>
                <p>{t('signin.subtitle')}</p>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">{t('signin.email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">{t('signin.password')}</label>
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
                        {isSubmitting ? t('signin.button') + '...' : t('signin.button')}
                    </button>
                </form>
                <p className="signup-link">{t('signin.noAccount')} <Link to="/signup">{t('signin.signup')}</Link></p>
            </div>
        </div>
    );
};

export default SignIn;
