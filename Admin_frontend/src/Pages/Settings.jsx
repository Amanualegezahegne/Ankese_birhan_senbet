import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../Styles/Settings.css';

const Settings = ({ theme, toggleTheme }) => {
    const { t, i18n } = useTranslation();
    const [admin, setAdmin] = useState({ email: '' });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAdmin({ email: res.data.user.email });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put('http://localhost:5000/api/auth/profile',
                { email: admin.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setMessage({ type: 'success', text: t('admin.settings.successInfo') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data.message || 'Update failed' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: t('admin.settings.passwordMismatch') });
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put('http://localhost:5000/api/auth/profile',
                {
                    currentPassword: passwords.currentPassword,
                    password: passwords.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setMessage({ type: 'success', text: t('admin.settings.successPassword') });
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data.message || 'Update failed' });
        }
    };

    const changeLanguage = () => {
        const newLang = i18n.language === 'en' ? 'am' : 'en';
        i18n.changeLanguage(newLang);
        setMessage({ type: 'success', text: t('admin.settings.languageChanged') });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    };

    const handleThemeToggle = () => {
        toggleTheme();
        setMessage({ type: 'success', text: t('admin.settings.themeChanged') });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-settings-container">
            <header className="settings-header">
                <h1>{t('admin.settings.title')}</h1>
                <p>{t('admin.settings.subtitle')}</p>
            </header>

            {message.text && (
                <div className={`alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="settings-grid">
                {/* Profile Settings Section */}
                <div className="settings-section">
                    <h2>{t('admin.settings.profileSection')}</h2>

                    {/* Account Info */}
                    <div className="settings-card">
                        <h3>{t('admin.settings.accountInfo')}</h3>
                        <form onSubmit={handleInfoSubmit} className="settings-form">
                            <div className="form-group">
                                <label>{t('admin.settings.email')}</label>
                                <input
                                    type="email"
                                    value={admin.email}
                                    onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                {t('admin.settings.updateInfo')}
                            </button>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="settings-card">
                        <h3>{t('admin.settings.changePassword')}</h3>
                        <form onSubmit={handlePasswordSubmit} className="settings-form">
                            <div className="form-group">
                                <label>{t('admin.settings.currentPassword')}</label>
                                <input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('admin.settings.newPassword')}</label>
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('admin.settings.confirmPassword')}</label>
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary danger">
                                {t('admin.settings.updatePassword')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="settings-section">
                    <h2>{t('admin.settings.preferencesSection')}</h2>

                    {/* Language Preference */}
                    <div className="settings-card preference-card">
                        <div className="preference-header">
                            <div>
                                <h3>{t('admin.settings.languageLabel')}</h3>
                                <p className="preference-desc">{t('admin.settings.languageDesc')}</p>
                            </div>
                            <button
                                onClick={changeLanguage}
                                className="preference-toggle-btn"
                            >
                                {i18n.language === 'en' ? 'English (EN)' : 'አማርኛ (AM)'}
                            </button>
                        </div>
                    </div>

                    {/* Theme Preference */}
                    <div className="settings-card preference-card">
                        <div className="preference-header">
                            <div>
                                <h3>{t('admin.settings.themeLabel')}</h3>
                                <p className="preference-desc">{t('admin.settings.themeDesc')}</p>
                            </div>
                            <button
                                onClick={handleThemeToggle}
                                className="preference-toggle-btn"
                            >
                                {theme === 'light' ? `☀️ ${t('admin.settings.lightMode')}` : `🌙 ${t('admin.settings.darkMode')}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
