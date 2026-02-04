import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../styles/SignUp.css';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [sex, setSex] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [dob, setDob] = useState('');
    const [hasServed, setHasServed] = useState('');
    const [previousChurch, setPreviousChurch] = useState('');
    const [certificate, setCertificate] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert(t('signup.passwordMismatch'));
            return;
        }
        console.log('Sign up with:', {
            name, email, phone, sex, nationalId, dob,
            hasServed, previousChurch, certificate, password
        });
        // Add logic to handle sign up
    };

    return (
        <div className="page-container signup-page">
            <div className="signup-card">
                <h2>{t('signup.title')}</h2>
                <p>{t('signup.subtitle')}</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">{t('signup.name')}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder={t('signup.placeholders.name')}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">{t('signup.email')}</label>
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
                        <label htmlFor="phone">{t('signup.phone')}</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="+251..."
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="sex">{t('signup.sex')}</label>
                        <select
                            id="sex"
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '1rem' }}
                        >
                            <option value="">{t('signup.selectSex')}</option>
                            <option value="male">{t('signup.male')}</option>
                            <option value="female">{t('signup.female')}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="nationalId">{t('signup.nationalId')}</label>
                        <input
                            type="text"
                            id="nationalId"
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value)}
                            required
                            placeholder="ID..."
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dob">{t('signup.dob')}</label>
                        <input
                            type="date"
                            id="dob"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="hasServed">{t('signup.servedQuestion')}</label>
                        <select
                            id="hasServed"
                            value={hasServed}
                            onChange={(e) => setHasServed(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '1rem' }}
                        >
                            <option value="">-- {t('signup.selectOption')} --</option>
                            <option value="yes">{t('signup.yesLabel')}</option>
                            <option value="no">{t('signup.noLabel')}</option>
                        </select>
                    </div>
                    {hasServed === 'yes' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="previousChurch">{t('signup.servedWhere')}</label>
                                <input
                                    type="text"
                                    id="previousChurch"
                                    value={previousChurch}
                                    onChange={(e) => setPreviousChurch(e.target.value)}
                                    required
                                    placeholder="Church/Sunday School Name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="certificate">{t('signup.attachCertificate')}</label>
                                <input
                                    type="file"
                                    id="certificate"
                                    onChange={(e) => setCertificate(e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ padding: '0.5rem 0' }}
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label htmlFor="password">{t('signup.password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="********"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">{t('signup.confirmPassword')}</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="********"
                        />
                    </div>
                    <button type="submit" className="submit-btn">{t('signup.button')}</button>
                </form>
                <p className="signin-link">{t('signup.haveAccount')} <Link to="/signin">{t('signup.signIn')}</Link></p>
            </div>
        </div>
    );
};

export default SignUp;
