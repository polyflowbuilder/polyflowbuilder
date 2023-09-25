// where modal state will be stored
import { writable } from 'svelte/store';

// functional Flows modals
export const newFlowModalOpen = writable(false);
export const addTermsModalOpen = writable(false);
export const deleteTermsModalOpen = writable(false);
export const editFlowPropertiesModalOpen = writable(false);
export const customizeCoursesModalOpen = writable(false);

// information Flows modals
export const welcomeModalOpen = writable(false);
