// see https://github.com/davipon/svelte-component-test-recipes#setup

import '@testing-library/jest-dom/vitest';
import * as environment from '$app/environment';
import * as navigation from '$app/navigation';
import * as stores from '$app/stores';
import { vi } from 'vitest';
import { readable } from 'svelte/store';
import type { Navigation, Page } from '@sveltejs/kit';

// Mock SvelteKit runtime module $app/environment
vi.mock('$app/environment', (): typeof environment => ({
  browser: false,
  dev: true,
  building: false,
  version: 'any'
}));

// Mock SvelteKit runtime module $app/navigation
vi.mock('$app/navigation', (): typeof navigation => ({
  afterNavigate: () => {
    return;
  },
  beforeNavigate: () => {
    return;
  },
  disableScrollHandling: () => {
    return;
  },
  goto: () => Promise.resolve(),
  invalidate: () => Promise.resolve(),
  invalidateAll: () => Promise.resolve(),
  preloadData: () => Promise.resolve(),
  preloadCode: () => Promise.resolve()
}));

// Mock SvelteKit runtime module $app/stores
vi.mock('$app/stores', (): typeof stores => {
  const getStores: typeof stores.getStores = () => {
    const navigating = readable<Navigation | null>(null);
    const page = readable<Page>({
      url: new URL('http://localhost'),
      params: {},
      route: {
        id: null
      },
      status: 200,
      error: null,
      data: {},
      form: undefined
    });
    const updated = { subscribe: readable(false).subscribe, check: async () => false };

    return { navigating, page, updated };
  };

  const page: typeof stores.page = {
    subscribe(fn) {
      return getStores().page.subscribe(fn);
    }
  };
  const navigating: typeof stores.navigating = {
    subscribe(fn) {
      return getStores().navigating.subscribe(fn);
    }
  };
  const updated: typeof stores.updated = {
    subscribe(fn) {
      return getStores().updated.subscribe(fn);
    },
    check: async () => false
  };

  return {
    getStores,
    navigating,
    page,
    updated
  };
});

// TODO: jsdom (vitest runtime) doesn't support HTMLDialogElement yet,
// so this code is to mock HTMLDialogElement functions for tests to pass
// see https://github.com/jsdom/jsdom/issues/3294
// NEED to mock the 'open' attribute bc jsdom / jest-dom require this attribute
// to match the semantic visibility status
HTMLDialogElement.prototype.show = vi.fn(function mock(this: HTMLDialogElement) {
  this.open = true;
});
HTMLDialogElement.prototype.showModal = vi.fn(function mock(this: HTMLDialogElement) {
  this.open = true;
});
HTMLDialogElement.prototype.close = vi.fn(function mock(this: HTMLDialogElement) {
  this.open = false;
});
