import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../styles/SignIn.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Sign in with:', email, password);
        // Add logic to handle sign in
    };

    return (
        <div className="page-container signin-page">
            <div className="signin-card">
                <h2>{t('signin.title')}</h2>
                <p>{t('signin.subtitle')}</p>
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
                    <button type="submit" className="submit-btn">{t('signin.button')}</button>
                </form>
                <p className="signup-link">{t('signin.noAccount')} <Link to="/signup">{t('signin.signup')}</Link></p>
            </div>
        </div>
    );
};

export default SignIn;
