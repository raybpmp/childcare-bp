import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const ProfileContent = () => {
    return (
        <AuthGuard>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Profile</h1>
                    <p className="text-gray-500">Manage your profile information and preferences.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
                            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                U
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-gray-900">Admin User</h2>
                                <p className="text-sm text-gray-500">Administrator</p>
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
                                <span className="text-sm font-medium text-gray-900">Admin User</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Email</span>
                                <span className="text-sm font-medium text-gray-900">admin@example.com</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Role</span>
                                <span className="text-sm font-medium text-gray-900">Administrator</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
};
