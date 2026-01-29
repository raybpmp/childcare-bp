import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from './AnimatedText';

export const Economics: React.FC<{ small: number; large: number }> = ({ small, large }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const growth = spring({
        frame,
        fps,
        config: { mass: 0.5, damping: 12 },
    });

    const barWidth = 180;
    const spacing = 100;
    const baseY = height * 0.7;

    const smallHeight = height * 0.25;
    const largeHeight = (large / small) * smallHeight;

    return (
        <AbsoluteFill style={{ backgroundColor: '#f8fafc' }}>
            {/* Grid Lines */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1 }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        position: 'absolute',
                        bottom: (height * 0.15 * i),
                        width: '100%',
                        height: 2,
                        backgroundColor: '#64748b'
                    }} />
                ))}
            </div>

            <div style={{ padding: 80, position: 'relative' }}>
                <AnimatedText titleText="Exponential Yield" fontSize={70} />
            </div>

            <div style={{ position: 'absolute', bottom: height * 0.3, width: '100%', display: 'flex', justifyContent: 'center', gap: spacing, alignItems: 'flex-end' }}>
                {/* Small Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: barWidth,
                        height: smallHeight * growth,
                        background: 'linear-gradient(to top, #94a3b8, #cbd5e1)',
                        borderRadius: '12px 12px 0 0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} />
                    <div style={{ marginTop: 20, fontSize: 32, fontWeight: 'bold', color: '#64748b' }}>6 Kids</div>
                    <div style={{ color: '#94a3b8', fontSize: 20 }}>Struggling</div>
                </div>

                {/* Large Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: barWidth,
                        height: largeHeight * growth,
                        background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                        borderRadius: '12px 12px 0 0',
                        boxShadow: '0 20px 25px -5px rgb(59 130 246 / 0.4)',
                        position: 'relative'
                    }}>
                        {/* Growth Label */}
                        <div style={{
                            position: 'absolute',
                            top: -60,
                            width: '100%',
                            textAlign: 'center',
                            color: '#2563eb',
                            fontWeight: 'bold',
                            fontSize: 28,
                            opacity: interpolate(growth, [0.8, 1], [0, 1])
                        }}>
                            +233%
                        </div>
                    </div>
                    <div style={{ marginTop: 20, fontSize: 32, fontWeight: 'bold', color: '#1e293b' }}>14 Kids</div>
                    <div style={{ color: '#2563eb', fontSize: 20 }}>Freedom</div>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: 100,
                width: '100%',
                textAlign: 'center',
                padding: '0 80px',
                opacity: interpolate(growth, [0.9, 1], [0, 1])
            }}>
                <div style={{ fontSize: 36, color: '#334155', fontStyle: 'italic', maxWidth: 800, margin: '0 auto' }}>
                    "Fixed costs stay flat. Your margin expands into the gap."
                </div>
            </div>
        </AbsoluteFill>
    );
};
