import { atom } from 'nanostores';

export type FunnelType = 'startup' | 'consulting';

export const isModalOpen = atom(false);
export const selectedFunnel = atom<FunnelType>('startup');

export function openModal(funnel: FunnelType = 'startup') {
    selectedFunnel.set(funnel);
    isModalOpen.set(true);
}

export function closeModal() {
    isModalOpen.set(false);
}
