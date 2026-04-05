import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

export const ProfileContent = () => {
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
                <p className="text-gray-500">Please sign in to view your profile.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Profile</h1>
                <p className="text-gray-500">Manage your profile information and preferences.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <span>{(user.displayName || user.email || "U").charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900">{user.displayName || "Portal User"}</h2>
                            <p className="text-sm text-gray-500">Member</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Full Name</span>
                            <span className="text-sm font-medium text-gray-900">{user.displayName || "Not set"}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Email</span>
                            <span className="text-sm font-medium text-gray-900">{user.email || "Not set"}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Role</span>
                            <span className="text-sm font-medium text-gray-900">Member</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
