import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { Eye, EyeSlash, User, Lock } from 'iconsax-react';
import { loginUser, verifyAdminRole, saveSession } from '../services/auth';
import '../styles/admin.css';

const AdminLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Send Login Request
            const authData = await loginUser(email, password);

            // authData contains { access_token, user: { id, ... }, ... }
            const accessToken = authData.access_token;
            const userId = authData.user.id;

            // 2. Verify Role
            const isAdmin = await verifyAdminRole(userId, accessToken);

            if (isAdmin) {
                // 3. Keep Token Safe
                saveSession(accessToken, authData.user);

                // 4. Redirect (For now logging success, eventually redirect to dashboard)
                // alert("Login Successful! Welcome Admin.");
                navigate('/admin-dashboard');
            } else {
                setError(t('Access Denied'));
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <h2 className="admin-login-title">{t('Admin Login')}</h2>
                    <p className="admin-login-subtitle">{t('Secure Access')}</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && <div className="admin-error">{error}</div>}

                    <div className="admin-input-group">
                        <label className="admin-label">{t('Email Address')}</label>
                        <div className="admin-input-wrapper">
                            <User size="20" color="#6B82AC" className="admin-input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('Admin Email Placeholder')}
                                className="admin-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="admin-input-group">
                        <label className="admin-label">{t('Password')}</label>
                        <div className="admin-input-wrapper">
                            <Lock size="20" color="#6B82AC" className="admin-input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="admin-input"
                                required
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                className="admin-password-toggle"
                            >
                                {showPassword ?
                                    <EyeSlash size="20" color="#A0AEC0" /> :
                                    <Eye size="20" color="#A0AEC0" />
                                }
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="admin-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                        {loading ? t('Verifying') : t('Login')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
