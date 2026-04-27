import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ShieldAlert, Users, Edit, Eye, EyeOff, Lock, ChevronRight } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
    const [editingUser, setEditingUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (currentUser.role === 'admin') fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            const res = await axios.get(`${apiUrl}/api/users`);
            setUsers(res.data);
        } catch (error) { console.error('Error fetching users', error); }
    };

    const handleAddOrEditUser = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            if (editingUser) {
                if (newUser.password && newUser.password.length < 6) return alert('New password must be at least 6 characters.');
                const payload = { email: newUser.email, role: newUser.role };
                if (newUser.password) payload.password = newUser.password;
                await axios.put(`${apiUrl}/api/users/${editingUser._id}`, payload);
            } else {
                if (!newUser.password) return alert('Password is required for new users.');
                if (newUser.password.length < 6) return alert('Password must be at least 6 characters.');
                await axios.post(`${apiUrl}/api/users`, newUser);
            }
            setNewUser({ email: '', password: '', role: 'user' });
            setEditingUser(null);
            fetchUsers();
        } catch (error) { alert(error.response?.data?.message || 'Error saving user'); }
    };

    const handleEditClick = (user) => { setEditingUser(user); setNewUser({ email: user.email, password: '', role: user.role }); };
    const handleCancelEdit = () => { setEditingUser(null); setNewUser({ email: '', password: '', role: 'user' }); };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            await axios.delete(`${apiUrl}/api/users/${id}`);
            fetchUsers();
        } catch (error) { alert(error.response?.data?.message || 'Error deleting user'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#10b981] rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Admin Console</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">RESTRICTED</span>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Access Control & Infrastructure Security</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {currentUser.role === 'admin' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* User Form Card */}
                    <div className="saas-card p-8 h-fit lg:col-span-1">
                        <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9] mb-6">
                            {editingUser ? <Edit size={16} className="text-[#10b981]" /> : <Plus size={16} className="text-[#10b981]" />}
                            <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">{editingUser ? 'Update User' : 'Provision User'}</h3>
                        </div>

                        <form onSubmit={handleAddOrEditUser} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Email Identity</label>
                                <input type="email" className="auth-input" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                    Security Phrase {editingUser && <span className="text-[8px] text-slate-400 normal-case">(empty to keep)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="auth-input pr-10"
                                        value={newUser.password || ''}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required={!editingUser}
                                        placeholder={editingUser ? '••••••••' : 'Min 6 chars'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#111827] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">System Role</label>
                                <select className="auth-input font-bold" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="user">Standard User</option>
                                    <option value="operator">System Operator</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <div className="pt-2 space-y-2">
                                <button type="submit" className="primary-btn w-full h-11 flex items-center justify-center gap-2">
                                    {editingUser ? <Edit size={16} /> : <Plus size={16} />}
                                    <span className="uppercase tracking-widest font-black text-[11px]">{editingUser ? 'Save Updates' : 'Confirm Provision'}</span>
                                </button>
                                {editingUser && (
                                    <button type="button" onClick={handleCancelEdit} className="w-full text-[10px] font-black uppercase text-[#94A3B8] hover:text-[#EF4444] transition-colors py-2">
                                        Abort Editing
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* User Records Table */}
                    <div className="saas-card lg:col-span-3 overflow-hidden flex flex-col">
                        <div className="px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Users size={14} className="text-[#10b981]" />
                                <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-wider">Authenticated Personnel</h3>
                            </div>
                            <span className="text-[10px] font-black text-[#94A3B8] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                {users.length} Authorized Entities
                            </span>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[700px]">
                            <table className="saas-table">
                                <thead>
                                    <tr>
                                        <th>Email Address</th>
                                        <th>System Privilege</th>
                                        {currentUser.role === 'admin' && <th>Cleartext Ref</th>}
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={4} className="py-20 text-center text-[#94A3B8] font-bold uppercase tracking-widest text-[10px]">No personnel records found.</td></tr>
                                    ) : (
                                        users.map(u => (
                                            <tr key={u._id} className="hover:bg-[#F8FAFC] transition-colors">
                                                <td><span className="font-bold text-[#111827]">{u.email}</span></td>
                                                <td>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${u.role === 'admin' ? 'bg-orange-50 border-orange-200 text-orange-600' : u.role === 'operator' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                                        {u.role === 'admin' ? 'Root Admin' : u.role === 'operator' ? 'System Operator' : 'Standard User'}
                                                    </span>
                                                </td>
                                                {currentUser.role === 'admin' && (
                                                    <td className="font-mono text-[11px] text-[#94A3B8] tracking-widest blur-[2px] hover:blur-none transition-all cursor-help">
                                                        {u.plainPassword || '••••••••'}
                                                    </td>
                                                )}
                                                <td className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleEditClick(u)} className="p-2 text-[#94A3B8] hover:text-[#10b981] hover:bg-orange-50 rounded-lg transition-all" title="Modify Privilege"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-all" title="Revoke Access"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="saas-card p-20 text-center space-y-4">
                    <ShieldAlert size={48} className="mx-auto text-red-500" />
                    <h2 className="text-xl font-black text-[#111827]">Security Violation</h2>
                    <p className="text-[#64748B] text-sm">Your account does not possess the requisite privilege level to access the administrative kernel.</p>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
