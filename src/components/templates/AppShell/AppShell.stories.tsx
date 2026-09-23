import type { Meta, StoryObj } from '@storybook/react'
import { AppShell } from './AppShell'

const meta: Meta<typeof AppShell> = {
  title: 'Templates/AppShell',
  component: AppShell,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof AppShell>

export const Default: Story = {
  args: {
    topbar: <div className="h-[56px] bg-bg-surface-2 p-4 font-semibold border-b border-border-default">Topbar Slot (56px)</div>,
    leftbar: <div className="p-4 text-xs font-semibold">Leftbar Slot</div>,
    main: <div className="p-8 bg-bg-surface-1 rounded-lg border border-border-default">Main Slot (flex-grow)</div>,
    rightbar: <div className="p-4 text-xs">Rightbar Slot (~280px)</div>,
  },
}
