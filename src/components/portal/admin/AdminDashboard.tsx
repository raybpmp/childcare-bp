import React, { useState, useEffect } from 'react';
import { portalApi } from '@/lib/portal-api';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import {
    Users, Mail, Shield, Search, Loader2,
    AlertCircle, X, TrendingUp, UserCheck, DollarSign,
    Edit2, CheckCircle, XCircle, KeyRound, Download,
    ChevronLeft, ChevronRight, Clock, StickyNote, History,
    Database, Trash2, Plus, Save, Table2, RefreshCw
} from 'lucide-react';

const CLAIMS_API_URL = import.meta.env.PUBLIC_CLAIMS_API_URL || 'https://portal.childcarebusinessplan.com/claims-api/api';
const PAGE_SIZE = 20;

interface DBUser {
    uid: string;
    email: string;
    name: string;
    role: string;
    tier_name: string;
    tier_id: number;
    status: string;
    logins: number;
    created_at: string;
}

interface Tier { id: number; tier_name: string; tier_type: string; }
interface Activity { id: number; uid: string; type: string; description: string; created_at: string; }
interface AdminNote { id: number; target_uid: string; author_uid: string; content: string; created_at: string; }
interface LoginEntry { id: number; uid: string; user_agent: string; login_method: string; created_at: string; }

