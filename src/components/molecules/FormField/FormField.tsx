/**
 * FormField — Molecule
 * Combines label, Input atom, and helper or error message text adhering to global guidelines.
 * Used in: SettingsPanel, AppDialog, VendorsScreen, QuestionnairesScreen
 */

import React, { useId } from 'react'
import { Input } from '@/components/atoms/Input'
import { FormFieldProps } from './FormField.types'

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  errorMessage,
  required,
  id: customId,
  error,
  className = '',
  ...inputProps
}) => {
  const generatedId = useId()
  const inputId = customId || generatedId
  const hasError = Boolean(errorMessage || error)

  return (
    <div className={['flex flex-col gap-1.5 w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#0d212c] tracking-normal select-none">
          {label}
          {required && <span className="text-[#d92d20] ml-1">*</span>}
        </label>
      )}

      <Input id={inputId} error={hasError} {...inputProps} />

      {errorMessage ? (
        <span className="text-xs text-[#d92d20] font-normal mt-0.5">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-[#64748b] mt-0.5">{helperText}</span>
      ) : null}
    </div>
  )
}
