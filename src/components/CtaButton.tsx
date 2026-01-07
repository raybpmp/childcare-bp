import React from 'react';
import GlassPillButton from './ui/GlassPillButton';
import { openModal, type FunnelType } from '../store/modalStore';

interface CtaButtonProps extends React.ComponentProps<typeof GlassPillButton> {
    funnel?: FunnelType;
}

export default function CtaButton({ funnel = 'startup', onClick, ...props }: CtaButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        openModal(funnel);
        if (onClick) onClick(e);
    };

    return (
        <GlassPillButton onClick={handleClick} {...props} />
    );
}
