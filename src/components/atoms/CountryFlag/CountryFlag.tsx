'use client'

import React, { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

export interface CountryFlagProps {
  country?: string
  code?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  'United Arab Emirates': 'ae',
  UAE: 'ae',
  'United States': 'us',
  USA: 'us',
  US: 'us',
  'United Kingdom': 'gb',
  UK: 'gb',
  Germany: 'de',
  Netherlands: 'nl',
  France: 'fr',
  Singapore: 'sg',
  'Saudi Arabia': 'sa',
  India: 'in',
  Canada: 'ca',
  Australia: 'au',
  Switzerland: 'ch',
}

export const getCountryCode = (country?: string, code?: string): string => {
  if (code) return code.toLowerCase()
  if (!country) return 'un'
  if (COUNTRY_CODE_MAP[country]) return COUNTRY_CODE_MAP[country]

  const lower = country.toLowerCase().trim()
  const matched = Object.entries(COUNTRY_CODE_MAP).find(
    ([k]) => k.toLowerCase() === lower
  )
  if (matched) return matched[1]
  if (lower.length === 2) return lower
  return 'un'
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  country,
  code,
  className = '',
  size = 'sm',
}) => {
  const [imgError, setImgError] = useState(false)
  const countryCode = getCountryCode(country, code)

  useEffect(() => {
    setImgError(false)
  }, [country, code])

  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-5 h-3.5',
    lg: 'w-6 h-4',
  }[size]

  const combinedClasses =
    `inline-block rounded-xs object-cover border border-[#cbd5e1]/60 shadow-2xs shrink-0 align-middle ${sizeClasses} ${className}`.trim()

  if (imgError || countryCode === 'un') {
    return <Globe className={`shrink-0 text-[#94a3b8] ${sizeClasses} ${className}`.trim()} />
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt={country || countryCode.toUpperCase()}
      className={combinedClasses}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  )
}
