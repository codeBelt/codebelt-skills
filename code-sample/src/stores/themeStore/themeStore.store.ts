'use client';

import {createClassyStore, type Snapshot} from '@codebelt/classy-store';
import {useStore} from '@codebelt/classy-store/react';
import {persist} from '@codebelt/classy-store/utils';
import type {Theme} from './themeStore.types';

class ThemeStore {
  theme: Theme = 'system';

  setTheme(theme: Theme): void {
    this.theme = theme;
  }
}

export const themeStore = createClassyStore(new ThemeStore());

const themeStorePersistence = persist(themeStore, {
  name: 'theme-storage',
  properties: ['theme'],
});

export function useThemeStore<TSelected>(selector: (store: Snapshot<ThemeStore>) => TSelected): TSelected {
  return useStore(themeStore, selector);
}
