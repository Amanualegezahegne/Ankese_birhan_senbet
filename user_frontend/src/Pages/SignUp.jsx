import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/SignUp.css';
import '../Styles/Alert.css';

const SignUp = () => {
    const [name, setName] = useState('');
    const [christianName, setChristianName] = useState('');
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: t('signup.passwordMismatch') });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const formData = {
                name,
                christianName,
                email,
                phone,
                sex,
                nationalId,
                dob,
                hasServed,
                previousChurch,
                password
            };

            const response = await axios.post('http://localhost:5000/api/students/register', formData);

            if (response.data.success) {
                setStatus({ type: 'success', message: t('signup.successMessage') || 'Registration successful! We will contact you soon.' });
                setName('');
                setChristianName('');
                setEmail('');
                setPhone('');
                setSex('');
                setNationalId('');
                setDob('');
                setHasServed('');
                setPreviousChurch('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || t('signup.errorMessage') || 'Registration failed. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container signup-page">
            <div className="signup-card">
                <h2>{t('signup.title')}</h2>

                {status.message && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="reference-form">
                    <div className="reference-row">
                        <div className="form-group reference-group">
                            <label htmlFor="name" className="reference-label">{t('signup.name')}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder={t('signup.placeholders.name')}
                                autoComplete="name"
                            />
                        </div>
                        <div className="form-group reference-group">
                            <label htmlFor="christianName" className="reference-label">{t('signup.christianName')}</label>
                            <input
                                type="text"
                                id="christianName"
                                value={christianName}
                                onChange={(e) => setChristianName(e.target.value)}
                                required
                                placeholder={t('signup.placeholders.christianName')}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="reference-row">
                        <div className="form-group reference-group">
                            <label htmlFor="email" className="reference-label">{t('signup.email')}</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('signup.placeholders.email')}
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group reference-group">
                            <label htmlFor="phone" className="reference-label">{t('signup.phone')}</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder={t('signup.placeholders.phone')}
                                autoComplete="tel"
                            />
                        </div>
                    </div>

                    <div className="reference-row">
                        <div className="form-group reference-group">
                            <label htmlFor="sex" className="reference-label">{t('signup.sex')}</label>
                            <select
                                id="sex"
                                value={sex}
                                onChange={(e) => setSex(e.target.value)}
                                required
                                className="form-select"
                            >
                                <option value="">{t('signup.selectSex')}</option>
                                <option value="male">{t('signup.male')}</option>
                                <option value="female">{t('signup.female')}</option>
                            </select>
                        </div>
                        <div className="form-group reference-group">
                            <label htmlFor="nationalId" className="reference-label">{t('signup.nationalId')}</label>
                            <input
                                type="text"
                                id="nationalId"
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                                required
                                placeholder={t('signup.placeholders.nationalId')}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="reference-row">
                        <div className="form-group reference-group">
                            <label htmlFor="dob" className="reference-label">{t('signup.dob')}</label>
                            <input
                                type="date"
                                id="dob"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group reference-group">
                            <label htmlFor="hasServed" className="reference-label">{t('signup.servedQuestion')}</label>
                            <select
                                id="hasServed"
                                value={hasServed}
                                onChange={(e) => setHasServed(e.target.value)}
                                required
                                className="form-select"
                            >
                                <option value="">-- {t('signup.selectOption')} --</option>
                                <option value="yes">{t('signup.yesLabel')}</option>
                                <option value="no">{t('signup.noLabel')}</option>
                            </select>
                        </div>
                    </div>

                    {hasServed === 'yes' && (
                        <div className="reference-row fade-in">
                            <div className="form-group reference-group">
                                <label htmlFor="previousChurch" className="reference-label">{t('signup.servedWhere')}</label>
                                <input
                                    type="text"
                                    id="previousChurch"
                                    value={previousChurch}
                                    onChange={(e) => setPreviousChurch(e.target.value)}
                                    required
                                    placeholder="Church/Sunday School Name"
                                />
                            </div>
                            <div className="form-group reference-group">
                                <label htmlFor="certificate" className="reference-label">{t('signup.attachCertificate')}</label>
                                <input
                                    type="file"
                                    id="certificate"
                                    onChange={(e) => setCertificate(e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="file-input"
                                />
                            </div>
                        </div>
                    )}

                    <div className="reference-row">
                        <div className="form-group reference-group">
                            <label htmlFor="password" id="pass-label" className="reference-label">{t('signup.password')}</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder={t('signup.placeholders.password')}
                                    className="password-field"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group reference-group">
                            <label htmlFor="confirmPassword" id="conf-pass-label" className="reference-label">{t('signup.confirmPassword')}</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder={t('signup.placeholders.password')}
                                    className="password-field"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="terms-checkbox">
                        <input type="checkbox" id="terms" required />
                        <label htmlFor="terms">{t('signup.terms') || 'I agree to the terms and conditions and privacy policy of Ankese Birhan Senbet.'}</label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn reference-submit" disabled={isSubmitting}>
                            {isSubmitting ? t('signup.registering') || 'Registering...' : t('signup.button')}
                        </button>
                    </div>
                </form>
                <p className="signin-link">{t('signup.haveAccount')} <Link to="/signin">{t('signup.signIn')}</Link></p>
            </div>
        </div>
    );
};

export default SignUp;
