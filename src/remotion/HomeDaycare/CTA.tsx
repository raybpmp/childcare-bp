import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { KineticBackground } from './KineticBackground';
import { AnimatedText } from './AnimatedText';

export const CTA: React.FC<{ text: string }> = ({ text }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({
        frame,
        fps,
        config: { damping: 10, mass: 0.6, stiffness: 120 },
    });

    const pulse = interpolate(
        Math.sin(frame / 15),
        [-1, 1],
        [1, 1.05]
    );

    return (
        <AbsoluteFill style={{ backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' }}>
            <KineticBackground progress={1} pulse={pulse} />

            <div style={{
                transform: `scale(${entrance * pulse})`,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '40px 80px',
                borderRadius: 100,
                fontSize: 70,
                fontWeight: 'heavy',
                boxShadow: '0 0 50px rgba(37, 99, 235, 0.5)',
                border: '4px solid rgba(255,255,255,0.2)',
                zIndex: 10
            }}>
                {text}
            </div>

            <div style={{
                color: 'white',
                marginTop: 60,
                fontSize: 36,
                opacity: entrance,
                zIndex: 10
            }}>
                ChildCareBusinessPlan.com
            </div>

            <div style={{
                position: 'absolute',
                top: 100,
                opacity: interpolate(frame, [0, 20], [0, 0.6])
            }}>
                <AnimatedText titleText="Ready to Scale?" color="white" fontSize={40} />
            </div>
        </AbsoluteFill>
    );
};
