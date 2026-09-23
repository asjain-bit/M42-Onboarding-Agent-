import React from 'react'

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', disabled, id, ...props }, ref) => {
    const generatedId = id || `radio-${Math.random().toString(36).substring(2, 9)}`

    return (
      <label
        htmlFor={generatedId}
        className={[
          'inline-flex items-center gap-2.5 cursor-pointer select-none text-sm font-normal text-[#0d212c]',
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:text-[#0d212c]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          ref={ref}
          type="radio"
          id={generatedId}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className="w-4 h-4 rounded-full border border-[#d9e2ec] bg-white transition-all flex items-center justify-center peer-checked:border-[#0d212c] peer-checked:bg-[#0d212c] peer-focus-visible:ring-2 peer-focus-visible:ring-[#36c0c9]/30">
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {label && <span>{label}</span>}
      </label>
    )
  }
)
Radio.displayName = 'Radio'
