import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import {
    Zap, ChevronRight, Trash2, Cpu, Power, Clock, Activity, BarChart2
} from 'lucide-react';
import '../index.css';

const API = import.meta.env.VITE_API_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDuration = (ms) => {
    if (!ms || ms < 0) return '—';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null, `${s}s`].filter(Boolean).join(' ');
};

// ─── Run-Time Graph (Bar) ─────────────────────────────────────────────────────
const RunTimeChart = ({ data }) => {
    // Build bar segments: each run session = bar with duration in minutes
    const sessions = [];
    let start = null;

    data.forEach((d) => {
        if (d.switch === true && !start) {
            start = new Date(d.timestamp).getTime();
        }
        if (d.switch === false && start) {
            sessions.push({
                x: new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                y: parseFloat(((new Date(d.timestamp).getTime() - start) / 60000).toFixed(1)),
            });
            start = null;
        }
    });
    // If still running
    if (start) {
        sessions.push({
            x: new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            y: parseFloat(((Date.now() - start) / 60000).toFixed(1)),
        });
    }

    const options = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        theme: { mode: 'dark' },
        plotOptions: {
            bar: { borderRadius: 6, columnWidth: '55%' },
        },
        colors: ['#22c55e'],
        xaxis: {
            categories: sessions.map((s) => s.x),
            labels: { style: { colors: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600 } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            title: { text: 'Duration (min)', style: { color: 'rgba(255,255,255,0.3)', fontSize: '10px' } },
            labels: { style: { colors: 'rgba(255,255,255,0.4)', fontSize: '10px' } },
        },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        dataLabels: { enabled: false },
        tooltip: { theme: 'dark', y: { formatter: (v) => `${v} min` } },
        noData: { text: 'No run sessions yet', style: { color: 'rgba(255,255,255,0.3)', fontSize: '12px' } },
    };

    const series = [{ name: 'Run Duration', data: sessions.map((s) => s.y) }];

    return (
        <div className="h-[220px]">
            <Chart options={options} series={series} type="bar" height="100%" width="100%" />
        </div>
    );
};

