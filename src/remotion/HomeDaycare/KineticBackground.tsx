import { useState } from "react";
import { random, useVideoConfig } from "remotion";

const getCircumferenceOfArc = (rx: number, ry: number) => {
    return Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);
};

const Arc: React.FC<{
    progress: number;
    rotation: number;
    rotateProgress: number;
    color1: string;
    color2: string;
}> = ({ progress, rotation, rotateProgress, color1, color2 }) => {
    const { width, height } = useVideoConfig();
    const [gradientId] = useState(() => String(random(null)));

    const rx = width * 0.15;
    const ry = height * 0.2;
    const cx = width / 2;
    const cy = height / 2;
    const arcLength = getCircumferenceOfArc(rx, ry);
    const strokeWidth = 20;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{
                position: "absolute",
                transform: `rotate(${rotation * rotateProgress}deg)`,
                opacity: 0.3,
            }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color1} />
                    <stop offset="100%" stopColor={color2} />
                </linearGradient>
            </defs>
            <ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeDasharray={arcLength}
                strokeDashoffset={arcLength - arcLength * progress}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

export const KineticBackground: React.FC<{
    progress: number;
    pulse: number;
}> = ({ progress, pulse }) => {
    return (
        <>
            <Arc
                progress={progress}
                rotation={30}
                rotateProgress={pulse}
                color1="#3b82f6"
                color2="#2563eb"
            />
            <Arc
                progress={progress}
                rotation={90}
                rotateProgress={pulse}
                color1="#10b981"
                color2="#059669"
            />
            <Arc
                progress={progress}
                rotation={-30}
                rotateProgress={pulse}
                color1="#3b82f6"
                color2="#10b981"
            />
        </>
    );
};
