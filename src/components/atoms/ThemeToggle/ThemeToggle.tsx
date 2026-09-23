/**
 * ThemeToggle — Atom
 * Interactive toggle button cycling through light -> dark -> system theme choices.
 * Used in: SiteHeader, SettingsPanel
 */

import React from 'react'
import { useTheme, Theme } from '@/contexts/ThemeContext'
import { Icon } from '@/components/atoms/Icon'
import { ThemeToggleProps } from './ThemeToggle.types'

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '', ...props }) => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleCycle = () => {
    const nextTheme: Record<Theme, Theme> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    }
    setTheme(nextTheme[theme])
  }

  const getIconName = () => {
    if (theme === 'system') return 'laptop'
    return resolvedTheme === 'dark' ? 'moon' : 'sun'
  }

  return (
    <button
      onClick={handleCycle}
      aria-label={`Current theme: ${theme}. Click to change theme.`}
      title={`Theme: ${theme}`}
      className={[
        'inline-flex items-center gap-2 h-9 px-3 text-sm font-normal rounded-md bg-bg-surface-2 hover:bg-bg-hover text-text-primary border border-border-default transition-colors cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Icon name={getIconName()} size={16} />
      {showLabel && <span className="capitalize">{theme}</span>}
    </button>
  )
}
