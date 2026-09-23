import React from 'react'

export type StatusCategory = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'finalised'

export interface StatusChipProps {
  label: string
  status?: StatusCategory
  className?: string
  dot?: boolean
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  status = 'neutral',
  className = '',
  dot = false,
}) => {
  const getStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-[#e6f4ea] text-[#137333] border-[#ceebd6]'
      case 'warning':
        return 'bg-[#fef7e0] text-[#b06000] border-[#fde8b3]'
      case 'error':
        return 'bg-[#fce8e6] text-[#c5221f] border-[#f8c4c0]'
      case 'info':
        return 'bg-[#e8f0fe] text-[#1a73e8] border-[#c6dafc]'
      case 'finalised':
        return 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]'
      case 'neutral':
      default:
        return 'bg-[#f1f3f4] text-[#5f6368] border-[#e0e0e0]'
    }
  }

  const getDotBg = () => {
    switch (status) {
      case 'success':
        return 'bg-[#137333]'
      case 'warning':
        return 'bg-[#b06000]'
      case 'error':
        return 'bg-[#c5221f]'
      case 'info':
        return 'bg-[#1a73e8]'
      case 'finalised':
        return 'bg-[#6b21a8]'
      case 'neutral':
      default:
        return 'bg-[#5f6368]'
    }
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-normal border select-none transition-colors',
        getStyles(),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotBg()}`} />}
      <span>{label}</span>
    </span>
  )
}
