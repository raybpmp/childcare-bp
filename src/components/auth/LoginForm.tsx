import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, googleProvider } from '@/lib/firebase-client';
import { portalApi } from '@/lib/portal-api';

const CLAIMS_API_URL = import.meta.env.PUBLIC_CLAIMS_API_URL || 'https://portal.childcarebusinessplan.com/claims-api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
    initialMode?: 'login' | 'signup';
}

export const LoginForm = ({ initialMode = 'login' }: LoginFormProps) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        // Initial state is controlled locally by the toggle button/props
    }, []);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                // NON-BLOCKING: Log session in background
                portalApi.post('/v1/login_history', { 
                    uid: userCredential.user.uid, 
                    user_agent: navigator.userAgent, 
                    login_method: 'email' 
                }).catch(e => console.error('Silent log failure:', e));

                // Force-refresh token to pick up latest Custom Claims
                await userCredential.user.getIdToken(true);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // AUTHORITATIVE REGISTRATION
                await portalApi.post('/v1/users', {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    name: email.split('@')[0],
                    tier_id: 3 // Default to Free
                });

                // Set default Custom Claims (stamp)
                fetch(`${CLAIMS_API_URL}/v1/set-claims`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: userCredential.user.uid, role: 'Member', tierId: 3 })
                }).catch(e => console.error('Claims stamp failed:', e));

                await userCredential.user.getIdToken(true);
            }
            // SUCCESS: Redirect to dashboard
            window.location.href = '/portal';
        } catch (err: any) {
            setError(err.message || `Failed to ${isLogin ? 'login' : 'sign up'}`);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            
            // NON-BLOCKING: Check/Create user and log history
            // We don't await these to prevent handshake hangs
            const handleSync = async () => {
                const dbCheck = await portalApi.get('/v1/users', { uid: result.user.uid });
                if (!dbCheck || dbCheck.length === 0) {
                    await portalApi.post('/v1/users', {
                        uid: result.user.uid,
                        email: result.user.email,
                        name: result.user.displayName,
                        tier_id: 3
                    });
                    
                    fetch(`${CLAIMS_API_URL}/v1/set-claims`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: result.user.uid, role: 'Member', tierId: 3 })
                    }).catch(e => {});
                }
                
                portalApi.post('/v1/login_history', { 
                    uid: result.user.uid, 
                    user_agent: navigator.userAgent, 
                    login_method: 'google' 
                }).catch(e => {});
            };

            handleSync().catch(e => console.error('Google account sync failed:', e));

            // Force-refresh token to pick up Custom Claims
            await result.user.getIdToken(true);
            
            // SUCCESS: Immediate redirect
            window.location.href = '/portal';
        } catch (err: any) {
            setError(err.message || 'Failed to authenticate with Google');
            setLoading(false);
        }
    };


    return (
        <Card className="w-full max-w-md mx-auto shadow-xl bg-white/80 backdrop-blur-md border-white/20">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                    {isLogin
                        ? 'Enter your email and password to access your portal'
                        : 'Sign up to start your childcare business journey'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 text-sm font-medium text-red-600 bg-red-50 py-2 px-3 rounded-md border border-red-200">
                        {error}
                    </div>
                )}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white/50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500 drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm">
                    {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-1 text-teal-600 hover:text-teal-700 font-semibold"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>
            </CardFooter>
        </Card>
    );
};
