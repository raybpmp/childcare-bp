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
        role: 'Member',
        lastActive: 'Never'
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
                // Background fetch stats from MariaDB
                let userData = await portalApi.get('/v1/users', { uid: user.uid });
                
                // NO BLOCKING SYNC: Only update stats if user exists in DB
                if (userData && userData.length > 0) {
                    const dbUser = userData[0];
                    setStats(prev => ({
                        ...prev,
                        logins: dbUser.logins || 1,
                        role: dbUser.role || 'Member',
                        lastActive: dbUser.created_at ? new Date(dbUser.created_at).toLocaleDateString() : 'Today'
                    }));
                }

                // Fetch activities separately
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview of your account and activities.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-white/20 shadow-sm bg-white/50 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Logins</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.logins}</div>
                        <p className="text-xs text-gray-500 text-teal-600 font-medium">Verified Account</p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 shadow-sm bg-white/50 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Activities</CardTitle>
                        <Activity className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.activities}</div>
                        <p className="text-xs text-gray-500">Recorded sessions</p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 shadow-sm bg-white/50 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Role</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-gray-900">{stats.role}</div>
                        <p className="text-xs text-gray-500">Portal Access Level</p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 shadow-sm bg-white/50 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Last Active</CardTitle>
                        <Clock className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-gray-900">{stats.lastActive}</div>
                        <p className="text-xs text-gray-500">System timestamp</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 border-white/20 shadow-sm bg-white/50 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest actions and events</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((act, index) => (
                                    <div key={index} className="flex justify-between p-4 bg-white/40 rounded-xl border border-white/40 items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
                                                <Activity className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{act.description}</p>
                                                <p className="text-xs text-gray-500">{new Date(act.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                                            {act.type}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 py-4 text-center">No recent activities found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 border-white/20 shadow-sm bg-white/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-gray-700 bg-white/50 hover:bg-white font-medium rounded-xl h-12 transition-all"
                            onClick={async () => {
                                await portalApi.post('/v1/activities', { uid: user.uid, type: 'manual', description: 'User triggered manual task' });
                                window.location.reload();
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4 text-teal-600" /> Create Activity
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
