'use client';

import {createClassyStore} from '@codebelt/classy-store';
import {createStoreHook} from '@codebelt/classy-store/react';
import {persist} from '@codebelt/classy-store/utils';
import type {Theme} from './themeStore.types';

class ThemeStore {
  theme: Theme = 'system';

  setTheme(theme: Theme): void {
    this.theme = theme;
  }
}

export const themeStore = createClassyStore(new ThemeStore());

persist(themeStore, {
  name: 'theme-storage',
  properties: ['theme'],
});

export const useThemeStore = createStoreHook(themeStore);
