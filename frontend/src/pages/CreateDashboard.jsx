import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Cpu, User, FileText, MonitorSmartphone, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateDashboard = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [dashboardName, setDashboardName] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');

    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await axios.get(`${apiUrl}/api/devices`);
            setDevices(res.data);
            if (res.data.length > 0) {
                setDeviceId(res.data[0].deviceId);
            }
        } catch (err) {
            console.error('Error fetching devices', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFormLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            await axios.post(`${apiUrl}/api/dashboards`, {
                dashboardName,
                deviceId,
                email,
                password,
                description
            });
            
            setSuccess('Dashboard workstation provisioned successfully!');
            setDashboardName('');
            setEmail('');
            setPassword('');
            setDescription('');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create dashboard');
        } finally {
            setFormLoading(false);
        }
    };

    if (currentUser.role !== 'admin') {
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                Access Denied. Admins only.
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#111827] rounded-xl flex items-center justify-center text-white shadow-lg">
                    <PlusCircle size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-[#111827] tracking-tight">Create Dashboard</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">CONFIGURATION</span>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">INITIALIZE AUTOMATED TELEMETRY</span>
                    </div>
                </div>
            </div>

            {error && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">{error}</div>}
            {success && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold">{success}</div>}

            <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* LEFT CARD: NODE IDENTIFICATION */}
                    <div className="saas-card p-8 h-fit">
                        <div className="flex items-center gap-3 mb-8">
                            <Cpu size={18} className="text-[#10b981]" />
                            <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">NODE IDENTIFICATION</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">LINKED HARDWARE NODE</label>
                                {loading ? (
                                    <div className="auth-input flex items-center justify-center bg-[#F8FAFC]">
                                        <div className="btn-spinner border-slate-200 border-t-[#10b981]"></div>
                                    </div>
                                ) : (
                                    <select 
                                        className="auth-input font-bold text-[#111827]" 
                                        value={deviceId} 
                                        onChange={e => setDeviceId(e.target.value)} 
                                        required
                                    >
                                        <option value="" disabled>-- Select Registered Device --</option>
                                        {devices.map(d => (
                                            <option key={d._id} value={d.deviceId}>{d.deviceName} ({d.deviceId})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">DASHBOARD ALIAS</label>
                                <input 
                                    type="text" 
                                    className="auth-input" 
                                    value={dashboardName} 
                                    onChange={e => setDashboardName(e.target.value)} 
                                    placeholder="e.g. Model S Chassis #1" 
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">TELEMETRY METADATA</label>
                                <textarea 
                                    className="auth-input py-3 h-28 resize-none" 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    placeholder="Provide additional context for this dashboard..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CARD: OWNERSHIP & PERMISSIONS */}
                    <div className="saas-card p-8 h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <User size={18} className="text-[#10b981]" />
                            <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">OWNERSHIP & PERMISSIONS</h3>
                        </div>

                        <p className="text-[#64748B] text-xs font-medium leading-relaxed mb-8 border-b border-[#F1F5F9] pb-6">
                            Assign this dashboard to a user account. If the email doesn't exist, a new profile will be provisioned automatically.
                        </p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">AUTHORIZED EMAIL</label>
                                <input 
                                    type="email" 
                                    className="auth-input" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="operator@fleet.io" 
                                    required 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">SECURE ACCESS PHRASE</label>
                                <input 
                                    type="text" 
                                    className="auth-input" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    placeholder="Min 6 characters" 
                                    required 
                                    minLength={6}
                                />
                            </div>

                            {/* Alert Box */}
                            <div className="mt-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 flex gap-3">
                                <ShieldCheck size={18} className="text-[#10b981] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-[10px] font-black text-[#111827] uppercase tracking-widest mb-1">END-TO-END ENCRYPTION</h4>
                                    <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                                        Dashboards are isolated per user. Security keys are required for hardware handshake.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button Area */}
                <div className="mt-8 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={formLoading} 
                        className="primary-btn h-[52px] px-8 flex items-center justify-center gap-3"
                    >
                        {formLoading ? (
                            <div className="btn-spinner"></div>
                        ) : (
                            <>
                                <Zap size={18} />
                                <span className="uppercase tracking-widest font-black text-xs">GENERATE WORKSTATION</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDashboard;
