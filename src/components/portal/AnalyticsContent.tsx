import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

export const AnalyticsContent = () => {
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
                <p className="text-gray-500">Please sign in to view your analytics.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-500">View your activity statistics and insights.</p>
            </div>
            
            <Card>
                <CardContent className="flex items-center justify-center min-h-[40vh] pt-6">
                    <p className="text-gray-500 font-medium text-lg">Analytics module under construction</p>
                </CardContent>
            </Card>
        </div>
    );
};
