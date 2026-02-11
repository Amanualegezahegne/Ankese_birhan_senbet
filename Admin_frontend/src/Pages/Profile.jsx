import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../Styles/Profile.css';

const Profile = () => {
    const { t } = useTranslation();
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
            const token = sessionStorage.getItem('adminToken');
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
            const token = sessionStorage.getItem('adminToken');
            const res = await axios.put('http://localhost:5000/api/auth/profile',
                { email: admin.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setMessage({ type: 'success', text: t('admin.profile.successInfo') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data.message || 'Update failed' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: t('admin.profile.passwordMismatch') });
            return;
        }

        try {
            const token = sessionStorage.getItem('adminToken');
            const res = await axios.put('http://localhost:5000/api/auth/profile',
                {
                    currentPassword: passwords.currentPassword,
                    password: passwords.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setMessage({ type: 'success', text: t('admin.profile.successPassword') });
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data.message || 'Update failed' });
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-profile-container">
            <header className="profile-header">
                <h1>{t('admin.profile.title')}</h1>
                <p>{t('admin.profile.subtitle')}</p>
            </header>

            {message.text && (
                <div className={`alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-grid">
                {/* Account Info */}
                <div className="profile-card">
                    <h3>{t('admin.profile.accountInfo')}</h3>
                    <form onSubmit={handleInfoSubmit} className="profile-form">
                        <div className="form-group">
                            <label>{t('admin.profile.email')}</label>
                            <input
                                type="email"
                                value={admin.email}
                                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            {t('admin.profile.updateInfo')}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="profile-card">
                    <h3>{t('admin.profile.changePassword')}</h3>
                    <form onSubmit={handlePasswordSubmit} className="profile-form">
                        <div className="form-group">
                            <label>{t('admin.profile.currentPassword')}</label>
                            <input
                                type="password"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('admin.profile.newPassword')}</label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('admin.profile.confirmPassword')}</label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary danger">
                            {t('admin.profile.updatePassword')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
