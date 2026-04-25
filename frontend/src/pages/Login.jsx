import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronRight, Zap, Wifi, Power, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
            const { token, user } = res.data;
            login(token, user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'row',
            background: '#F0FDF9',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* ── LEFT: Hero Panel ──────────────────────────────────────── */}
            <div style={{
                flex: '1.1',
                position: 'relative',
                background: '#071a14',
                overflow: 'hidden',
                display: 'none',
            }} className="auth-hero-panel">
                {/* Hero image fills the panel */}
                <img
                    src="/eviot-hero.png"
                    alt="EVIoT Dashboard"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        opacity: 0.55,
                    }}
                />

                {/* Dark overlay gradient */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #071a14 0%, rgba(7,26,20,0.75) 50%, rgba(6,182,212,0.1) 100%)',
                }} />

                {/* Dot grid pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(16,185,129,0.3) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    opacity: 0.4,
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '48px 52px',
                }}>
                    {/* Top logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={20} color="#fff" fill="#fff" />
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>EVIoT Panel</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>IoT Dashboard</div>
                        </div>
                    </div>

                    {/* Middle content */}
                    <div>
                        {/* Live badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(16,185,129,0.12)',
                            border: '1px solid rgba(16,185,129,0.25)',
                            borderRadius: 8, padding: '6px 14px',
                            marginBottom: 28,
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#22c55e',
                                boxShadow: '0 0 8px rgba(34,197,94,0.8)',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }} />
                            <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>System Online</span>
                        </div>

                        <h2 style={{
                            fontSize: 46, fontWeight: 900, color: '#fff',
                            lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20,
                        }}>
                            Smart EV<br />
                            <span style={{ color: '#10b981' }}>IoT Control.</span>
                        </h2>

                        <p style={{
                            color: 'rgba(255,255,255,0.45)', fontSize: 15,
                            fontWeight: 500, lineHeight: 1.7, maxWidth: 380, marginBottom: 44,
                        }}>
                            Monitor, control, and analyze your electric vehicle fleet in real-time from a single intelligent dashboard.
                        </p>

                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 40 }}>
                            {[
                                { icon: <Power size={16} color="#10b981" />, val: 'ON/OFF', label: 'Switch Control' },
                                { icon: <Activity size={16} color="#22c55e" />, val: 'Live', label: 'Run Tracking' },
                                { icon: <Wifi size={16} color="#a78bfa" />, val: 'IoT', label: 'Connected' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {s.icon}
                                        <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>{s.val}</span>
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom tagline */}
                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: 24,
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: 11, fontWeight: 600,
                    }}>
                        EVIoT Panel · Electric Vehicle IoT Platform · v1.0
                    </div>
                </div>

                {/* Glow blobs */}
                <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 450, height: 450, background: 'rgba(16,185,129,0.06)', borderRadius: '50%', filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 400, height: 400, background: 'rgba(34,197,94,0.04)', borderRadius: '50%', filter: 'blur(100px)' }} />
            </div>

            {/* ── RIGHT: Login Form ─────────────────────────────────────── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                background: '#fff',
                minWidth: 0,
            }}>
                <div style={{ width: '100%', maxWidth: 380 }}>
                    {/* Mobile logo (shown only when hero is hidden) */}
                    <div className="auth-mobile-logo" style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Zap size={20} color="#fff" fill="#fff" />
                        </div>
                        <div>
                            <div style={{ color: '#111827', fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>EVIoT Panel</div>
                            <div style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>IoT Dashboard</div>
                        </div>
                    </div>

                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', marginBottom: 6 }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 36, lineHeight: 1.5 }}>
                        Sign in to access your EVIoT monitoring dashboard
                    </p>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 12,
                            background: '#fef2f2', border: '1px solid #fecaca',
                            color: '#dc2626', fontSize: 12, fontWeight: 700, marginBottom: 24,
                        }}>
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@eviot.com"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        padding: '12px 14px 12px 42px',
                                        fontSize: 14, fontWeight: 500,
                                        border: '1.5px solid #E5E7EB',
                                        borderRadius: 10, outline: 'none',
                                        color: '#111827', background: '#FAFAFA',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Password</label>
                                <a href="#" style={{ fontSize: 10, fontWeight: 900, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                                    Forgot?
                                </a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        padding: '12px 44px 12px 42px',
                                        fontSize: 14, fontWeight: 500,
                                        border: '1.5px solid #E5E7EB',
                                        borderRadius: 10, outline: 'none',
                                        color: '#111827', background: '#FAFAFA',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#94A3B8', display: 'flex', padding: 4,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', height: 48, marginTop: 4,
                                background: loading ? '#6ee7b7' : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                fontSize: 13, fontWeight: 800, letterSpacing: '0.06em',
                                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                            }}
                        >
                            {loading ? (
                                <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ChevronRight size={17} />
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: 32, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none' }}>Create one</Link>
                    </p>

                    {/* Footer */}
                    <p style={{ marginTop: 48, textAlign: 'center', fontSize: 10, color: '#D1D5DB', fontWeight: 600, letterSpacing: '0.08em' }}>
                        EVIoT PANEL · SECURED · v1.0
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                @media (min-width: 1024px) {
                    .auth-hero-panel { display: flex !important; flex-direction: column; }
                    .auth-mobile-logo { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
