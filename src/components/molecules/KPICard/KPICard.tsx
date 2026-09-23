/**
 * KPICard — Molecule
 * Key performance metric card displaying label, value, Badge atom, and trend indicator.
 * Light mode card with standard typography.
 */

import React from 'react'
import { Badge } from '@/components/atoms/Badge'
import { Icon } from '@/components/atoms/Icon'
import { KPICardProps } from './KPICard.types'

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend,
  badgeText,
  badgeVariant = 'neutral',
  className = '',
}) => {
  return (
    <div
      className={[
        'p-5 rounded-2xl border border-[#e2e8f0] bg-white text-[#0d212c] shadow-xs flex flex-col gap-2 transition-all hover:border-[#cbd5e1]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#64748b] tracking-wide">
          {title}
        </span>
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-bold text-[#0d212c] font-sans">{value}</span>
        {change && (
          <span
            className={[
              'text-xs font-semibold inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full',
              trend === 'up'
                ? 'bg-[#e6f4ea] text-[#137333]'
                : trend === 'down'
                ? 'bg-red-50 text-red-600'
                : 'bg-slate-100 text-[#64748b]',
            ].join(' ')}
          >
            {trend === 'up' && <Icon name="check" size={12} />}
            {trend === 'down' && <Icon name="x" size={12} />}
            {change}
          </span>
        )}
      </div>
    </div>
  )
}
