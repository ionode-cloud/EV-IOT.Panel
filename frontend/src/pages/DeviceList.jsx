import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity, Clock, Search, PlusCircle,
    Trash2, Wifi, WifiOff, AlertCircle,
    MonitorSmartphone, Cpu, Hash, X, MapPin, ChevronRight
} from 'lucide-react';

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [deviceName, setDeviceName] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [location, setLocation] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const isAdmin = user.role === 'admin';

    const fetchDevices = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            const res = await axios.get(`${apiUrl}/api/devices`);
            setDevices(res.data);
        } catch (err) {
            console.error('Error fetching devices', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDevices(); }, []);

    const handleAddDevice = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setFormLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            await axios.post(`${apiUrl}/api/devices`, { deviceName, deviceId, location });
            setFormSuccess(`Device added successfully!`);
            setDeviceName(''); setDeviceId(''); setLocation('');
            fetchDevices();
            setTimeout(() => { setFormSuccess(''); setShowForm(false); }, 2000);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to add device.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this device?')) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            await axios.delete(`${apiUrl}/api/devices/${id}`);
            setDevices(prev => prev.filter(d => d._id !== id));
        } catch (err) {
            alert('Failed to delete device.');
        }
    };

    const filtered = devices.filter(d =>
        d.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#111827] rounded-xl flex items-center justify-center text-white shadow-lg">
                        <MonitorSmartphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Devices</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">MANAGEMENT</span>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{devices.length} Registered Units</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            className="w-full bg-white border border-[#E5E7EB] rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#10b981] transition-all"
                            placeholder="Filter devices..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="primary-btn flex items-center gap-2 px-5 py-2.5"
                        >
                            {showForm ? <X size={18} /> : <PlusCircle size={18} />}
                            <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Device'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Registration Form (Slide-in card) */}
            {showForm && (
                <div className="saas-card p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                            <Cpu size={18} />
                        </div>
                        <h3 className="text-base font-black text-[#111827]">Register New Device</h3>
                    </div>

                    {formError && <div className="p-3 mb-6 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase flex items-center gap-2"><AlertCircle size={14}/> {formError}</div>}
                    {formSuccess && <div className="p-3 mb-6 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase flex items-center gap-2"><PlusCircle size={14}/> {formSuccess}</div>}

                    <form onSubmit={handleAddDevice} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Device Name</label>
                            <input type="text" className="auth-input" value={deviceName} onChange={e => setDeviceName(e.target.value)} placeholder="e.g. Prototype ESP32" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Device ID</label>
                            <input type="text" className="auth-input font-mono" value={deviceId} onChange={e => setDeviceId(e.target.value)} placeholder="e.g. NODE_01" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Global Location</label>
                            <input type="text" className="auth-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, US" required />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={formLoading} className="primary-btn w-full h-[42px] flex items-center justify-center gap-2">
                                {formLoading ? <span className="btn-spinner"></span> : <><PlusCircle size={16} /> Register</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Device Table Card */}
            <div className="saas-card overflow-hidden">
                <div className="px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Registered Hardware</h3>
                    <div className="flex items-center gap-2.5">
                        <Activity size={14} className="text-[#10b981]" />
                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Live Monitoring Active</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="saas-table">
                        <thead>
                            <tr>
                                <th>Device Name</th>
                                <th>Identity</th>
                                <th>Location</th>
                                <th>Network State</th>
                                <th>Diagnostic Time</th>
                                {isAdmin && <th className="text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center text-[#94A3B8] font-bold uppercase tracking-widest">Synchronizing hardware metadata...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center">
                                    <Cpu size={40} className="mx-auto mb-4 text-[#E2E8F0]" />
                                    <p className="text-sm font-bold text-[#111827]">No hardware nodes detected</p>
                                    <p className="text-xs text-[#94A3B8] mt-1">Register a new ESP32 module to begin monitoring.</p>
                                </td></tr>
                            ) : (
                                filtered.map((d) => (
                                    <tr key={d._id} className="hover:bg-[#F8FAFC] transition-colors group">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                                                    <Cpu size={14} />
                                                </div>
                                                <span className="font-bold text-[#111827]">{d.deviceName}</span>
                                            </div>
                                        </td>
                                        <td><span className="font-mono text-[11px] bg-[#F1F5F9] border border-[#E5E7EB] px-2 py-1 rounded-md text-[#475569]">{d.deviceId}</span></td>
                                        <td>
                                            <div className="flex items-center gap-2 text-[#64748B]">
                                                <MapPin size={12} className="text-[#10b981]" />
                                                <span className="font-medium">{d.location}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'Online' ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${d.status === 'Online' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                                    {d.status === 'Online' ? 'Live System' : 'Disconnected'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-[#94A3B8]">
                                                <Clock size={12} />
                                                <span className="text-[11px] font-bold">{new Date(d.lastSeen).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className="text-right">
                                                <button onClick={() => handleDelete(d._id)} className="p-2.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DeviceList;
