import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

export const AnalyticsContent = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
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
                <p className="text-gray-500">Please sign in to view your analytics.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div>
                <h1 className="pro-heading-dense">Analytics Dashboard</h1>
                <p className="pro-text-meta">View your activity statistics and insights.</p>
            </div>
            
            <div className="pro-card glass-panel shadow-sm flex items-center justify-center min-h-[30vh]">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">module under construction</p>
            </div>
        </div>
    );
};
