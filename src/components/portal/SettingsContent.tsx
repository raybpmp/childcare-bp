import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

export const SettingsContent = () => {
    return (
        <AuthGuard>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage your account settings and preferences.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Collapse Sidebar</span>
                                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Manage notification preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Enable Notifications</span>
                                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Data Management</CardTitle>
                            <CardDescription>Manage your stored data</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-700 mb-4">This will permanently delete all your profile data, settings, and activity history.</p>
                            <Button variant="destructive" className="w-full">
                                Clear All Data
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
};
