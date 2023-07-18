import type { Writable } from 'svelte/store';

// modal action to bind modal store state to modal open state
export function modal(dialog: HTMLDialogElement, modalStateStore: Writable<boolean>) {
  modalStateStore.subscribe((state) => {
    if (state) {
      dialog.showModal();
    } else {
      dialog.close();
    }

    // need to do this bc hidden dialog is still "visible" via CSS
    // and this causes Playwright tests to fail
    dialog.style.visibility = state ? 'visible' : 'hidden';
  });
}
