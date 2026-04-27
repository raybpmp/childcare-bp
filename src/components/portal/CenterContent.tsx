import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { portalApi } from '@/lib/portal-api';
import { AlertCircle, Building2, PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ACTIVE_CENTER_KEY = 'ccbp_active_center_id';

interface CenterRecord {
    id: number;
    owner_uid: string;
    name: string;
    slug: string;
    status: string;
    created_at: string;
}

interface CenterMember {
    id: number;
    center_id: number;
    uid: string;
    member_role: string;
    status: string;
    created_at: string;
}

export const CenterContent = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const [centers, setCenters] = useState<CenterRecord[]>([]);
    const [memberships, setMemberships] = useState<CenterMember[]>([]);
    const [activeCenterId, setActiveCenterId] = useState<number | null>(null);
    const [centerName, setCenterName] = useState('');
    const [centerSlug, setCenterSlug] = useState('');
    const [saving, setSaving] = useState(false);

    const loadCenters = async (uid: string) => {
        const memberRows = await portalApi.get('/v1/center_members', { uid });
        setMemberships(memberRows || []);

        if (!memberRows || memberRows.length === 0) {
            setCenters([]);
            setActiveCenterId(null);
            localStorage.removeItem(ACTIVE_CENTER_KEY);
            return;
        }

        const centerRows = await Promise.all(
            memberRows.map((member: CenterMember) =>
                portalApi.get('/v1/centers', { id: String(member.center_id) }).then((rows) => rows?.[0] || null)
            )
        );

        const validCenters = centerRows.filter((center): center is CenterRecord => Boolean(center));
        setCenters(validCenters);

        const stored = localStorage.getItem(ACTIVE_CENTER_KEY);
        const preferredId = stored ? Number(stored) : validCenters[0]?.id || null;
        if (preferredId) {
            setActiveCenterId(preferredId);
            localStorage.setItem(ACTIVE_CENTER_KEY, String(preferredId));
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
                await loadCenters(currentUser.uid);
            } catch (error) {
                console.error('Failed to load centers:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleCreateCenter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !centerName.trim() || !centerSlug.trim()) return;

        setSaving(true);
        try {
            await portalApi.post('/v1/centers', {
                owner_uid: user.uid,
                name: centerName.trim(),
                slug: centerSlug.trim().toLowerCase()
            });

            const created = await portalApi.get('/v1/centers', { slug: centerSlug.trim().toLowerCase() });
            const center = created?.[0];

            if (center) {
                await portalApi.post('/v1/center_members', {
                    center_id: center.id,
                    uid: user.uid,
                    member_role: 'Owner'
                });
            }

            setCenterName('');
            setCenterSlug('');
            await loadCenters(user.uid);
        } catch (error) {
            console.error('Center creation failed:', error);
            alert('Failed to create center.');
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
                <p className="text-gray-500">Please sign in to manage your center.</p>
                <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div>
                <h1 className="pro-heading-dense">Center</h1>
                <p className="pro-text-meta">Create and manage the daycare business your portal data belongs to.</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2 pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Your Centers</h3>
                        <p className="pro-text-meta">Select the operational entity this portal should work inside.</p>
                    </div>

                    {centers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/40 p-6 text-center space-y-2">
                            <Building2 className="h-8 w-8 text-teal-600 mx-auto" />
                            <p className="text-sm font-black text-gray-900">No center created yet</p>
                            <p className="text-[11px] text-gray-500">Start by creating the daycare business that will own applications, shared records, and members.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {centers.map((center) => {
                                const membership = memberships.find((row) => row.center_id === center.id);
                                const isActive = activeCenterId === center.id;

                                return (
                                    <button
                                        key={center.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveCenterId(center.id);
                                            localStorage.setItem(ACTIVE_CENTER_KEY, String(center.id));
                                        }}
                                        className={`w-full text-left rounded-xl border p-3 transition-colors ${
                                            isActive
                                                ? 'border-teal-500 bg-teal-50/80'
                                                : 'border-gray-100 bg-white/50 hover:bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{center.name}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-400">{center.slug}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">{membership?.member_role || 'Member'}</p>
                                                <p className="text-[10px] text-gray-400">{center.status}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pro-card glass-panel shadow-sm">
                    <div className="border-b border-gray-100/50 pb-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Create Center</h3>
                        <p className="pro-text-meta">Create the shared business container first.</p>
                    </div>

                    <form className="space-y-3" onSubmit={handleCreateCenter}>
                        <div className="space-y-2">
                            <Label htmlFor="center-name">Center Name</Label>
                            <Input
                                id="center-name"
                                value={centerName}
                                onChange={(e) => setCenterName(e.target.value)}
                                placeholder="Bright Start Academy"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="center-slug">Center Slug</Label>
                            <Input
                                id="center-slug"
                                value={centerSlug}
                                onChange={(e) => setCenterSlug(e.target.value)}
                                placeholder="bright-start-academy"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={saving}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {saving ? 'Creating...' : 'Create Center'}
                        </Button>
                    </form>

                    <div className="mt-4 rounded-xl bg-white/60 border border-gray-100 p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Workflow</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            First create the center. After that, applications and future members connect to the active center instead of living only under one user.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
