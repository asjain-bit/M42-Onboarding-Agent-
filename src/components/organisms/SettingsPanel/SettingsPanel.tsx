/**
 * SettingsPanel — Organism
 * Complete user settings section combining FormField molecules, Avatar atom, ThemeToggle, Toast, and AppDialog.
 * Used in: page.tsx
 */

import React, { useState } from 'react'
import { FormField } from '@/components/molecules/FormField'
import { Button } from '@/components/atoms/Button'
import { Avatar } from '@/components/atoms/Avatar'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'
import { Toast } from '@/components/molecules/Toast'
import { AppDialog } from '@/components/molecules/AppDialog'
import { SettingsPanelProps } from './SettingsPanel.types'

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSave, className = '' }) => {
  const [name, setName] = useState('Alex Developer')
  const [email, setEmail] = useState('alex@enterprise.org')
  const [savedToast, setSavedToast] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave?.({ name, email })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 4000)
  }

  return (
    <div className={['w-full max-w-2xl bg-bg-surface-1 border border-border-default rounded-xl p-6 shadow-xs flex flex-col gap-6 text-text-primary', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h2 className="text-xl font-semibold font-serif">Account Settings</h2>
          <p className="text-sm text-text-tertiary">Manage your profile details and design system preferences.</p>
        </div>
        <Avatar fallback="AD" size="lg" />
      </div>

      {savedToast && (
        <Toast
          type="success"
          title="Settings Saved"
          description="Your profile and preferences have been updated successfully."
          onDismiss={() => setSavedToast(false)}
        />
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <FormField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <FormField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex items-center justify-between p-4 bg-bg-surface-2 rounded-lg border border-border-subtle">
          <div>
            <h4 className="text-sm font-normal">Appearance Theme</h4>
            <p className="text-xs text-text-tertiary">Select light, dark, or system preference.</p>
          </div>
          <ThemeToggle showLabel />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <Button type="button" variant="destructive" onClick={() => setDialogOpen(true)}>
            Reset Profile
          </Button>

          <Button type="submit" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>

      <AppDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Reset Profile Settings?"
        confirmLabel="Reset All"
        destructive
        onConfirm={() => {
          setName('Default User')
          setEmail('user@example.com')
        }}
      >
        <p>This will restore your profile fields to initial default values.</p>
      </AppDialog>
    </div>
  )
}
