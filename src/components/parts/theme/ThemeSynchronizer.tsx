'use client';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

export default function ThemeSynchronizer() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('theme-light');
      body.classList.remove('theme-dark');
    } else {
      body.classList.add('theme-dark');
      body.classList.remove('theme-light');
    }
  }, [theme]);

  return null; // Logic only, no UI
}