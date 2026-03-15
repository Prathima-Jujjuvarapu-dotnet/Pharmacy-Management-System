import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  theme$ = this.themeSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      this.setTheme(savedTheme);
    }
  }

  toggleTheme(): void {
    if (!this.isBrowser) return;

    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: string): void {
    if (!this.isBrowser) return;

    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  getCurrentTheme(): string {
    return this.themeSubject.value;
  }
}
