'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { CountryFlag } from '@/components/atoms/CountryFlag'

export interface CountryOption {
  name: string
  code: string
  flag: string
}

export const DEFAULT_COUNTRY_OPTIONS: CountryOption[] = [
  { name: 'France', code: 'fr', flag: '🇫🇷' },
  { name: 'Germany', code: 'de', flag: '🇩🇪' },
  { name: 'Netherlands', code: 'nl', flag: '🇳🇱' },
  { name: 'Saudi Arabia', code: 'sa', flag: '🇸🇦' },
  { name: 'Singapore', code: 'sg', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: 'ae', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'gb', flag: '🇬🇧' },
  { name: 'United States', code: 'us', flag: '🇺🇸' },
]

export interface CountrySelectProps {
  value?: string
  onChange: (country: string) => void
  options?: CountryOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value = '',
  onChange,
  options = DEFAULT_COUNTRY_OPTIONS,
  placeholder = 'Select Country',
  disabled = false,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure options are always sorted in alphabetical order by name
  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => a.name.localeCompare(b.name))
  }, [options])

  const selectedOption = useMemo(() => {
    return sortedOptions.find((c) => c.name.toLowerCase() === (value || '').toLowerCase())
  }, [sortedOptions, value])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((prev) => !prev)
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs flex items-center justify-between text-left transition cursor-pointer outline-none ${
          disabled
            ? 'border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] cursor-not-allowed opacity-60'
            : isOpen
            ? 'border-[#cbd5e1]'
            : 'border-[#e2e8f0] hover:border-[#cbd5e1] focus:border-[#cbd5e1]'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {value ? (
            <>
              <CountryFlag
                country={selectedOption?.name || value}
                code={selectedOption?.code}
                size="md"
              />
              <span className="text-xs font-semibold text-[#0d212c] truncate">
                {selectedOption?.name || value}
              </span>
            </>
          ) : (
            <span className="text-xs text-[#94a3b8]">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#64748b] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Custom Popup Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e2e8f0] shadow-xl rounded-2xl p-1.5 z-[60] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1"
        >
          {sortedOptions.map((country) => {
            const isSelected =
              country.name.toLowerCase() === (value || '').toLowerCase()

            return (
              <button
                key={country.name}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(country.name)
                  setIsOpen(false)
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-3 text-left border-0 ${
                  isSelected
                    ? 'bg-[#ddf7f9]/50 text-[#0d212c] font-semibold'
                    : 'hover:bg-slate-50 text-[#0d212c]'
                }`}
              >
                <CountryFlag
                  country={country.name}
                  code={country.code}
                  size="md"
                />
                <span className="text-xs font-semibold text-[#0d212c] flex-1 truncate">
                  {country.name}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#009299] shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
