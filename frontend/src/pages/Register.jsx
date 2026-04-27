import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronRight, UserPlus, ShieldCheck, Zap, Wifi, Power, Activity } from 'lucide-react';

const STEPS = { INFO: 'info', OTP: 'otp', DONE: 'done' };

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(searchParams.get('step') === 'otp' ? STEPS.OTP : STEPS.INFO);
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            await axios.post(`${apiUrl}/api/auth/register`, { email, password, role: 'user' });
            setStep(STEPS.OTP);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            await axios.post(`${apiUrl}/api/auth/send-otp`, { email });
            setCountdown(60);
            setSuccess('OTP resent successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return setError('Please enter all 6 digits.');
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            await axios.post(`${apiUrl}/api/auth/verify-otp`, { email, otp: code });
            setStep(STEPS.DONE);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Shared input style
    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        padding: '12px 14px 12px 42px',
        fontSize: 14, fontWeight: 500,
        border: '1.5px solid #E5E7EB',
        borderRadius: 10, outline: 'none',
        color: '#111827', background: '#FAFAFA',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'row',
            background: '#F5F7FA',
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
                {/* Dark overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, #071a14 0%, rgba(7,26,20,0.75) 50%, rgba(6,182,212,0.1) 100%)',
                }} />
                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(16,185,129,0.3) 1px, transparent 1px)',
                    backgroundSize: '28px 28px', opacity: 0.4,
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    height: '100%', display: 'flex',
                    flexDirection: 'column', justifyContent: 'space-between',
                    padding: '48px 52px',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={20} color="#fff" fill="#fff" />
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>EVIoT Panel</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>IoT Dashboard</div>
                        </div>
                    </div>

                    {/* Middle */}
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                            borderRadius: 8, padding: '6px 14px', marginBottom: 28,
                        }}>
                            <UserPlus size={14} color="#10b981" />
                            <span style={{ color: '#10b981', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Provisioning Mode</span>
                        </div>

                        <h2 style={{ fontSize: 46, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
                            Join the EV<br />
                            <span style={{ color: '#10b981' }}>IoT Network.</span>
                        </h2>

                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, fontWeight: 500, lineHeight: 1.7, maxWidth: 380, marginBottom: 44 }}>
                            Register your account to get access to real-time EV monitoring, switch control, and fleet analytics.
                        </p>

                        <div style={{ display: 'flex', gap: 40 }}>
                            {[
                                { icon: <Power size={16} color="#10b981" />, val: 'Control', label: 'EV Switch' },
                                { icon: <Activity size={16} color="#22c55e" />, val: 'Real-time', label: 'Monitoring' },
                                { icon: <Wifi size={16} color="#a78bfa" />, val: 'Secure', label: 'IoT Link' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {s.icon}
                                        <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{s.val}</span>
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 600 }}>
                        EVIoT Panel · Electric Vehicle IoT Platform · v1.0
                    </div>
                </div>

                <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 450, height: 450, background: 'rgba(16,185,129,0.06)', borderRadius: '50%', filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 400, height: 400, background: 'rgba(167,139,250,0.04)', borderRadius: '50%', filter: 'blur(100px)' }} />
            </div>

            {/* ── RIGHT: Register Form ──────────────────────────────────── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                background: '#fff',
                minWidth: 0,
                overflowY: 'auto',
            }}>
                <div style={{ width: '100%', maxWidth: 380 }}>
                    {/* Mobile logo */}
                    <div className="auth-mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap size={20} color="#fff" fill="#fff" />
                        </div>
                        <div>
                            <div style={{ color: '#111827', fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>EVIoT Panel</div>
                            <div style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>IoT Dashboard</div>
                        </div>
                    </div>

                    {/* ── STEP: INFO ── */}
                    {step === STEPS.INFO && (
                        <>
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', marginBottom: 6 }}>Create Account</h1>
                            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 36, lineHeight: 1.5 }}>
                                Join the EVIoT platform to monitor your fleet
                            </p>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
                                    <AlertCircle size={15} />{error}
                                </div>
                            )}

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#10b981'}
                                            onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                            placeholder="Min 6 characters" required minLength={6}
                                            style={{ ...inputStyle, paddingRight: 44 }}
                                            onFocus={e => e.target.style.borderColor = '#10b981'}
                                            onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4 }}>
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="reg-btn" style={{ width: '100%', height: 48, marginTop: 4, background: loading ? '#34d399' : 'linear-gradient(135deg, rgb(16, 185, 129), rgb(6, 182, 212))', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                                    {loading ? <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><span>Send OTP Code</span><ChevronRight size={17} /></>}
                                </button>
                            </form>

                            <p style={{ marginTop: 32, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none' }}>Sign in</Link>
                            </p>
                        </>
                    )}

                    {/* ── STEP: OTP ── */}
                    {step === STEPS.OTP && (
                        <>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(52,110,234,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <ShieldCheck size={28} color="#10b981" />
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', marginBottom: 6 }}>Verify Identity</h1>
                            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 36, lineHeight: 1.5 }}>
                                OTP sent to <strong style={{ color: '#111827' }}>{email}</strong>
                            </p>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
                                    <AlertCircle size={15} />{error}
                                </div>
                            )}
                            {success && (
                                <div style={{ padding: '10px 14px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            autoFocus={i === 0}
                                            style={{
                                                width: 48, height: 56, borderRadius: 12,
                                                textAlign: 'center', fontSize: 22, fontWeight: 900,
                                                outline: 'none', transition: 'all 0.2s',
                                                border: `2px solid ${digit ? '#10b981' : '#E5E7EB'}`,
                                                background: digit ? 'rgba(52,110,234,0.05)' : '#FAFAFA',
                                                color: digit ? '#10b981' : '#111827',
                                            }}
                                        />
                                    ))}
                                </div>

                                <button type="submit" disabled={loading || otp.join('').length < 6} className="reg-btn" style={{ width: '100%', height: 48, background: otp.join('').length < 6 ? '#D1D5DB' : 'linear-gradient(135deg, rgb(16, 185, 129), rgb(6, 182, 212))', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: otp.join('').length < 6 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: otp.join('').length < 6 ? 'none' : '0 4px 14px rgba(16,185,129,0.35)' }}>
                                    {loading ? <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><ShieldCheck size={17} /><span>Verify Code</span></>}
                                </button>

                                <button type="button" onClick={handleResendOtp} disabled={countdown > 0} style={{ width: '100%', background: 'none', border: 'none', fontSize: 11, fontWeight: 900, color: countdown > 0 ? '#D1D5DB' : '#10b981', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}>
                                    {countdown > 0 ? `Retry in ${countdown}s` : 'Resend Code'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP: DONE ── */}
                    {step === STEPS.DONE && (
                        <div style={{ textAlign: 'center', paddingTop: 16 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
                                <ShieldCheck size={36} color="#16a34a" />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Registration Complete!</h2>
                            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 36, lineHeight: 1.6 }}>
                                Your EVIoT account is ready. You can now access the monitoring dashboard.
                            </p>
                            <button onClick={() => navigate('/login')} className="reg-btn" style={{ width: '100%', height: 48, background: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(6, 182, 212))', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                                Continue to Login
                            </button>
                        </div>
                    )}

                    <p style={{ marginTop: 48, textAlign: 'center', fontSize: 10, color: '#D1D5DB', fontWeight: 600, letterSpacing: '0.08em' }}>
                        EVIoT PANEL · SECURED · v1.0
                    </p>
                </div>
            </div>

            <style>{`
                .reg-btn:hover {
                    background: linear-gradient(135deg, rgb(16, 185, 129), rgb(6, 182, 212)) !important;
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (min-width: 1024px) {
                    .auth-hero-panel { display: flex !important; flex-direction: column; }
                    .auth-mobile-logo { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Register;
