import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from './AnimatedText';

export const Comparison: React.FC<{ small: number; large: number }> = ({ small, large }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const gateProgress = spring({
        frame,
        fps,
        config: { stiffness: 60, damping: 15 },
    });

    const numberSpring = spring({
        frame: frame - 20,
        fps,
        config: { mass: 0.8, stiffness: 200, damping: 12 },
    });

    return (
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
            {/* Left Gate */}
            <div style={{
                flex: 1,
                backgroundColor: '#1e293b',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `translateX(${interpolate(gateProgress, [0, 1], [-100, 0])}%)`,
                borderRight: '4px solid #334155'
            }}>
                <div style={{ color: '#94a3b8', fontSize: 40, marginBottom: 20 }}>Small License</div>
                <div style={{
                    color: 'white',
                    fontSize: 180,
                    fontWeight: 'heavy',
                    transform: `scale(${numberSpring})`,
                    textShadow: '0 0 40px rgba(0,0,0,0.5)'
                }}>
                    {small}
                </div>
                <div style={{
                    color: '#ef4444',
                    fontSize: 30,
                    fontWeight: 'bold',
                    marginTop: 20,
                    opacity: interpolate(numberSpring, [0, 1], [0, 1])
                }}>
                    REVENUE CAP
                </div>
            </div>

            {/* Right Gate */}
            <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `translateX(${interpolate(gateProgress, [0, 1], [100, 0])}%)`
            }}>
                <div style={{ color: '#94a3b8', fontSize: 40, marginBottom: 20 }}>Large License</div>
                <div style={{
                    color: '#22c55e',
                    fontSize: 220,
                    fontWeight: 'heavy',
                    transform: `scale(${interpolate(numberSpring, [0, 1], [0, 1.2])})`,
                    textShadow: '0 0 60px rgba(34, 197, 94, 0.3)'
                }}>
                    {large}
                </div>
                <div style={{
                    color: '#22c55e',
                    fontSize: 30,
                    fontWeight: 'bold',
                    marginTop: 20,
                    opacity: interpolate(numberSpring, [0, 1], [0, 1])
                }}>
                    PURE PROFIT
                </div>
            </div>

            {/* Overlay Text */}
            <AbsoluteFill style={{
                justifyContent: 'flex-end',
                paddingBottom: 100,
                pointerEvents: 'none'
            }}>
                <AnimatedText titleText="Double the Scale" color="white" fontSize={60} delayOffset={30} />
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
