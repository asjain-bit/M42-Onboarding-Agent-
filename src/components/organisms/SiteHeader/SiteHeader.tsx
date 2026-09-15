/**
 * SiteHeader — Organism
 * Top page header displaying clean page title and subtitle.
 */

'use client'

import React from 'react'
import { SiteHeaderProps } from './SiteHeader.types'

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  title = 'Onboarding Agent',
  subtitle,
  className = '',
}) => {
  return (
    <header
      className={[
        'w-full bg-white border-b border-[#e2e8f0] px-6 lg:px-10 py-5 flex items-center justify-between sticky top-0 z-40 text-[#0d212c] shadow-xs',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col">
        <h1 className="font-extrabold text-xl lg:text-2xl tracking-tight text-[#0d212c]">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-xs text-[#64748b] mt-0.5 leading-normal">{subtitle}</p>
        ) : null}
      </div>
    </header>
  )
}
