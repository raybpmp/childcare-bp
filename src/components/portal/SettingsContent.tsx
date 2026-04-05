import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

export const SettingsContent = () => {
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
                <p className="text-gray-500">Please sign in to view your settings.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div>
                <h1 className="pro-heading-dense">Settings</h1>
                <p className="pro-text-meta">Manage your account settings and preferences.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
                <div className="pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Appearance</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700">Collapse Sidebar</span>
                        <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    </div>
                </div>
                
                <div className="pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Notifications</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700">Enable Push</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    </div>
                </div>

                <div className="md:col-span-2 pro-card glass-panel shadow-sm border-red-100/50">
                    <div className="border-b border-red-50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Danger Zone</h3>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed max-w-sm">
                            Permanently wipe profile, settings, and history. This action is irreversible.
                        </p>
                        <Button variant="destructive" className="h-9 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg border-0">
                            Wipe Account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
