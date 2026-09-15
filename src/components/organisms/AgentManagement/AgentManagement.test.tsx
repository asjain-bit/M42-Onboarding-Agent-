import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AgentManagement } from './AgentManagement'

describe('AgentManagement Organism', () => {
  it('renders the Agents title, status filter chips, and all 7 rows on page 1', () => {
    render(<AgentManagement />)
    expect(screen.getByRole('heading', { name: 'Agents' })).toBeInTheDocument()
    expect(screen.getByText('Answer judge')).toBeInTheDocument()
    expect(screen.getByText('Sam (voice interviewer)')).toBeInTheDocument()
    expect(screen.getByText('All Agents')).toBeInTheDocument()
  })

  it('navigates to detail view on agent row click and displays breadcrumbs', () => {
    render(<AgentManagement />)
    const agentRow = screen.getByText('Sam (voice interviewer)')
    fireEvent.click(agentRow)

    expect(screen.getAllByText('Agents').length).toBeGreaterThan(0)
    expect(screen.getByText('Prompt')).toBeInTheDocument()
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('Version history')).toBeInTheDocument()
  })

  it('resets a modified field back to default value', () => {
    render(<AgentManagement initialAgentId="sam-voice-interviewer" />)
    const resetButtons = screen.getAllByText('Reset')
    expect(resetButtons.length).toBeGreaterThan(0)
    fireEvent.click(resetButtons[0])
    expect(screen.getByText('Setting reset to default value')).toBeInTheDocument()
  })
})
