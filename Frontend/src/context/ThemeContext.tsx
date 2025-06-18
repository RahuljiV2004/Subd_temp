import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type ColorPalette = 'blue' | 'green' | 'purple' | 'red' | 'gray' | 'black';

interface ThemeContextType {
  colorPalette: ColorPalette;
  setColorPalette: (palette: ColorPalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorPalettes = {
  blue: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#93C5FD',
    background: '#0F172A',
    text: '#F8FAFC',
    border: '#334155',
  },
  green: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#6EE7B7',
    background: '#064E3B',
    text: '#F0FDF4',
    border: '#065F46',
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#C084FC',
    background: '#2E1065',
    text: '#F5F3FF',
    border: '#4C1D95',
  },
  red: {
    primary: '#EF4444',
    secondary: '#F97373',
    accent: '#FB9292',
    background: '#7F1D1D',
    text: '#FEF2F2',
    border: '#991B1B',
  },
  gray: {
    primary: '#64748B',
    secondary: '#94A3B8',
    accent: '#CBD5E1',
    background: '#1E293B',
    text: '#F8FAFC',
    border: '#334155',
  },
  black: {
    primary: '#1F2937',
    secondary: '#374151',
    accent: '#4B5563',
    background: '#0F172A',
    text: '#F3F4F6',
    border: '#334155',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorPalette, setColorPalette] = useState<ColorPalette>(() => {
    const savedPalette = localStorage.getItem('colorPalette');
    return (savedPalette as ColorPalette) || 'black';
  });

  useEffect(() => {
    localStorage.setItem('colorPalette', colorPalette);
    const root = document.documentElement;
    const palette = colorPalettes[colorPalette];
    
    // Set theme colors
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-background', palette.background);
    root.style.setProperty('--color-text', palette.text);
    root.style.setProperty('--color-border', palette.border);
    
    // Set gradient colors
    root.style.setProperty('--gradient-start', palette.primary);
    root.style.setProperty('--gradient-middle', palette.secondary);
    root.style.setProperty('--gradient-end', palette.accent);
  }, [colorPalette]);

  return (
    <ThemeContext.Provider value={{ colorPalette, setColorPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}