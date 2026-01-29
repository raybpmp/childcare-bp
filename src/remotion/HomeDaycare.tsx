import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { homeDaycareSchema } from './HomeDaycare/Constants';
import { Hook } from './HomeDaycare/Hook';
import { Comparison } from './HomeDaycare/Comparison';
import { Economics } from './HomeDaycare/Economics';
import { CTA } from './HomeDaycare/CTA';

export const HomeDaycare: React.FC<z.infer<typeof homeDaycareSchema>> = ({
    titleText,
    smallEnrollment,
    largeEnrollment,
    ctaText,
}) => {
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
            <Sequence from={0} durationInFrames={fps * 3}>
                <Hook titleText={titleText} />
            </Sequence>
            <Sequence from={fps * 3} durationInFrames={fps * 4}>
                <Comparison small={smallEnrollment} large={largeEnrollment} />
            </Sequence>
            <Sequence from={fps * 7} durationInFrames={fps * 5}>
                <Economics small={smallEnrollment} large={largeEnrollment} />
            </Sequence>
            <Sequence from={fps * 12} durationInFrames={fps * 3}>
                <CTA text={ctaText} />
            </Sequence>
        </AbsoluteFill>
    );
};
