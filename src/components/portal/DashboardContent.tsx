import React, { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Activity, ShieldCheck, Clock, Plus, Trash2, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portalApi } from '@/lib/portal-api';
import { auth } from '@/lib/firebase-client';

export const DashboardContent = () => {
    const [stats, setStats] = useState({
        logins: 0,
        activities: 0,
        role: 'Member',
        lastActive: 'Never'
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch user record from the Universal Connector
                // Note: The connector automatically filters by the current user's UID
                let userData = await portalApi.get('/v1/users');
                
                // SYNC LOGIC: If user data is missing, create it now (first login)
                if (!userData || userData.length === 0) {
                    console.log('🆕 Syncing new user with MariaDB...');
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                        try {
                            await portalApi.post('/v1/users', {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                name: currentUser.displayName || 'User',
                                role: 'Member'
                            });
                            // Create welcome activity
                            await portalApi.post('/v1/activities', {
                                type: 'system',
                                description: 'Account registered'
                            });

                            // TRIGGER ONBOARDING EMAILS (Using existing EmailService infrastructure)
                            try {
                                await fetch('/api/portal/onboard', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        email: currentUser.email,
                                        name: currentUser.displayName || 'User'
                                    })
                                });
                            } catch (emailErr) {
                                console.error('Failed to trigger onboarding emails:', emailErr);
                            }

                            // Refresh userData after creation
                            userData = await portalApi.get('/v1/users');
                        } catch (syncErr) {
                            console.error('Failed to sync user data:', syncErr);
                        }
                    }
                }
                
                if (userData && userData.length > 0) {
                    const user = userData[0];
                    setStats(prev => ({
                        ...prev,
                        logins: user.logins || 1,
                        role: user.role || 'Member',
                        lastActive: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'
                    }));
                }

                // 2. Fetch activities
                const activityData = await portalApi.get('/v1/activities');
                setRecentActivities(activityData || []);
                setStats(prev => ({ ...prev, activities: (activityData || []).length }));

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Real-time data from your MariaDB portal partition.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Logins</CardTitle>
                            <Users className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.logins}</div>
                            <p className="text-xs text-gray-500">Since account creation</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Activities</CardTitle>
                            <Activity className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats.activities}</div>
                            <p className="text-xs text-gray-500">Recent actions recorded</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Role</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900">{stats.role}</div>
                            <p className="text-xs text-gray-500">Your account type</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Last Active</CardTitle>
                            <Clock className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900">{stats.lastActive}</div>
                            <p className="text-xs text-gray-500">Previous session</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="md:col-span-4">
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
                                        <div key={index} className="flex justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                                    <Activity className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{act.description}</p>
                                                    <p className="text-xs text-gray-500">{new Date(act.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-semibold text-white">
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

                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-gray-700 bg-white hover:bg-gray-50 font-medium"
                                onClick={async () => {
                                    await portalApi.post('/v1/activities', { type: 'manual', description: 'User triggered manual task' });
                                    window.location.reload();
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4 text-gray-500" /> Create Activity
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
};
