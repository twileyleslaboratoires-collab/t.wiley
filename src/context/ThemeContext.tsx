'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeSettings } from '@/types';

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#026ac8',
  secondaryColor: '#0f172a',
  buttonColor: '#16a34a',
  accentColor: '#d97706',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
});

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeSettings;
}) {
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme || defaultTheme);

  useEffect(() => {
    if (!initialTheme) {
      fetch('/api/theme')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.primaryColor) {
            setTheme(data);
          }
        })
        .catch(() => {});
    }
  }, [initialTheme]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.primaryColor || '#026ac8');
      root.style.setProperty('--color-secondary', theme.secondaryColor || '#0f172a');
      root.style.setProperty('--color-btn', theme.buttonColor || '#16a34a');
      root.style.setProperty('--color-accent', theme.accentColor || '#d97706');
    }
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

