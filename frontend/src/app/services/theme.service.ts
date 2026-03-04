import { Injectable } from '@angular/core';

export type AppTheme = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'app_theme';

  constructor() {
    const t = this.getStoredTheme();
    if (t) this.applyTheme(t);
  }

  setTheme(theme: AppTheme) {
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
  }

  getTheme(): AppTheme {
    return (localStorage.getItem(this.storageKey) as AppTheme) || 'dark';
  }

  getStoredTheme(): AppTheme | null {
    const v = localStorage.getItem(this.storageKey);
    return (v === 'light' || v === 'dark' || v === 'auto') ? (v as AppTheme) : null;
  }

  applyTheme(theme: AppTheme) {
    const body = document.body;
    body.classList.remove('light');
    body.classList.remove('dark');

    if (theme === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      body.classList.add(theme);
    }
  }
}
