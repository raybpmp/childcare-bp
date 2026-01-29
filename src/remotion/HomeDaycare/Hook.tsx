import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from './AnimatedText';
import { KineticBackground } from './KineticBackground';

export const Hook: React.FC<{ titleText: string }> = ({ titleText }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const bgProgress = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const pulse = interpolate(
        Math.sin(frame / 20),
        [-1, 1],
        [0.9, 1.1]
    );

    return (
        <AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
            <KineticBackground progress={bgProgress} pulse={pulse} />
            <div style={{ position: 'relative', zIndex: 10 }}>
                <AnimatedText titleText={titleText} fontSize={100} />
                <div style={{
                    marginTop: 40,
                    textAlign: 'center',
                    opacity: interpolate(frame, [45, 60], [0, 1])
                }}>
                    <AnimatedText titleText="The Scale Trap" color="#ef4444" fontSize={50} delayOffset={45} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
