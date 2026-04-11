import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';
import { portalApi } from '@/lib/portal-api';

export const ProfileContent = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [dbRole, setDbRole] = useState('...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                try {
                    const dbResponse = await portalApi.get('/v1/users', { uid: currentUser.uid });
                    if (dbResponse && dbResponse.length > 0) {
                        setDbRole(dbResponse[0].role || 'Member');
                    }
                } catch (err) {
                    console.error('Profile DB Fetch Failed:', err);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }


    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
                <p className="text-gray-500">Please sign in to view your profile.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div>
                <h1 className="pro-heading-dense">User Profile</h1>
                <p className="pro-text-meta">Manage your account and database profile.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-1 pro-card glass-panel shadow-sm">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-xl font-black overflow-hidden shadow-teal-900/10 shadow-lg">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <span>{(user.displayName || user.email || "U").charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="text-center">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">{user.displayName || "Portal User"}</h2>
                            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">{dbRole}</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Personal Details</h3>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between py-1.5 border-b border-gray-100/30">
                            <span className="pro-text-meta uppercase font-bold text-gray-400">Full Name</span>
                            <span className="text-[11px] font-black text-gray-900">{user.displayName || "Not set"}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100/30">
                            <span className="pro-text-meta uppercase font-bold text-gray-400">Email</span>
                            <span className="text-[11px] font-black text-gray-900">{user.email || "Not set"}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100/30">
                            <span className="pro-text-meta uppercase font-bold text-gray-400">Security</span>
                            <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest">Authenticator Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