export const AdminDashboard: React.FC = () => {
    const [authUser, setAuthUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<DBUser[]>([]);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [kpis, setKpis] = useState({ totalUsers: 0, newThisWeek: 0, activeUsers: 0, totalRevenue: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Detail panel data
    const [userActivities, setUserActivities] = useState<Activity[]>([]);
    const [userNotes, setUserNotes] = useState<AdminNote[]>([]);
    const [userLogins, setUserLogins] = useState<LoginEntry[]>([]);

    // Action state
    const [editingTier, setEditingTier] = useState(false);
    const [newTierId, setNewTierId] = useState<number>(3);
    const [savingTier, setSavingTier] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(false);

    // Notes
    const [newNoteContent, setNewNoteContent] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    // Confirmation guard
    const [confirmAction, setConfirmAction] = useState<null | { label: string; action: () => void }>(null);
    const [confirmInput, setConfirmInput] = useState('');

    // Database Explorer
    const [dbTables, setDbTables] = useState<string[]>([]);
    const [dbActiveTable, setDbActiveTable] = useState('');
    const [dbColumns, setDbColumns] = useState<any[]>([]);
    const [dbRows, setDbRows] = useState<any[]>([]);
    const [dbLoading, setDbLoading] = useState(false);
    const [dbEditingRow, setDbEditingRow] = useState<number | null>(null);
    const [dbEditValues, setDbEditValues] = useState<Record<string, any>>({});
    const [dbSaving, setDbSaving] = useState(false);
    const [dbAddingRow, setDbAddingRow] = useState(false);
    const [dbNewRow, setDbNewRow] = useState<Record<string, any>>({});
    const [dbExplorerOpen, setDbExplorerOpen] = useState(false);
    const [dbCreatingTable, setDbCreatingTable] = useState(false);
    const [dbCreateSql, setDbCreateSql] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthUser(user);
            if (user) fetchAll();
            else setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [usersData, tiersData, ledgerData] = await Promise.all([
                portalApi.get('/v1/users'),
                portalApi.get('/v1/access_tiers'),
                portalApi.get('/v1/sales_ledger')
            ]);

            const joined = usersData.map((u: any) => ({
                ...u,
                tier_name: tiersData.find((t: any) => t.id === u.tier_id)?.tier_name || 'Member',
                status: u.status || 'active'
            })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setUsers(joined);
            setTiers(tiersData);

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            setKpis({
                totalUsers: usersData.length,
                newThisWeek: usersData.filter((u: any) => new Date(u.created_at) >= oneWeekAgo).length,
                activeUsers: usersData.filter((u: any) => (u.status || 'active') === 'active').length,
                totalRevenue: ledgerData.reduce((sum: number, e: any) => sum + (e.amount_cents || 0), 0)
            });
        } catch (err) {
            console.error('Admin fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectUser = async (user: DBUser) => {
        if (selectedUser?.uid === user.uid) {
            setSelectedUser(null);
            return;
        }
        setSelectedUser(user);
        setNewTierId(user.tier_id);
        setEditingTier(false);
        setNewNoteContent('');
        setConfirmAction(null);
        setConfirmInput('');

        // Fetch detail panel data
        try {
            const [acts, notes, logins] = await Promise.all([
                portalApi.get('/v1/activities', { uid: user.uid }),
                portalApi.get('/v1/admin_notes', { target_uid: user.uid }),
                portalApi.get('/v1/login_history', { uid: user.uid })
            ]);
            setUserActivities((acts || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10));
            setUserNotes((notes || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            setUserLogins((logins || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10));
        } catch (err) {
            console.error('Detail fetch failed:', err);
        }
    };

    // --- ACTIONS ---

    const handleSaveTier = async () => {
        if (!selectedUser || newTierId === selectedUser.tier_id) return;
        setSavingTier(true);
        try {
            await portalApi.put(`/v1/users/${selectedUser.uid}`, { tier_id: newTierId }, 'uid');
            const newTier = tiers.find(t => t.id === newTierId);
            const newRole = newTier?.tier_type === 'Internal' ? newTier.tier_name : 'Member';
            try {
                await fetch(`${CLAIMS_API_URL}/v1/set-claims`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: selectedUser.uid, role: newRole, tierId: newTierId })
                });
            } catch (claimsErr) {
                console.error('Claims sync failed (non-fatal):', claimsErr);
            }
            await portalApi.post('/v1/activities', {
                uid: selectedUser.uid, type: 'AdminAction',
                description: `Tier changed to ${newTier?.tier_name || newTierId} by admin`
            });
            await fetchAll();
            setEditingTier(false);
            setSelectedUser(null);
        } catch (err: any) {
            alert(`Failed to update tier: ${err.message}`);
        } finally {
            setSavingTier(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedUser) return;
        const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
        setTogglingStatus(true);
        try {
            await portalApi.put(`/v1/users/${selectedUser.uid}`, { status: newStatus }, 'uid');
            await portalApi.post('/v1/activities', {
                uid: selectedUser.uid, type: 'AdminAction',
                description: `Account ${newStatus} by admin`
            });
            await fetchAll();
            setSelectedUser(null);
        } catch (err: any) {
            alert(`Failed: ${err.message}`);
        } finally {
            setTogglingStatus(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!selectedUser) return;
        try {
            await sendPasswordResetEmail(auth, selectedUser.email);
            await portalApi.post('/v1/activities', {
                uid: selectedUser.uid, type: 'AdminAction',
                description: 'Password reset email sent by admin'
            });
            alert(`Password reset email sent to ${selectedUser.email}`);
        } catch (err: any) {
            alert(`Failed: ${err.message}`);
        }
    };

    const handleAddNote = async () => {
        if (!selectedUser || !authUser || !newNoteContent.trim()) return;
        setSavingNote(true);
        try {
            await portalApi.post('/v1/admin_notes', {
                target_uid: selectedUser.uid,
                author_uid: authUser.uid,
                content: newNoteContent.trim()
            });
            // Refetch notes
            const freshNotes = await portalApi.get('/v1/admin_notes', { target_uid: selectedUser.uid });
            setUserNotes((freshNotes || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            setNewNoteContent('');
        } catch (err: any) {
            alert(`Failed to save note: ${err.message}`);
        } finally {
            setSavingNote(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Role', 'Tier', 'Status', 'Logins', 'Joined'];
        const rows = users.map(u => [
            u.name || 'Anonymous',
            u.email,
            u.role || 'Member',
            u.tier_name,
            u.status || 'active',
            String(u.logins || 0),
            new Date(u.created_at).toLocaleDateString()
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ccbp_users_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- DELETE USER ---
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            // Delete related records first (FK constraints) using standard GETs
            try {
                const acts = await portalApi.get('/v1/activities', { uid: selectedUser.uid });
                for (const a of (acts || [])) { await portalApi.del(`/v1/activities/${a.id}`); }
            } catch {}
            try {
                const notes = await portalApi.get('/v1/admin_notes', { target_uid: selectedUser.uid });
                for (const n of (notes || [])) { await portalApi.del(`/v1/admin_notes/${n.id}`); }
            } catch {}
            try {
                const logs = await portalApi.get('/v1/login_history', { uid: selectedUser.uid });
                for (const l of (logs || [])) { await portalApi.del(`/v1/login_history/${l.id}`); }
            } catch {}
            await portalApi.del(`/v1/users/${selectedUser.uid}`, 'uid');
            setSelectedUser(null);
            await fetchAll();
        } catch (err: any) {
            alert(`Delete failed: ${err.message}`);
        }
    };

    // --- DATABASE EXPLORER ---
    const loadTables = async () => {
        try {
            const raw = await portalApi.query('SHOW TABLES');
            const names = raw.map((r: any) => Object.values(r)[0] as string);
            setDbTables(names);
        } catch (err) {
            console.error('Failed to load tables:', err);
        }
    };

    const loadTable = async (tableName: string) => {
        setDbActiveTable(tableName);
        setDbLoading(true);
        setDbEditingRow(null);
        setDbAddingRow(false);
        try {
            const [schema, rows] = await Promise.all([
                portalApi.query(`DESCRIBE \`${tableName}\``),
                portalApi.query(`SELECT * FROM \`${tableName}\``)
            ]);
            setDbColumns(schema);
            setDbRows(rows || []);
        } catch (err) {
            console.error(`Failed to load ${tableName}:`, err);
        } finally {
            setDbLoading(false);
        }
    };

    const getPrimaryKey = (): string => {
        const pk = dbColumns.find((c: any) => c.Key === 'PRI');
        return pk?.Field || 'id';
    };

    const handleDbEdit = (rowIdx: number) => {
        setDbEditingRow(rowIdx);
        setDbEditValues({ ...dbRows[rowIdx] });
    };

    const handleDbSave = async () => {
        if (dbEditingRow === null) return;
        setDbSaving(true);
        const pk = getPrimaryKey();
        const pkVal = dbRows[dbEditingRow][pk];
        try {
            const updateData = { ...dbEditValues };
            delete updateData[pk]; // don't send PK in the update body
            await portalApi.put(`/v1/${dbActiveTable}/${pkVal}`, updateData, pk);
            await loadTable(dbActiveTable);
            setDbEditingRow(null);
        } catch (err: any) {
            alert(`Save failed: ${err.message}`);
        } finally {
            setDbSaving(false);
        }
    };

    const handleDbDelete = async (row: any) => {
        const pk = getPrimaryKey();
        if (!confirm(`Delete row ${pk}=${row[pk]} from ${dbActiveTable}?`)) return;
        try {
            await portalApi.del(`/v1/${dbActiveTable}/${row[pk]}`, pk);
            await loadTable(dbActiveTable);
        } catch (err: any) {
            alert(`Delete failed: ${err.message}`);
        }
    };

    const handleDbAddRow = async () => {
        if (Object.keys(dbNewRow).length === 0) return;
        setDbSaving(true);
        try {
            await portalApi.post(`/v1/${dbActiveTable}`, dbNewRow);
            await loadTable(dbActiveTable);
            setDbAddingRow(false);
            setDbNewRow({});
        } catch (err: any) {
            alert(`Insert failed: ${err.message}`);
        } finally {
            setDbSaving(false);
        }
    };

    const handleCreateTable = async () => {
        if (!dbCreateSql.trim()) return;
        setDbSaving(true);
        try {
            await portalApi.query(dbCreateSql.trim());
            await loadTables();
            setDbCreatingTable(false);
            setDbCreateSql('');
        } catch (err: any) {
            alert(`Create table failed: ${err.message}`);
        } finally {
            setDbSaving(false);
        }
    };

    const handleDropTable = async (tableName: string) => {
        if (!confirm(`PERMANENTLY DROP TABLE "${tableName}"? This cannot be undone.`)) return;
        try {
            await portalApi.query(`DROP TABLE \`${tableName}\``);
            if (dbActiveTable === tableName) {
                setDbActiveTable('');
                setDbColumns([]);
                setDbRows([]);
            }
            await loadTables();
        } catch (err: any) {
            alert(`Drop table failed: ${err.message}`);
        }
    };

    // --- DERIVED STATE ---

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const statusBadge = (status: string) => {
        if (status === 'suspended') return 'bg-red-100 text-red-700';
        if (status === 'banned') return 'bg-gray-200 text-gray-500';
        return 'bg-teal-50 text-teal-700';
    };

    // --- RENDER ---

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!authUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
                <p className="text-gray-500">Please sign in to view the admin panel.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="pro-heading-dense">Admin CRM</h1>
                    <p className="pro-text-meta">Manage users, tiers, and account status.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                >
                    <Download className="h-3 w-3" /> Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Users', value: kpis.totalUsers, icon: Users },
                    { label: 'New This Week', value: kpis.newThisWeek, icon: TrendingUp },
                    { label: 'Active', value: kpis.activeUsers, icon: UserCheck },
                    { label: 'Revenue', value: `$${(kpis.totalRevenue / 100).toFixed(0)}`, icon: DollarSign },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="pro-card glass-panel shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                            <span className="pro-text-meta">{label}</span>
                            <Icon className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div className="text-xl font-black text-gray-900 tracking-tighter">{value}</div>
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <div className="pro-card glass-panel shadow-sm">
                <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-purple-500 shrink-0" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 flex-1">User Management</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white w-full md:w-56"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="pro-card glass-panel shadow-sm overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100/50">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">User</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Tier</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 hidden md:table-cell">Status</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 hidden md:table-cell">Logins</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 hidden lg:table-cell">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/30">
                            {pagedUsers.map((user) => (
                                <tr
                                    key={user.uid}
                                    onClick={() => selectUser(user)}
                                    className={`cursor-pointer transition-colors ${
                                        selectedUser?.uid === user.uid
                                            ? 'bg-purple-50/60 border-l-2 border-purple-500'
                                            : 'hover:bg-white/40'
                                    }`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-gray-900">{user.name || 'Anonymous'}</span>
                                            <span className="text-[10px] text-gray-400">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            user.tier_id <= 2 ? 'bg-purple-100 text-purple-700' : 'bg-teal-50 text-teal-700'
                                        }`}>{user.tier_name}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider capitalize ${statusBadge(user.status)}`}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-[11px] font-black text-gray-900">{user.logins || 0}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(user.created_at).toLocaleDateString()}</span>
                                    </td>
                                </tr>
                            ))}
                            {pagedUsers.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100/50">
                        <button
                            disabled={safePage <= 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-3 w-3" /> Previous
                        </button>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page {safePage} of {totalPages}
                        </span>
                        <button
                            disabled={safePage >= totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* ======================= USER DETAIL PANEL ======================= */}
            {selectedUser && (
                <div className="pro-card glass-panel shadow-sm space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100/50 pb-3">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">{selectedUser.name || 'Anonymous'}</h3>
                            <p className="pro-text-meta">{selectedUser.email}</p>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Row 1: Info + Tier + Status/Actions */}
                    <div className="grid md:grid-cols-3 gap-3">

                        {/* Info */}
                        <div className="space-y-1">
                            {[
                                { label: 'Role', value: selectedUser.role || 'Member' },
                                { label: 'Tier', value: selectedUser.tier_name },
                                { label: 'Logins', value: selectedUser.logins || 0 },
                                { label: 'Status', value: selectedUser.status || 'active' },
                                { label: 'Joined', value: new Date(selectedUser.created_at).toLocaleDateString() },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100/30">
                                    <span className="pro-text-meta uppercase font-bold text-gray-400">{label}</span>
                                    <span className="text-[11px] font-black text-gray-900 capitalize">{String(value)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Change Tier */}
                        <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                                <Edit2 className="h-3 w-3 text-teal-600" /> Access Tier
                            </h4>
                            {!editingTier ? (
                                <button onClick={() => setEditingTier(true)}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 hover:bg-teal-100 py-2 rounded-lg transition-colors">
                                    Change Tier
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <select value={newTierId} onChange={e => setNewTierId(Number(e.target.value))}
                                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                                        {tiers.map(t => <option key={t.id} value={t.id}>{t.tier_name} (Tier {t.id})</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveTier} disabled={savingTier}
                                            className="flex-1 text-[10px] font-black uppercase text-white bg-teal-600 hover:bg-teal-700 py-1.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1">
                                            {savingTier ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Save
                                        </button>
                                        <button onClick={() => setEditingTier(false)}
                                            className="px-3 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-white">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status + Quick Actions */}
                        <div className="space-y-2">
                            <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                                    {selectedUser.status === 'active' ? <CheckCircle className="h-3 w-3 text-teal-600" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                    Account Status
                                </h4>
                                <button
                                    onClick={() => setConfirmAction({
                                        label: selectedUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account',
                                        action: handleToggleStatus
                                    })}
                                    className={`w-full text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-colors ${
                                        selectedUser.status === 'active' ? 'text-red-700 bg-red-50 hover:bg-red-100' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                                    }`}>
                                    {selectedUser.status === 'active' ? 'Suspend' : 'Reactivate'}
                                </button>
                            </div>
                            <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                                    <KeyRound className="h-3 w-3 text-amber-500" /> Password
                                </h4>
                                <button onClick={handlePasswordReset}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 hover:bg-amber-100 py-2 rounded-lg transition-colors">
                                    Send Reset Email
                                </button>
                            </div>
                            <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                                    <Trash2 className="h-3 w-3 text-red-500" /> Delete User
                                </h4>
                                <button
                                    onClick={() => setConfirmAction({ label: 'Permanently Delete User', action: handleDeleteUser })}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Activity Log + Login History + Admin Notes */}
                    <div className="grid md:grid-cols-3 gap-3">

                        {/* Activity Timeline */}
                        <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1 border-b border-gray-100/30 pb-2">
                                <Clock className="h-3 w-3 text-teal-600" /> Activity Log
                            </h4>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {userActivities.length > 0 ? userActivities.map(act => (
                                    <div key={act.id} className="flex items-start justify-between gap-2 py-1 border-b border-gray-50/50">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-gray-800 leading-tight truncate">{act.description}</p>
                                            <p className="text-[9px] text-gray-400">{new Date(act.created_at).toLocaleString()}</p>
                                        </div>
                                        <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-teal-600 text-[7px] font-black uppercase tracking-widest text-white">
                                            {act.type}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-gray-400 font-bold py-2 text-center">No activity recorded.</p>
                                )}
                            </div>
                        </div>

                        {/* Login History */}
                        <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1 border-b border-gray-100/30 pb-2">
                                <History className="h-3 w-3 text-blue-500" /> Login History
                            </h4>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {userLogins.length > 0 ? userLogins.map(entry => (
                                    <div key={entry.id} className="py-1 border-b border-gray-50/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-800">{new Date(entry.created_at).toLocaleString()}</span>
                                            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[7px] font-black uppercase tracking-wider text-blue-600">
                                                {entry.login_method}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-gray-400 truncate">{entry.user_agent ? entry.user_agent.slice(0, 60) + '...' : 'Unknown'}</p>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-gray-400 font-bold py-2 text-center">No login history.</p>
                                )}
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1 border-b border-gray-100/30 pb-2">
                                <StickyNote className="h-3 w-3 text-purple-500" /> Internal Notes
                            </h4>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                {userNotes.length > 0 ? userNotes.map(note => (
                                    <div key={note.id} className="py-1.5 border-b border-gray-50/50">
                                        <p className="text-[10px] font-bold text-gray-800 leading-tight">{note.content}</p>
                                        <p className="text-[9px] text-gray-400">{new Date(note.created_at).toLocaleString()}</p>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-gray-400 font-bold py-1 text-center">No notes yet.</p>
                                )}
                            </div>
                            {/* Add Note */}
                            <div className="space-y-1.5 pt-1 border-t border-gray-100/30">
                                <textarea
                                    className="w-full h-16 p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white"
                                    placeholder="Write an internal note..."
                                    value={newNoteContent}
                                    onChange={e => setNewNoteContent(e.target.value)}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={savingNote || !newNoteContent.trim()}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-700 py-1.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                                >
                                    {savingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <StickyNote className="h-3 w-3" />} Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================= DATABASE EXPLORER ======================= */}
            <div className="pro-card glass-panel shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100/50 pb-2">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-teal-600" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Database Explorer</h3>
                    </div>
                    <button
                        onClick={() => { setDbExplorerOpen(!dbExplorerOpen); if (!dbExplorerOpen && dbTables.length === 0) loadTables(); }}
                        className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition-colors"
                    >
                        {dbExplorerOpen ? 'Collapse' : 'Open'}
                    </button>
                </div>

                {dbExplorerOpen && (
                    <div className="space-y-3">
                        {/* Table Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {dbTables.map(t => (
                                <button key={t} onClick={() => loadTable(t)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                                        dbActiveTable === t ? 'bg-teal-600 text-white' : 'bg-white/60 text-gray-600 hover:bg-white border border-gray-200'
                                    }`}>
                                    <Table2 className="h-3 w-3 inline mr-1" />{t}
                                </button>
                            ))}
                            <button onClick={() => setDbCreatingTable(true)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors">
                                <Plus className="h-3 w-3 inline mr-1" />New Table
                            </button>
                            {dbTables.length === 0 && <p className="text-[10px] text-gray-400">Loading tables...</p>}
                        </div>

                        {/* Create Table Form */}
                        {dbCreatingTable && (
                            <div className="p-3 bg-teal-50/30 rounded-xl border border-teal-200 space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-700">Create Table (SQL)</h4>
                                <textarea
                                    className="w-full h-24 p-2 text-[11px] font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white"
                                    placeholder="CREATE TABLE my_table (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n)"
                                    value={dbCreateSql}
                                    onChange={e => setDbCreateSql(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleCreateTable} disabled={dbSaving || !dbCreateSql.trim()}
                                        className="flex-1 text-[10px] font-black uppercase text-white bg-teal-600 hover:bg-teal-700 py-1.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1">
                                        {dbSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Execute
                                    </button>
                                    <button onClick={() => { setDbCreatingTable(false); setDbCreateSql(''); }}
                                        className="px-3 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-white">Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Table Data */}
                        {dbActiveTable && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-bold text-gray-500">{dbRows.length} rows in <span className="text-teal-600">{dbActiveTable}</span></p>
                                        <button onClick={() => handleDropTable(dbActiveTable)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 flex items-center gap-1 ml-2 px-2 py-0.5 rounded hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                                            <Trash2 className="h-3 w-3" /> Drop Table
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => loadTable(dbActiveTable)} className="text-[9px] font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
                                            <RefreshCw className="h-3 w-3" /> Refresh
                                        </button>
                                        <button onClick={() => { setDbAddingRow(true); setDbNewRow({}); }} className="text-[9px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                                            <Plus className="h-3 w-3" /> Add Row
                                        </button>
                                    </div>
                                </div>

                                {dbLoading ? (
                                    <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-teal-600" /></div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {dbColumns.map((col: any) => (
                                                        <th key={col.Field} className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-gray-500 whitespace-nowrap">
                                                            {col.Field}
                                                            {col.Key === 'PRI' && <span className="ml-1 text-teal-500">PK</span>}
                                                            {col.Key === 'MUL' && <span className="ml-1 text-purple-400">FK</span>}
                                                        </th>
                                                    ))}
                                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* Add Row Form */}
                                                {dbAddingRow && (
                                                    <tr className="bg-teal-50/30">
                                                        {dbColumns.map((col: any) => (
                                                            <td key={col.Field} className="px-2 py-1.5">
                                                                {col.Extra === 'auto_increment' ? (
                                                                    <span className="text-[9px] text-gray-400 italic">auto</span>
                                                                ) : col.Default === 'current_timestamp()' ? (
                                                                    <span className="text-[9px] text-gray-400 italic">now</span>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        placeholder={col.Default || col.Field}
                                                                        className="w-full text-[10px] px-1.5 py-1 border border-gray-200 rounded bg-white focus:ring-1 focus:ring-teal-400 focus:outline-none"
                                                                        value={dbNewRow[col.Field] || ''}
                                                                        onChange={e => setDbNewRow({ ...dbNewRow, [col.Field]: e.target.value })}
                                                                    />
                                                                )}
                                                            </td>
                                                        ))}
                                                        <td className="px-2 py-1.5 text-right whitespace-nowrap">
                                                            <button onClick={handleDbAddRow} disabled={dbSaving}
                                                                className="text-[9px] font-bold text-teal-600 hover:text-teal-800 mr-2 disabled:opacity-40">
                                                                {dbSaving ? <Loader2 className="h-3 w-3 animate-spin inline" /> : <Save className="h-3 w-3 inline" />} Save
                                                            </button>
                                                            <button onClick={() => { setDbAddingRow(false); setDbNewRow({}); }}
                                                                className="text-[9px] font-bold text-gray-400 hover:text-gray-700">Cancel</button>
                                                        </td>
                                                    </tr>
                                                )}
                                                {/* Data Rows */}
                                                {dbRows.map((row, idx) => (
                                                    <tr key={idx} className={dbEditingRow === idx ? 'bg-amber-50/30' : 'hover:bg-gray-50/50'}>
                                                        {dbColumns.map((col: any) => (
                                                            <td key={col.Field} className="px-2 py-1.5">
                                                                {dbEditingRow === idx && col.Key !== 'PRI' ? (
                                                                    <input
                                                                        type="text"
                                                                        className="w-full text-[10px] px-1.5 py-1 border border-amber-300 rounded bg-white focus:ring-1 focus:ring-amber-400 focus:outline-none"
                                                                        value={dbEditValues[col.Field] ?? ''}
                                                                        onChange={e => setDbEditValues({ ...dbEditValues, [col.Field]: e.target.value })}
                                                                    />
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-800 font-medium block truncate max-w-[200px]" title={String(row[col.Field] ?? '')}>
                                                                        {row[col.Field] === null ? <span className="text-gray-300 italic">null</span> : String(row[col.Field])}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        ))}
                                                        <td className="px-2 py-1.5 text-right whitespace-nowrap">
                                                            {dbEditingRow === idx ? (
                                                                <>
                                                                    <button onClick={handleDbSave} disabled={dbSaving}
                                                                        className="text-[9px] font-bold text-teal-600 hover:text-teal-800 mr-2 disabled:opacity-40">
                                                                        {dbSaving ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Save'}
                                                                    </button>
                                                                    <button onClick={() => setDbEditingRow(null)} className="text-[9px] font-bold text-gray-400 hover:text-gray-700">Cancel</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => handleDbEdit(idx)} className="text-[9px] font-bold text-blue-500 hover:text-blue-700 mr-2">
                                                                        <Edit2 className="h-3 w-3 inline" />
                                                                    </button>
                                                                    <button onClick={() => handleDbDelete(row)} className="text-[9px] font-bold text-red-400 hover:text-red-700">
                                                                        <Trash2 className="h-3 w-3 inline" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {dbRows.length === 0 && (
                                                    <tr><td colSpan={dbColumns.length + 1} className="px-4 py-6 text-center text-[10px] font-bold text-gray-400">Empty table.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Guard Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">{confirmAction.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">Type <strong>{selectedUser?.email}</strong> to confirm.</p>
                        </div>
                        <div className="p-5 space-y-3">
                            <input type="text" placeholder="Type email to confirm..." value={confirmInput}
                                onChange={e => setConfirmInput(e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-400" />
                            <div className="flex gap-2">
                                <button disabled={confirmInput !== selectedUser?.email || togglingStatus}
                                    onClick={() => { confirmAction.action(); setConfirmAction(null); setConfirmInput(''); }}
                                    className="flex-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
                                    {togglingStatus ? 'Processing...' : 'Confirm'}
                                </button>
                                <button onClick={() => { setConfirmAction(null); setConfirmInput(''); }}
                                    className="px-4 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
