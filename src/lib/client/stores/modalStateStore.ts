// where modal state will be stored
import { writable } from 'svelte/store';

export const newFlowModalOpen = writable(false);
export const addTermsModalOpen = writable(false);
export const deleteTermsModalOpen = writable(false);
export const editFlowPropertiesModalOpen = writable(false);
