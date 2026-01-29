import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedText: React.FC<{
    titleText: string;
    color?: string;
    fontSize?: number;
    delayOffset?: number;
}> = ({ titleText, color = "#1e293b", fontSize = 80, delayOffset = 0 }) => {
    const videoConfig = useVideoConfig();
    const frame = useCurrentFrame();

    const words = titleText.split(" ");

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
            textAlign: 'center',
            padding: '0 40px'
        }}>
            {words.map((t, i) => {
                const delay = (i * 5) + delayOffset;

                const scale = spring({
                    fps: videoConfig.fps,
                    frame: frame - delay,
                    config: {
                        damping: 20,
                        mass: 0.5,
                        stiffness: 150
                    },
                });

                const opacity = spring({
                    fps: videoConfig.fps,
                    frame: frame - delay,
                    config: {
                        damping: 20
                    },
                });

                return (
                    <span
                        key={`${t}-${i}`}
                        style={{
                            color,
                            fontSize,
                            fontWeight: "bold",
                            display: "inline-block",
                            transform: `scale(${scale})`,
                            opacity,
                        }}
                    >
                        {t}
                    </span>
                );
            })}
        </div>
    );
};
