import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Activity, ShieldCheck, Clock, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portalApi } from '@/lib/portal-api';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';

export const DashboardContent = () => {
    const [stats, setStats] = useState({
        logins: 0,
        activities: 0,
        role: 'Pending...',
        lastActive: '---'
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
            try {
                // Fetch stats directly from MariaDB
                const userData = await portalApi.get('/v1/users', { uid: user.uid });

                if (userData && userData.length > 0) {
                    const dbUser = userData[0];
                    setStats(prev => ({
                        ...prev,
                        logins: dbUser.logins || 0,
                        role: dbUser.role || 'Member',
                        lastActive: dbUser.created_at ? new Date(dbUser.created_at).toLocaleDateString() : 'Active Now'
                    }));
                }

                // Fetch activities directly from MariaDB
                const activityData = await portalApi.get('/v1/activities', { uid: user.uid });
                setRecentActivities(activityData || []);
                setStats(prev => ({ ...prev, activities: (activityData || []).length }));

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
                <p className="text-gray-500">Please sign in to view your dashboard.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="pro-heading-dense">Dashboard</h1>
                <p className="pro-text-meta">Overview of your account and activities.</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-amber-800 text-sm font-medium">
                New Dashboard under construction. Members please use your old dashboard access.
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <div className="pro-card glass-panel shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <span className="pro-text-meta">Total Logins</span>
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 tracking-tighter">{stats.logins}</div>
                        <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Verified</p>
                    </div>
                </div>
                <div className="pro-card glass-panel shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <span className="pro-text-meta">Activities</span>
                        <Activity className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 tracking-tighter">{stats.activities}</div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sessions</p>
                    </div>
                </div>
                <div className="pro-card glass-panel shadow-sm leading-tight">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <span className="pro-text-meta">Role</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-gray-900 tracking-tight">{stats.role}</div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Access Level</p>
                    </div>
                </div>
                <div className="pro-card glass-panel shadow-sm leading-tight">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <span className="pro-text-meta">Last Active</span>
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-gray-900 tracking-tight">{stats.lastActive}</div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Timestamp</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-7">
                <div className="md:col-span-4 pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Recent Activity</h3>
                        <p className="pro-text-meta">Latest account actions</p>
                    </div>
                    <div className="space-y-2">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((act, index) => (
                                <div key={index} className="flex justify-between p-2.5 bg-white/40 rounded-xl border border-white/40 items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full bg-teal-50 flex items-center justify-center">
                                            <Activity className="h-3.5 w-3.5 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-900 leading-tight">{act.description}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">{new Date(act.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-teal-600 text-[8px] font-black uppercase tracking-widest text-white">
                                        {act.type}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] font-bold text-gray-400 py-4 text-center">No trace found.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-3 pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Sequence Pulse</h3>
                        <p className="pro-text-meta">Record an operational marker</p>
                    </div>
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-xs font-bold text-gray-700 bg-white/50 hover:bg-white rounded-xl h-10 transition-all border-teal-100"
                            onClick={async () => {
                                try {
                                    await portalApi.post('/v1/activities', {
                                        uid: user.uid,
                                        type: 'Check',
                                        description: `Pulse recorded at ${new Date().toLocaleTimeString()}`
                                    });
                                    // Refetch activities reactively — no page reload
                                    const freshActivities = await portalApi.get('/v1/activities', { uid: user.uid });
                                    setRecentActivities(freshActivities || []);
                                    setStats(prev => ({ ...prev, activities: (freshActivities || []).length }));
                                } catch (err) {
                                    console.error('Pulse Failed:', err);
                                    alert('Failed to record pulse.');
                                }
                            }}
                        >
                            <Plus className="mr-2 h-3.5 w-3.5 text-teal-600" /> Pulse
                        </Button>
                        <p className="text-[9px] text-gray-400 font-medium leading-tight">
                            Click to record a pulse in your operational sequence.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
