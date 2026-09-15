import type { Meta, StoryObj } from '@storybook/react'
import { AgentManagement } from './AgentManagement'

const meta: Meta<typeof AgentManagement> = {
  title: 'Organisms/AgentManagement',
  component: AgentManagement,
}

export default meta
type Story = StoryObj<typeof AgentManagement>

export const ListMode: Story = {
  args: {},
}

export const DetailModeModified: Story = {
  args: {
    initialAgentId: 'sam-voice-interviewer',
  },
}

export const DetailModeDefault: Story = {
  args: {
    initialAgentId: 'answer-judge',
  },
}
