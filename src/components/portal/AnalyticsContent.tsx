import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent } from "@/components/ui/card";

export const AnalyticsContent = () => {
    return (
        <AuthGuard>
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
        </AuthGuard>
    );
};
