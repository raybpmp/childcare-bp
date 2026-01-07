import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isModalOpen, selectedFunnel, closeModal, type FunnelType } from '../store/modalStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EmailModal() {
    const $isOpen = useStore(isModalOpen);
    const $funnel = useStore(selectedFunnel);
    const [email, setEmail] = useState('');
    const [activeTab, setActiveTab] = useState<FunnelType>($funnel);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    useEffect(() => {
        if ($isOpen) setActiveTab($funnel);
    }, [$isOpen, $funnel]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate API call (Firebase integration to be added later)
        setTimeout(() => {
            console.log('Lead submitted:', { email, funnel: activeTab });
            setStatus('success');
            setTimeout(() => {
                closeModal();
                setStatus('idle');
                setEmail('');
                window.location.href = `/thank-you?funnel=${activeTab}`;
            }, 1500);
        }, 1000);
    };

    return (
        <Dialog open={$isOpen} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="glass-panel sm:max-w-lg rounded-3xl border-white/40">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Get Your Free {activeTab === 'startup' ? 'Startup' : 'Growth'} Toolkit
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        Enter your email to unlock the {activeTab === 'startup' ? 'financial calculator & launch checklist' : 'staffing model & expansion guide'}.
                    </DialogDescription>
                </DialogHeader>

                {/* Funnel Toggle */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FunnelType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 rounded-full p-1">
                        <TabsTrigger value="startup" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">
                            Start a Daycare
                        </TabsTrigger>
                        <TabsTrigger value="consulting" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
                            Own a Daycare
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            type="email"
                            id="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="rounded-xl border-gray-200 bg-white/50 focus:bg-white"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 h-12"
                    >
                        {status === 'loading' ? (
                            'Processing...'
                        ) : status === 'success' ? (
                            'Check your inbox!'
                        ) : (
                            `Get My ${activeTab === 'startup' ? 'Startup' : 'Growth'} Toolkit`
                        )}
                    </Button>

                    <p className="text-xs text-center text-gray-400">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}
