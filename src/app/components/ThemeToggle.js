'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  // Map theme names to display labels
  const themeLabels = {
    light: '☀️ Light Mode',
    dark: '🌙 Dark Mode',
    blue: '🔵 Blue Theme',
    green: '🟢 Green Theme',
    purple: '🟣 Purple Theme'
  };
  
  // Get next theme for tooltip
  const themes = ['light', 'dark', 'blue', 'green', 'purple'];
  const currentIndex = themes.indexOf(theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
    >
      {themeLabels[theme] || '🎨 Theme'}
    </button>
  );
}