// ─── Last Hour Status Timeline ────────────────────────────────────────────────
const LastHourStatus = ({ data }) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Build 60 one-minute slots
    const slots = Array.from({ length: 60 }, (_, i) => {
        const slotStart = now - (60 - i) * 60000;
        const slotEnd = slotStart + 60000;
        const point = data.find((d) => {
            const t = new Date(d.timestamp).getTime();
            return t >= slotStart && t < slotEnd;
        });
        return point?.switch === true ? 'on' : point?.switch === false ? 'off' : 'none';
    });

    return (
        <div>
            <div className="flex gap-[2px] flex-wrap">
                {slots.map((s, i) => (
                    <div
                        key={i}
                        title={`${60 - i}min ago: ${s === 'on' ? 'Running' : s === 'off' ? 'Stopped' : 'No data'}`}
                        className="rounded-sm transition-all duration-300"
                        style={{
                            width: '10px',
                            height: '20px',
                            background: s === 'on' ? '#22c55e' : s === 'off' ? '#6b7280' : 'rgba(255,255,255,0.07)',
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[9px] text-white/30 font-bold">60 min ago</span>
                <span className="text-[9px] text-white/30 font-bold">Now</span>
            </div>
            <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Running</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#6b7280]" />
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Stopped</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">No Data</span>
                </div>
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [latestData, setLatestData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [lastHourData, setLastHourData] = useState([]);
    const [isSelectingDashboard, setIsSelectingDashboard] = useState(false);
    const [switchLoading, setSwitchLoading] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(null);
    const timerRef = useRef(null);

    const isRunning = latestData?.switch === true;

    // Live elapsed timer
    useEffect(() => {
        clearInterval(timerRef.current);
        if (isRunning && latestData?.startTime) {
            const start = new Date(latestData.startTime).getTime();
            timerRef.current = setInterval(() => {
                setElapsedMs(Date.now() - start);
            }, 1000);
        } else {
            if (latestData?.startTime && latestData?.stopTime) {
                setElapsedMs(new Date(latestData.stopTime) - new Date(latestData.startTime));
            } else {
                setElapsedMs(null);
            }
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, latestData?.startTime, latestData?.stopTime]);

    // Fetch dashboard list
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/api/dashboards`);
                const all = res.data || [];
                setDashboards(all);
                if (all.length > 1) setIsSelectingDashboard(true);
                else if (all.length === 1) setSelectedDashboard(all[0]);
            } catch (err) {
                console.error('Failed to fetch dashboards', err);
            }
        };
        fetch();
    }, []);

    // Poll data every 3 seconds
    useEffect(() => {
        if (!selectedDashboard) return;
        const poll = async () => {
            try {
                const [latestRes, historyRes, hourRes, switchRes] = await Promise.all([
                    axios.get(`${API}/api/vehicle/latest?deviceId=${selectedDashboard.deviceId}`),
                    axios.get(`${API}/api/vehicle/history?deviceId=${selectedDashboard.deviceId}&limit=200`),
                    axios.get(`${API}/api/vehicle/last-hour?deviceId=${selectedDashboard.deviceId}`),
                    axios.get(`${API}/api/vehicle/switch?deviceId=${selectedDashboard.deviceId}`),
                ]);

                // Merge the explicit switch state into latest data for reliability
                if (latestRes.data && Object.keys(latestRes.data).length > 0) {
                    const merged = {
                        ...latestRes.data,
                        switch: switchRes.data?.switch ?? latestRes.data.switch,
                        startTime: switchRes.data?.startTime ?? latestRes.data.startTime,
                        stopTime: switchRes.data?.stopTime ?? latestRes.data.stopTime,
                    };
                    setLatestData(merged);
                }
                if (historyRes.data) setHistoryData([...historyRes.data].reverse());
                if (hourRes.data) setLastHourData([...hourRes.data].reverse());
            } catch (err) {
                console.error('Data fetch error:', err);
            }
        };
        poll();
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, [selectedDashboard]);

    const handleDeleteDashboard = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this vehicle dashboard?')) return;
        try {
            await axios.delete(`${API}/api/dashboards/${id}`);
            const updated = dashboards.filter((d) => d._id !== id);
            setDashboards(updated);
            if (selectedDashboard?._id === id) {
                setSelectedDashboard(null);
                if (updated.length > 1) setIsSelectingDashboard(true);
            }
        } catch (err) {
            alert('Failed to delete dashboard.');
        }
    };

    const handleToggleSwitch = async () => {
        if (!selectedDashboard || switchLoading) return;
        const newState = !isRunning;
        setSwitchLoading(true);

        // Optimistic UI — update locally before server confirms
        setLatestData(prev => ({ ...prev, switch: newState }));

        try {
            // Use PUT to force-set the switch state deterministically
            await axios.put(`${API}/api/vehicle/switch`, {
                deviceId: selectedDashboard.deviceId,
                switchState: newState,
                reason: 'Dashboard manual toggle',
            });

            // Confirm from server
            const [latestRes, switchRes] = await Promise.all([
                axios.get(`${API}/api/vehicle/latest?deviceId=${selectedDashboard.deviceId}`),
                axios.get(`${API}/api/vehicle/switch?deviceId=${selectedDashboard.deviceId}`),
            ]);
            if (latestRes.data) {
                setLatestData({
                    ...latestRes.data,
                    switch: switchRes.data?.switch ?? latestRes.data.switch,
                    startTime: switchRes.data?.startTime ?? latestRes.data.startTime,
                    stopTime: switchRes.data?.stopTime ?? latestRes.data.stopTime,
                });
            }
        } catch (err) {
            console.error('Switch toggle failed:', err);
            // Revert optimistic update
            setLatestData(prev => ({ ...prev, switch: isRunning }));
            alert('Failed to toggle switch. Check server connection.');
        } finally {
            setSwitchLoading(false);
        }
    };

    // ── Dashboard Selection Grid ─────────────────────────────────────────────
    if (isSelectingDashboard) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <header>
                    <h1 className="text-2xl font-black text-[#111827] tracking-tight">Vehicle Dashboards</h1>
                    <p className="text-sm text-[#6B7280] font-medium mt-1">Select a connected vehicle to monitor.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dashboards.map((d, i) => {
                        const grads = ['grad-blue', 'grad-indigo', 'grad-teal', 'grad-purple', 'grad-navy', 'grad-emerald'];
                        return (
                            <div
                                key={d._id}
                                onClick={() => { setSelectedDashboard(d); setIsSelectingDashboard(false); }}
                                className={`premium-kpi ${grads[i % grads.length]} cursor-pointer group scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`}
                                style={{ minHeight: '200px' }}
                            >
                                <div className="sparkline-bg opacity-30" />
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="glass-icon group-hover:bg-white group-hover:text-[#111827] transition-all duration-500">
                                        <Zap size={24} className="fill-current" />
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                        <span className="text-[10px] font-black tracking-widest uppercase">Node Ready</span>
                                    </div>
                                </div>
                                <div className="mt-6 relative z-10">
                                    <h3 className="text-xl font-black tracking-tight mb-1">{d.dashboardName}</h3>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">{d.deviceName}</p>
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Cpu size={12} />
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider">{d.deviceId}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                                    <button
                                        onClick={(e) => handleDeleteDashboard(d._id, e)}
                                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-500/80 hover:text-white transition-all duration-300"
                                        title="Delete Dashboard"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">View</span>
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#111827] transition-all duration-500">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── Main Dashboard View ──────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#10b981,#06b6d4)'}}>
                        <Zap size={20} className="text-white fill-current" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#111827] tracking-tight">EVIoT Panel</h1>
                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
                            {selectedDashboard ? selectedDashboard.dashboardName : 'No Vehicle Selected'}
                        </span>
                    </div>
                </div>
                {dashboards.length > 1 && (
                    <select
                        className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#111827] outline-none shadow-sm min-w-[180px]"
                        value={selectedDashboard?._id || ''}
                        onChange={(e) => setSelectedDashboard(dashboards.find((d) => d._id === e.target.value))}
                    >
                        {dashboards.map((d) => <option key={d._id} value={d._id}>{d.dashboardName}</option>)}
                    </select>
                )}
            </div>

            {/* ── Top Row: Switch + Status LED + Last Run Time ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                {/* 1. Start / Stop Switch */}
                <div className="premium-kpi grad-navy flex flex-col items-center justify-center gap-5 py-8">
                    <div className="sparkline-bg opacity-10" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">EV Switch</p>
                        {/* Toggle pill */}
                        <button
                            id="ev-switch-toggle"
                            onClick={handleToggleSwitch}
                            disabled={switchLoading || !selectedDashboard}
                            className={`relative w-20 h-10 rounded-full transition-all duration-500 focus:outline-none shadow-lg ${isRunning ? 'bg-[#22c55e]' : 'bg-[#374151]'}`}
                            style={{ boxShadow: isRunning ? '0 0 24px rgba(34,197,94,0.5)' : 'none' }}
                        >
                            <span
                                className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-500 ${isRunning ? 'left-11' : 'left-1'}`}
                            >
                                <Power size={14} className={isRunning ? 'text-[#22c55e]' : 'text-[#374151]'} />
                            </span>
                        </button>
                        <span className={`text-lg font-black tracking-tight ${isRunning ? 'text-[#22c55e]' : 'text-white/40'}`}>
                            {isRunning ? 'START' : 'STOP'}
                        </span>
                        {switchLoading && (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        )}
                    </div>
                </div>

                {/* 2. Status LED */}
                <div className="premium-kpi grad-indigo flex flex-col items-center justify-center gap-4 py-8">
                    <div className="sparkline-bg opacity-10" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Status LED</p>
                        {/* LED orb */}
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700"
                            style={{
                                background: isRunning
                                    ? 'radial-gradient(circle at 35% 35%, #4ade80, #16a34a)'
                                    : 'radial-gradient(circle at 35% 35%, #9ca3af, #4b5563)',
                                boxShadow: isRunning
                                    ? '0 0 0 6px rgba(34,197,94,0.15), 0 0 30px rgba(34,197,94,0.45)'
                                    : '0 0 0 6px rgba(107,114,128,0.15)',
                            }}
                        >
                            <div
                                className="w-5 h-5 rounded-full"
                                style={{
                                    background: isRunning ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                                    animation: isRunning ? 'pulse 1.5s ease-in-out infinite' : 'none',
                                }}
                            />
                        </div>
                        <div className="text-center">
                            <p className={`text-base font-black tracking-tight ${isRunning ? 'text-[#4ade80]' : 'text-[#9ca3af]'}`}>
                                {isRunning ? 'RUNNING' : 'STOPPED'}
                            </p>
                            {latestData?.startTime && (
                                <p className="text-[9px] text-white/30 font-mono mt-1">
                                    {isRunning ? 'Since' : 'Last start'}: {new Date(latestData.startTime).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Last EV Run Time (elapsed) */}
                <div className="premium-kpi grad-emerald flex flex-col items-center justify-center gap-4 py-8">
                    <div className="sparkline-bg opacity-10" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="glass-icon">
                            <Clock size={20} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Last Run Time</p>
                        <p className="text-3xl font-black tracking-tighter text-white">
                            {formatDuration(elapsedMs)}
                        </p>
                        {isRunning && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Live Timer</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Run-Time Record Graph ── */}
            <div className="premium-kpi grad-navy p-8">
                <div className="sparkline-bg opacity-10" />
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                            <BarChart2 size={18} className="text-[#22c55e]" />
                            Last EV Run Time — Record Graph
                        </h3>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">
                            Session durations per start event
                        </p>
                    </div>
                    <div className="trend-badge">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                        <span className="uppercase tracking-widest text-[9px]">AUTO REFRESH</span>
                    </div>
                </div>
                <div className="relative z-10">
                    <RunTimeChart data={historyData} />
                </div>
            </div>

            {/* ── Last Hour Status ── */}
            <div className="premium-kpi grad-purple p-8">
                <div className="sparkline-bg opacity-10" />
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                            <Activity size={18} className="text-[#a78bfa]" />
                            Last Hour Status
                        </h3>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">
                            Per-minute ON/OFF timeline — past 60 minutes
                        </p>
                    </div>
                    <div className="trend-badge">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
                        <span className="uppercase tracking-widest text-[9px]">LIVE</span>
                    </div>
                </div>
                <div className="relative z-10">
                    <LastHourStatus data={lastHourData} />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
