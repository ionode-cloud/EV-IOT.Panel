import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Database, Download, Calendar, FileText, ChevronRight, Clock, 
    MapPin, Activity, Navigation, Eye, Upload, X, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DataLogs = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deviceData, setDeviceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL ;
                const res = await axios.get(`${apiUrl}/api/dashboards`);
                setDashboards(res.data);
                if (res.data.length > 0) setSelectedDeviceId(res.data[0].deviceId);
            } catch (error) {
                console.error('Error fetching dashboards', error);
            }
        };
        fetchDashboards();
    }, []);

    useEffect(() => {
        if (!selectedDeviceId) return;
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL ;
                const url = `${apiUrl}/api/vehicle/history?deviceId=${selectedDeviceId}&limit=100` +
                            (startDate ? `&startDate=${startDate}` : '') +
                            (endDate ? `&endDate=${endDate}` : '');
                const res = await axios.get(url);
                setDeviceData(res.data);
            } catch (error) {
                console.error('Error fetching history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [selectedDeviceId, startDate, endDate]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            await axios.post(`${apiUrl}/api/upload-xlsx`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Data uploaded successfully!');
            // Refresh data
            const res = await axios.get(`${apiUrl}/api/vehicle/history?deviceId=${selectedDeviceId}&limit=100`);
            setDeviceData(res.data);
        } catch (error) {
            console.error('Upload failed', error);
            alert(error.response?.data?.message || 'Failed to upload XLSX data.');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const openDetails = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const handleDownload = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            const url = `${apiUrl}/api/download?deviceId=${selectedDeviceId}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(url, { responseType: 'blob' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(new Blob([response.data]));
            link.setAttribute('download', `EV_Log_${selectedDeviceId}_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file', error);
            alert('Failed to download telemetry archive.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#111827] rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Telemetry Logs</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">ARCHIVE</span>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Review & Export Historical Records</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Action Card */}
            <div className="saas-card p-8 bg-white border border-[#E5E7EB]">
                <div className="flex items-center gap-3 mb-6">
                    <FileText size={16} className="text-[#346eea]" />
                    <h3 className="text-xs font-black text-[#111827] uppercase tracking-[0.2em]">Log Extraction Parameters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Target Node</label>
                        <select className="auth-input font-bold" value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)}>
                            {dashboards.map(d => (
                                <option key={d._id} value={d.deviceId}>{d.dashboardName} [{d.deviceId}]</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Start Epoch</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            <input type="date" className="auth-input pl-11" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">End Epoch</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            <input type="date" className="auth-input pl-11" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button onClick={handleDownload} className="primary-btn h-[44px] flex-1 flex items-center justify-center gap-2 group">
                            <Download size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-widest font-black text-[11px]">Export</span>
                        </button>
                        <div className=" border-2 border-blue-500 rounded-xl relative flex-1">
                            <input
                                type="file"
                                id="xlsx-upload"
                                className="hidden"
                                accept=".xlsx"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                            <label
                                htmlFor="xlsx-upload"
                                className={`secondary-btn h-[44px] w-full flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <div className="btn-spinner w-4 h-4 border-2"></div>
                                ) : (
                                    <Upload size={18} />
                                )}
                                <span className="uppercase tracking-widest font-black text-[11px]">
                                    {uploading ? 'Parsing...' : 'Upload .XLSX'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Grid Card */}
            <div className="saas-card overflow-hidden">
                <div className="px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Activity size={14} className="text-[#346eea]" />
                        <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-wider">Device History Buffer</h3>
                    </div>
                    <span className="text-[10px] font-black text-[#94A3B8] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        {deviceData.length} Points Synchronized
                    </span>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                    <table className="saas-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>SOC (%)</th>
                                <th>Voltage</th>
                                <th>B-Temp</th>
                                <th>M-Temp</th>
                                <th>M-RPM</th>
                                <th>W-RPM</th>
                                <th>Loss</th>
                                <th>Torque</th>
                                <th>GPS Payload</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={10} className="py-20 text-center"><div className="btn-spinner border-slate-200 border-t-[#346eea] mx-auto"></div></td></tr>
                            ) : deviceData.length === 0 ? (
                                <tr><td colSpan={10} className="py-20 text-center text-[#94A3B8] font-bold uppercase tracking-widest text-[10px]">No historical data found for this node.</td></tr>
                            ) : (
                                deviceData.map((d, index) => (
                                    <tr key={index} className="hover:bg-[#F8FAFC] transition-colors">
                                        <td className="text-[10px] font-bold text-[#64748B] font-mono">{new Date(d.timestamp).toLocaleString()}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#111827] rounded-full" style={{ width: `${Math.min(d.batterySOC, 100)}%` }}></div>
                                                </div>
                                                <span className="text-[#111827] font-black text-[11px]">{d.batterySOC}%</span>
                                            </div>
                                        </td>
                                        <td className="font-bold text-[#111827]">{d.batteryVoltage}V</td>
                                        <td className={`font-bold ${d.batteryTemperature > 45 ? 'text-red-500' : 'text-[#64748B]'}`}>{d.batteryTemperature}°C</td>
                                        <td className="font-bold text-[#64748B]">{d.motorTemperature}°C</td>
                                        <td className="font-mono text-[11px] font-bold text-[#475569]">{(d.motorRPM ?? 0).toLocaleString()}</td>
                                        <td className="font-mono text-[11px] font-bold text-[#475569]">{(d.wheelRPM ?? 0).toLocaleString()}</td>
                                        <td className="text-[#64748B] font-bold">{d.loss}%</td>
                                        <td className="text-[#111827] font-black">{d.torque} Nm</td>
                                        <td>
                                            {(() => {
                                                const lat = parseFloat(d.gpsLatitude);
                                                const lng = parseFloat(d.gpsLongitude);
                                                const hasGPS = !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);
                                                
                                                return hasGPS ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
                                                        title={`${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                                                    >
                                                        <Navigation size={10} className="text-[#346eea] flex-shrink-0" />
                                                        <span className="text-[10px] font-mono font-bold text-[#346eea] tracking-tight whitespace-nowrap">
                                                            {lat.toFixed(4)}°, {lng.toFixed(4)}°
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]">
                                                        <MapPin size={10} className="text-[#94A3B8]" />
                                                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">No GPS</span>
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => openDetails(d)}
                                                className="p-2 rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-[#111827] hover:text-white transition-all group"
                                                title="View Detailed Log"
                                            >
                                                <Eye size={14} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed View Modal */}
            {isModalOpen && selectedLog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="saas-card max-w-2xl w-full bg-white relative z-10 overflow-hidden animate-in zoom-in duration-300">
                        <div className="px-8 py-6 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFC]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-white">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#111827] tracking-tight">Signal Diagnostic</h3>
                                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Logged at {new Date(selectedLog.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[#E5E7EB] text-[#64748B] hover:bg-[#F1F5F9] transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { label: 'SOC', val: `${selectedLog.batterySOC}%`, icon: <Activity size={14}/> },
                                { label: 'Voltage', val: `${selectedLog.batteryVoltage}V`, icon: <Activity size={14}/> },
                                { label: 'B-Temp', val: `${selectedLog.batteryTemperature}°C`, icon: <Activity size={14}/> },
                                { label: 'M-Temp', val: `${selectedLog.motorTemperature}°C`, icon: <Activity size={14}/> },
                                { label: 'M-RPM', val: selectedLog.motorRPM, icon: <Activity size={14}/> },
                                { label: 'W-RPM', val: selectedLog.wheelRPM, icon: <Activity size={14}/> },
                                { label: 'Loss', val: `${selectedLog.loss}%`, icon: <Activity size={14}/> },
                                { label: 'Torque', val: `${selectedLog.torque} Nm`, icon: <Activity size={14}/> },
                                { label: 'Speed', val: `${selectedLog.speed} km/h`, icon: <Activity size={14}/> },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]/50">
                                    <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-1">{item.label}</p>
                                    <p className="text-sm font-black text-[#111827]">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        <div className="px-8 py-6 bg-[#F8FAFC] border-t border-[#F1F5F9]">
                            <h4 className="text-[10px] font-black text-[#111827] uppercase tracking-widest mb-4">Location Context</h4>
                            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-[#346eea]" />
                                    <div>
                                        <p className="text-[10px] font-bold text-[#64748B]">GPS Coordinates</p>
                                        <p className="text-xs font-mono font-bold text-[#111827]">{selectedLog.gpsLatitude}, {selectedLog.gpsLongitude}</p>
                                    </div>
                                </div>
                                <a 
                                    href={`https://www.google.com/maps?q=${selectedLog.gpsLatitude},${selectedLog.gpsLongitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="primary-btn px-4 py-2 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Open Map
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataLogs;
