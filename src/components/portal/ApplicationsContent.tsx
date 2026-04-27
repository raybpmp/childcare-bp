import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { portalApi } from '@/lib/portal-api';
import { AlertCircle, ClipboardList, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ACTIVE_CENTER_KEY = 'ccbp_active_center_id';

interface ApplicationType {
    id: number;
    slug: string;
    name: string;
    description: string;
    status: string;
}

interface CenterApplication {
    id: number;
    center_id: number;
    application_type_id: number;
    created_by_uid: string;
    name: string;
    status: string;
    application_data: string | null;
    submitted_at: string | null;
    created_at: string;
}

interface CenterRecord {
    id: number;
    name: string;
    slug: string;
}

export const ApplicationsContent = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const [centers, setCenters] = useState<CenterRecord[]>([]);
    const [activeCenterId, setActiveCenterId] = useState<number | null>(null);
    const [applications, setApplications] = useState<CenterApplication[]>([]);
    const [types, setTypes] = useState<ApplicationType[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
    const [applicationName, setApplicationName] = useState('');
    const [saving, setSaving] = useState(false);

    const loadCenterContext = async (uid: string) => {
        const memberships = await portalApi.get('/v1/center_members', { uid });
        if (!memberships || memberships.length === 0) {
            setCenters([]);
            setActiveCenterId(null);
            setApplications([]);
            return;
        }

        const centerRows = await Promise.all(
            memberships.map((member: { center_id: number }) =>
                portalApi.get('/v1/centers', { id: String(member.center_id) }).then((rows) => rows?.[0] || null)
            )
        );

        const validCenters = centerRows.filter((center): center is CenterRecord => Boolean(center));
        setCenters(validCenters);

        const stored = localStorage.getItem(ACTIVE_CENTER_KEY);
        const currentCenterId = stored ? Number(stored) : validCenters[0]?.id || null;

        if (currentCenterId) {
            setActiveCenterId(currentCenterId);
            localStorage.setItem(ACTIVE_CENTER_KEY, String(currentCenterId));
            const appRows = await portalApi.get('/v1/center_applications', { center_id: String(currentCenterId) });
            setApplications(appRows || []);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const [typeRows] = await Promise.all([
                    portalApi.get('/v1/application_types')
                ]);
                setTypes(typeRows || []);
                await loadCenterContext(currentUser.uid);
            } catch (error) {
                console.error('Failed to load applications context:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleCreateApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !activeCenterId || !selectedTypeId || !applicationName.trim()) return;

        setSaving(true);
        try {
            await portalApi.post('/v1/center_applications', {
                center_id: activeCenterId,
                application_type_id: selectedTypeId,
                created_by_uid: user.uid,
                name: applicationName.trim(),
                status: 'draft',
                application_data: JSON.stringify({})
            });

            const fresh = await portalApi.get('/v1/center_applications', { center_id: String(activeCenterId) });
            setApplications(fresh || []);
            setApplicationName('');
            setSelectedTypeId('');
        } catch (error) {
            console.error('Application creation failed:', error);
            alert('Failed to create application.');
        } finally {
            setSaving(false);
        }
    };

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
                <p className="text-gray-500">Please sign in to manage applications.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    if (centers.length === 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-4">
                <div>
                    <h1 className="pro-heading-dense">Applications</h1>
                    <p className="pro-text-meta">Applications are owned by centers, not only by individual users.</p>
                </div>

                <div className="pro-card glass-panel shadow-sm text-center space-y-3 py-10">
                    <ClipboardList className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm font-black text-gray-900">Create a center first</p>
                    <p className="text-[11px] text-gray-500">Once a center exists, you can create enrollment and other application workflows under it.</p>
                    <a href="/portal/center" className="text-sm font-bold text-teal-600 hover:underline">Go to Center Setup</a>
                </div>
            </div>
        );
    }

    const activeCenter = centers.find((center) => center.id === activeCenterId) || centers[0];
    const typedApplications = applications.map((app) => ({
        ...app,
        type: types.find((type) => type.id === app.application_type_id)
    }));

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div>
                <h1 className="pro-heading-dense">Applications</h1>
                <p className="pro-text-meta">Create and manage center-owned application workflows.</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2 pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Center Applications</h3>
                        <p className="pro-text-meta">{activeCenter?.name || 'Selected center'} is the owner of these records.</p>
                    </div>

                    {typedApplications.length === 0 ? (
                        <p className="text-[11px] text-gray-500 py-6 text-center">No applications created yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {typedApplications.map((application) => (
                                <div key={application.id} className="rounded-xl border border-gray-100 bg-white/50 p-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{application.name}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                            {application.type?.name || 'Application'} • {application.type?.slug || 'custom'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">{application.status}</p>
                                        <p className="text-[10px] text-gray-400">{new Date(application.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">New Application</h3>
                        <p className="pro-text-meta">Create under the currently active center.</p>
                    </div>

                    <form className="space-y-3" onSubmit={handleCreateApplication}>
                        <div className="space-y-2">
                            <Label htmlFor="application-name">Application Name</Label>
                            <Input
                                id="application-name"
                                value={applicationName}
                                onChange={(e) => setApplicationName(e.target.value)}
                                placeholder="2026 Fall Enrollment"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="application-type">Application Type</Label>
                            <select
                                id="application-type"
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                value={selectedTypeId}
                                onChange={(e) => setSelectedTypeId(e.target.value ? Number(e.target.value) : '')}
                                required
                            >
                                <option value="">Select a type</option>
                                {types.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={saving}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {saving ? 'Creating...' : 'Create Application'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
