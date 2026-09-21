'use client'

import React, { useState, useMemo } from 'react'
import {
  Check,
  ChevronDown,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Play,
  Pause,
  Copy,
  SlidersHorizontal,
  ChevronUp,
  X,
  AlertTriangle,
  ExternalLink,
  Search,
  FileText,
  Calendar,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { CountryFlag } from '@/components/atoms/CountryFlag'
import { Checkbox } from '@/components/atoms/Checkbox'
import { CallRoomScreen } from './CallRoomScreen'

export interface VendorDispatchData {
  id: string
  name: string
  sublabel: string
  domain: string
  country: string
  flag: string
  email: string
  recipients?: string[]
}

interface TestcasePreviewItem {
  id: number
  code: string
  title: string
  responseCue: string
  type: 'Problems' | 'Active' | 'Sensitive Info' | 'Meds Dispensing' | 'Lab Results'
}

const sampleDatasetTestcases: TestcasePreviewItem[] = [
  {
    id: 1,
    code: 'TC-FH-01',
    title: 'Describe the primary clinical or operational use cases supported by your solution.',
    responseCue:
      'Specify whether workflows are clinical, decision-support, operational, or administrative. State whether outputs influence patient care directly or indirectly.',
    type: 'Problems',
  },
  {
    id: 2,
    code: 'TC-FH-02',
    title: 'Has your organization performed a patient safety or clinical risk assessment for this product?',
    responseCue:
      'Provide documentation or summary of hazard analysis, risk register, or failure-mode analysis related to patient harm.',
    type: 'Active',
  },
  {
    id: 3,
    code: 'TC-SEC-01',
    title: 'Describe how customer data is encrypted in transit and at rest across cloud tenants.',
    responseCue:
      'Specify encryption algorithms (e.g. AES-256, TLS 1.3), key rotation policies, and HSM backing.',
    type: 'Sensitive Info',
  },
  {
    id: 4,
    code: 'TC-SEC-02',
    title: 'Provide proof of SOC 2 Type II or ISO/IEC 27001 certification compliance.',
    responseCue:
      'Attach executive summary or auditor attestation statement covering the last 12 months.',
    type: 'Sensitive Info',
  },
  {
    id: 5,
    code: 'TC-MED-01',
    title: 'Verify automated medication dispensing log formats and barcode scanning integration.',
    responseCue:
      'Detail system capability to capture dose, unit, barcode timestamp, and nurse override authorization.',
    type: 'Meds Dispensing',
  },
  {
    id: 6,
    code: 'TC-LAB-01',
    title: 'Validate laboratory test reports (ORU-Laboratory) and critical value alert flags.',
    responseCue:
      'Hold laboratory test reports organized by category, normal ranges, and abnormal/critical flags.',
    type: 'Lab Results',
  },
  {
    id: 7,
    code: 'TC-UAE-01',
    title: 'Can customer data be strictly isolated within United Arab Emirates cloud regions?',
    responseCue:
      'Detail tenant deployment architecture, backup locations, and compliance with UAE Health Data Law.',
    type: 'Active',
  },
]

interface ConfigureVendorCallScreenProps {
  vendor: VendorDispatchData
  onBack: () => void
  onComplete?: () => void
  onHeaderChange?: (header: React.ReactNode | null) => void
}

export const ConfigureVendorCallScreen: React.FC<ConfigureVendorCallScreenProps> = ({
  vendor,
  onBack,
  onComplete: _onComplete,
  onHeaderChange,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [hasCompletedStep2, setHasCompletedStep2] = useState(false)
  const [isDispatched, setIsDispatched] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showCallRoom, setShowCallRoom] = useState(false)
  const [callRoomStep, setCallRoomStep] = useState<'admin_join' | 'select_role'>('admin_join')
  const [hideChangeRole, setHideChangeRole] = useState(false)

  // Step 1 states (empty by default)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState('')
  const [roundLabel, setRoundLabel] = useState('')
  const [isDatasetDropdownOpen, setIsDatasetDropdownOpen] = useState(false)
  const [showDatasetPreviewModal, setShowDatasetPreviewModal] = useState(false)
  const [datasetSearchQuery, setDatasetSearchQuery] = useState('')

  // Reschedule & Cancel Assessment Modal States for Dispatched Call
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-24')
  const [rescheduleTime, setRescheduleTime] = useState('14:30')
  const [rescheduleReason, setRescheduleReason] = useState('')

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isMeetingCancelled, setIsMeetingCancelled] = useState(false)

  // Recipient input & tags state (populated from vendor or default)
  const [recipients, setRecipients] = useState<string[]>(
    vendor.recipients && vendor.recipients.length > 0
      ? vendor.recipients
      : [vendor.email || 'tech-lead@clevelandclinic.ae']
  )
  const [recipientInput, setRecipientInput] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [recipientError, setRecipientError] = useState<string | null>(null)

  // Step 2 states (Configure Agent)
  const [selectedVoice, setSelectedVoice] = useState('Marin')
  const [showAllVoices, setShowAllVoices] = useState(false)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [timing, setTiming] = useState<'now' | 'later'>('now')
  const todayStr = new Date().toISOString().split('T')[0]
  const [scheduleDate, setScheduleDate] = useState(todayStr)
  const [startTime, setStartTime] = useState('10:30 AM')
  const [endTime, setEndTime] = useState('12:30 PM')

  // Effect to update top site header when call is dispatched/scheduled
  React.useEffect(() => {
    if (isDispatched && onHeaderChange) {
      onHeaderChange(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ddf7f9] text-[#36c0c9] flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="font-extrabold text-xl lg:text-2xl tracking-tight text-[#0d212c]">
            {timing === 'later' ? 'Call scheduled' : 'Call dispatched'}
          </span>
        </div>
      )
    } else if (onHeaderChange) {
      onHeaderChange(null)
    }
    return () => {
      if (onHeaderChange) onHeaderChange(null)
    }
  }, [isDispatched, timing, onHeaderChange])

  // Body scroll lock effect when any modal is open
  React.useEffect(() => {
    if (showDatasetPreviewModal || showRescheduleModal || showCancelModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showDatasetPreviewModal, showRescheduleModal, showCancelModal])

  // Checkboxes for testcases inclusion (mapping id -> boolean)
  const [testcaseInclusions, setTestcaseInclusions] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  })

  // Draft state while editing in the preview modal
  const [draftTestcaseInclusions, setDraftTestcaseInclusions] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  })

  const handleOpenDatasetPreview = () => {
    setDraftTestcaseInclusions({ ...testcaseInclusions })
    setShowDatasetPreviewModal(true)
  }

  const toggleDraftTestcaseInclusion = (id: number) => {
    setDraftTestcaseInclusions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const allDraftTestcasesIncluded =
    sampleDatasetTestcases.length > 0 &&
    sampleDatasetTestcases.every((tc) => draftTestcaseInclusions[tc.id])

  const toggleSelectAllDraftTestcases = () => {
    const nextState = !allDraftTestcasesIncluded
    const updated: Record<number, boolean> = {}
    sampleDatasetTestcases.forEach((tc) => {
      updated[tc.id] = nextState
    })
    setDraftTestcaseInclusions(updated)
  }

  const includedCount = Object.values(testcaseInclusions).filter(Boolean).length
  const draftIncludedCount = Object.values(draftTestcaseInclusions).filter(Boolean).length

  // Estimated duration is auto-populated and non-editable
  const estimatedDuration = '60-120 minutes'

  // Primary Timezone: GST (UTC+4)
  const [timezone, setTimezone] = useState('GST - Gulf Standard Time (UTC+4)')

  // Advanced settings state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(true)
  const [nudgeWaitSeconds, setNudgeWaitSeconds] = useState('30')

  const datasetOptions = [
    'ADT-Family History',
    'ORU-Laboratory',
    'ORU-Radiology',
    'ORU-Clinical Documents',
    'ORU-Vitals',
    'PPR- Problems',
    'RDS - Pharmacy Dispense',
  ]

  // Requirement 6: Full text "Marin Agent recommended" chip used without truncation
  const primaryVoiceOptions = [
    {
      id: 'Marin',
      label: 'Marin',
      recommended: true,
      desc: 'Warm and steady. Keeps vendor teams at ease.',
    },
    {
      id: 'Ash',
      label: 'Ash',
      recommended: false,
      desc: 'Crisp and direct. Suits fast-moving walkthroughs.',
    },
    {
      id: 'Coral',
      label: 'Coral',
      recommended: false,
      desc: 'Bright and encouraging. Ideal for onboarding.',
    },
  ]

  const extraVoiceOptions = [
    { id: 'Alloy', label: 'Alloy', desc: 'Neutral and balanced tone.' },
    { id: 'Nova', label: 'Nova', desc: 'Professional healthcare specialist voice.' },
    { id: 'Onyx', label: 'Onyx', desc: 'Authoritative audit tone.' },
    { id: 'Echo', label: 'Echo', desc: 'Calm and deliberate voice.' },
    { id: 'Fable', label: 'Fable', desc: 'Friendly technical interviewer.' },
    { id: 'Shimmer', label: 'Shimmer', desc: 'Clear and energetic speaker.' },
    { id: 'Breeze', label: 'Breeze', desc: 'Soft and reassuring auditor.' },
  ]

  // 15-minute interval time slot options
  const timeSlots = [
    '08:00 AM',
    '08:15 AM',
    '08:30 AM',
    '08:45 AM',
    '09:00 AM',
    '09:15 AM',
    '09:30 AM',
    '09:45 AM',
    '10:00 AM',
    '10:15 AM',
    '10:30 AM',
    '10:45 AM',
    '11:00 AM',
    '11:15 AM',
    '11:30 AM',
    '11:45 AM',
    '12:00 PM',
    '12:15 PM',
    '12:30 PM',
    '12:45 PM',
    '01:00 PM',
    '01:15 PM',
    '01:30 PM',
    '01:45 PM',
    '02:00 PM',
    '02:15 PM',
    '02:30 PM',
    '02:45 PM',
    '03:00 PM',
    '03:15 PM',
    '03:30 PM',
    '03:45 PM',
    '04:00 PM',
    '04:15 PM',
    '04:30 PM',
    '04:45 PM',
    '05:00 PM',
    '05:15 PM',
    '05:30 PM',
    '05:45 PM',
    '06:00 PM',
    '06:15 PM',
    '06:30 PM',
    '06:45 PM',
    '07:00 PM',
    '07:15 PM',
    '07:30 PM',
    '07:45 PM',
    '08:00 PM',
  ]

  const callJoinLink =
    'https://tech-due-diligence.delphiprojects.app/call/E0exXCogAvq0Owdr3qbYhU0vt1CQdBuIFIJN18D6wZM'

  // Convert time string (12h AM/PM or 24h HH:MM) to minutes from midnight
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return -1
    const match12 = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (match12) {
      let hours = parseInt(match12[1], 10)
      const minutes = parseInt(match12[2], 10)
      const period = match12[3].toUpperCase()
      if (period === 'PM' && hours < 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      return hours * 60 + minutes
    }
    const match24 = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/)
    if (match24) {
      const hours = parseInt(match24[1], 10)
      const minutes = parseInt(match24[2], 10)
      return hours * 60 + minutes
    }
    return -1
  }

  // Handle Start Time changes: revalidate End Time & clear if now invalid
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart)
    if (!newStart) {
      setEndTime('')
      return
    }
    if (endTime) {
      const startM = timeToMinutes(newStart)
      const endM = timeToMinutes(endTime)
      if (startM < 0 || endM <= startM) {
        setEndTime('')
      }
    }
  }

  // Step 1 Validation: Questionnaire, Round Label, at least 1 Recipient, and max 5 Recipients
  const isStep1Valid =
    selectedQuestionnaire.trim() !== '' &&
    roundLabel.trim() !== '' &&
    recipients.length > 0 &&
    recipients.length <= 5

  // Email validation on Enter key press
  const handleKeyDownRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = recipientInput.trim().replace(/,/g, '')
      if (!trimmed) return

      if (recipients.length >= 5) {
        setRecipientError('Maximum 5 recipients can be added.')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmed)) {
        setRecipientError('Please enter a valid email address.')
        return
      }

      if (recipients.includes(trimmed)) {
        setRecipientError('This recipient has already been added.')
        return
      }

      setRecipients([...recipients, trimmed])
      setRecipientInput('')
      setRecipientError(null)
    }
  }

  const handleRemoveRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter((r) => r !== emailToRemove))
  }

  // Voice Audio Play Simulation
  const togglePlayVoice = (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null)
    } else {
      setPlayingVoiceId(voiceId)
      setTimeout(() => {
        setPlayingVoiceId(null)
      }, 3000)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(callJoinLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Time validation helper
  const isTimeInvalid =
    timing === 'later' &&
    Boolean(startTime) &&
    Boolean(endTime) &&
    timeToMinutes(endTime) <= timeToMinutes(startTime)

  // Step 2 Validation: Voice selected and, if scheduled later, date and valid start/end times selected
  const isStep2Valid =
    selectedVoice.trim() !== '' &&
    (timing === 'now' ||
      (Boolean(scheduleDate) && Boolean(startTime) && Boolean(endTime) && !isTimeInvalid))

  // Step 3 is unlocked strictly after Step 1 is valid, Step 2 is valid, and Step 2 has been submitted/visited
  const isStep3Unlocked = isStep1Valid && isStep2Valid && (currentStep === 3 || hasCompletedStep2)

  // Calculate duration between Start and End Time
  const durationText = useMemo(() => {
    if (!startTime || !endTime) return null
    const startM = timeToMinutes(startTime)
    const endM = timeToMinutes(endTime)
    if (startM < 0 || endM < 0 || endM <= startM) return null
    const diff = endM - startM
    const hrs = Math.floor(diff / 60)
    const mins = diff % 60
    if (hrs === 0) return `${mins} mins`
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} mins`
  }, [startTime, endTime])

  // Format meeting time range string for Call Summary & Dispatched Screen
  const formattedTimeRange = useMemo(() => {
    if (timing === 'now') {
      const now = new Date()
      // Real dynamic time currently in Dubai (Asia/Dubai)
      const startDubaiStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      const endNow = new Date(now.getTime() + 60 * 60 * 1000)
      const endDubaiStr = endNow.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      return `${startDubaiStr} - ${endDubaiStr} GST`
    }
    if (!startTime || !endTime) return 'Time not set'
    return `${startTime} - ${endTime} GST`
  }, [timing, startTime, endTime])

  // SCREEN 3: Call Room View
  if (showCallRoom) {
    return (
      <CallRoomScreen
        vendor={vendor}
        onBack={() => setShowCallRoom(false)}
        onExitToVendors={onBack}
        timing={timing}
        scheduleDate={scheduleDate}
        formattedTimeRange={formattedTimeRange}
        initialRole={callRoomStep === 'admin_join' ? 'admin' : 'vendor'}
        initialFlowStep={callRoomStep}
        hideChangeRole={hideChangeRole}
      />
    )
  }

  const renderScheduleAndCancelModals = () => (
    <>
      {/* Reschedule Meeting Modal — Centered layout, icon top, title next line, mandatory asterisks, subtle grey focus, proper padding */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-[100] bg-[#0d212c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-8 sm:p-10 w-full max-w-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer bg-transparent border-0 outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4 fill-none stroke-current" style={{ fill: 'none', stroke: 'currentColor' }} />
            </button>

            {/* Centered Icon and Title */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#ddf7f9] text-[#0d7280] flex items-center justify-center border border-[#36c0c9]/30 shadow-2xs">
                <Calendar className="w-7 h-7 text-[#0d7280]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0d212c]">Reschedule meeting</h3>
            </div>

            <div className="flex flex-col gap-4 w-full text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0d212c]">
                    New date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-semibold outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0d212c]">
                    New time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-semibold outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0d212c]">
                  Reason <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule conflict requested by facility"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-normal outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#e2e8f0] w-full">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-3 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] cursor-pointer bg-transparent transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRescheduleModal(false)
                  setScheduleDate(rescheduleDate)
                  setStartTime(rescheduleTime)
                }}
                disabled={!rescheduleDate.trim() || !rescheduleTime.trim() || !rescheduleReason.trim()}
                className="flex-1 py-3 rounded-xl bg-[#36c0c9] text-white font-bold text-xs transition cursor-pointer shadow-2xs border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Meeting Modal — Center-aligned matching delete popup reference, long height reason, subtle grey focus */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 sm:p-10 shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-150 text-center flex flex-col items-center gap-5 relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer bg-transparent border-0 outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4 fill-none stroke-current" style={{ fill: 'none', stroke: 'currentColor' }} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1 text-center">
              <h3 className="text-xl font-extrabold text-[#0d212c]">Cancel meeting</h3>
              <p className="text-xs text-[#64748b] leading-relaxed max-w-md">
                Are you sure you want to cancel the meeting?
              </p>
            </div>

            {/* Optional Reason field without asterisk */}
            <div className="flex flex-col gap-1.5 w-full text-left">
              <label className="text-xs font-semibold text-[#0d212c]">Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Describe the reason for cancelling this meeting (optional)..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-normal outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white resize-none transition min-h-[110px]"
              />
            </div>

            <div className="flex items-center justify-center gap-3 w-full pt-1">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] cursor-pointer flex-1 bg-transparent transition hover:bg-slate-50"
              >
                Keep Assessment
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setIsMeetingCancelled(true)
                }}
                className="px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer flex-1 border-0 transition shadow-2xs hover:bg-red-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // SCREEN 2: Assessment Dispatched View
  if (isDispatched) {
    const isScheduledLater = timing === 'later'

    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0d212c] pb-16 font-sans w-full flex flex-col items-center">
        <div className="w-full px-6 lg:px-10 pt-4 pb-2 text-xs font-semibold flex items-center gap-1.5 text-[#64748b]">
          <button
            onClick={onBack}
            className="hover:text-[#36c0c9] cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Facilities</span>
          </button>
          <span>/</span>
          <span>{vendor.name}</span>
          <span>/</span>
          <span className="text-[#36c0c9] font-bold">
            {isScheduledLater ? 'Call scheduled' : 'Call dispatched'}
          </span>
        </div>

        <div className="w-full max-w-2xl px-6 mt-8 flex flex-col gap-6">



          <div className="bg-white p-8 rounded-3xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  JOIN LINK
                </span>
                {!isScheduledLater && (
                  <span className="text-[11px] text-[#64748b]">
                    The call is open now. Share the link and join.
                  </span>
                )}
              </div>

              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  readOnly
                  value={callJoinLink}
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] font-mono text-xs text-[#0d212c] outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-[#0d212c] hover:bg-[#e2e8f0] transition cursor-pointer"
                  title="Copy join link"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-[#137333]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="mt-2 relative group w-full">
                <button
                  id="open-call-room-btn"
                  disabled={timing === 'later'}
                  onClick={() => {
                    if (timing !== 'later') {
                      setCallRoomStep('admin_join')
                      setHideChangeRole(true)
                      setShowCallRoom(true)
                    }
                  }}
                  className={`w-full font-bold text-xs py-3.5 px-6 rounded-xl transition border-0 ${timing === 'later'
                      ? 'bg-[#0d212c]/40 text-white/70 cursor-not-allowed shadow-none'
                      : 'bg-[#0d212c] hover:bg-[#122e3d] text-white cursor-pointer shadow-xs'
                    }`}
                >
                  Open call room
                </button>
                {timing === 'later' && (
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 -top-12 z-50 w-80 bg-[#0d212c] text-white text-xs p-2.5 rounded-xl shadow-xl border border-white/10 text-center leading-relaxed font-normal">
                    This meeting is scheduled for a specific time ({formattedTimeRange}). You will
                    be able to join the call at that time.
                  </div>
                )}
              </div>
            </div>

            <div className="py-4 grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider block mb-1">
                  ROUND
                </span>
                <span className="font-bold text-[#0d212c]">{roundLabel || 'Round 1'}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider block mb-1">
                  DATASET
                </span>
                <span className="font-bold text-[#0d212c]">{selectedQuestionnaire}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-[#e2e8f0]">
              <span className="text-xs font-bold text-[#0d212c]">What to do next</span>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#cbd5e1] bg-[#f8fafc] text-[#64748b] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="leading-relaxed text-[#64748b]">
                    {isScheduledLater
                      ? 'The facility members will receive an email invitation with the meeting details and link.'
                      : 'Share the join link with the facility members above. They can join from any browser.'}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#cbd5e1] bg-[#f8fafc] text-[#64748b] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="leading-relaxed text-[#64748b]">
                    Open the link yourself. You enter the room as the M42 moderator.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#cbd5e1] bg-[#f8fafc] text-[#64748b] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="leading-relaxed text-[#64748b]">
                    Press Start assessment once everyone is in. Agent runs the dataset evaluation from
                    there.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mt-6">
            <button
              onClick={onBack}
              className="text-xs font-bold text-[#36c0c9] hover:text-[#2badb6] transition cursor-pointer bg-transparent border-0"
            >
              Schedule another call
            </button>

            {/* View facility's call room flow button outside of card below Schedule another call */}
            <div className="w-full max-w-md flex flex-col items-center gap-1.5">
              <button
                id="dispatched-view-vendor-flow-btn"
                onClick={() => {
                  setCallRoomStep('select_role')
                  setHideChangeRole(false)
                  setShowCallRoom(true)
                }}
                className="w-full bg-[#f8fafc] hover:bg-[#ddf7f9]/50 text-[#0d7280] font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer border border-[#36c0c9]/40 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                View facility&apos;s call room flow
              </button>
              <p className="text-[11px] text-[#64748b] text-center font-normal">
                This is a placeholder for showcasing the facility&apos;s flow.
              </p>
            </div>
          </div>
        </div>

        {renderScheduleAndCancelModals()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d212c] pb-16 font-sans w-full">
      {/* Breadcrumb Header */}
      <div className="w-full px-6 lg:px-10 pt-4 pb-2 text-xs font-semibold flex items-center gap-1.5 text-[#64748b]">
        <button
          onClick={onBack}
          className="hover:text-[#36c0c9] cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Facilities</span>
        </button>
        <span>/</span>
        <button onClick={onBack} className="hover:text-[#36c0c9] cursor-pointer">
          {vendor.name}
        </button>
        <span>/</span>
        <span className="text-[#36c0c9] font-bold">New call</span>
      </div>

      {/* Main Page Title Header */}
      <div className="w-full px-6 lg:px-10 py-3 flex flex-col gap-1">
        <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-[#0d212c]">
          Configure Assessment Call
        </h1>
        <p className="text-xs text-[#64748b]">
          Set up the session, configure Agent, then review before launch.
        </p>
      </div>

      {/* TOP FULL WIDTH HORIZONTAL STEP INDICATORS BAR */}
      <div className="w-full px-6 lg:px-10 mt-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
          <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
            CALL SETUP STAGES
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 Indicator */}
            <div
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${currentStep === 1
                  ? 'border-[#36c0c9] bg-[#ddf7f9]/20'
                  : currentStep > 1
                    ? 'border-[#e2e8f0] bg-[#f8fafc]'
                    : 'border-[#e2e8f0] bg-white'
                }`}
              onClick={() => setCurrentStep(1)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep === 1
                    ? 'bg-[#36c0c9] text-white'
                    : currentStep > 1
                      ? 'bg-[#137333] text-white'
                      : 'bg-[#e2e8f0] text-[#64748b]'
                  }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '01'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0d212c]">01 Setup</span>
                <span className="text-[11px] text-[#64748b]">Session details</span>
              </div>
            </div>

            {/* Step 2 Indicator */}
            <button
              disabled={!isStep1Valid}
              onClick={() => isStep1Valid && setCurrentStep(2)}
              className={`p-3.5 rounded-xl border transition flex items-center gap-3 text-left w-full ${currentStep === 2
                  ? 'border-[#36c0c9] bg-[#ddf7f9]/20'
                  : currentStep > 2 || hasCompletedStep2
                    ? 'border-[#e2e8f0] bg-[#f8fafc] cursor-pointer'
                    : isStep1Valid
                      ? 'border-[#e2e8f0] bg-white cursor-pointer hover:border-[#cbd5e1]'
                      : 'border-[#e2e8f0] bg-slate-50 opacity-40 cursor-not-allowed'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep === 2
                    ? 'bg-[#36c0c9] text-white'
                    : currentStep > 2 || hasCompletedStep2
                      ? 'bg-[#137333] text-white'
                      : 'bg-[#e2e8f0] text-[#64748b]'
                  }`}
              >
                {currentStep > 2 || hasCompletedStep2 ? <Check className="w-4 h-4" /> : '02'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0d212c]">02 Configure Agent</span>
                <span className="text-[11px] text-[#64748b]">Agent voice & timing</span>
              </div>
            </button>

            {/* Step 3 Indicator */}
            <button
              disabled={!isStep3Unlocked}
              onClick={() => isStep3Unlocked && setCurrentStep(3)}
              className={`p-3.5 rounded-xl border transition flex items-center gap-3 text-left w-full ${currentStep === 3
                  ? 'border-[#36c0c9] bg-[#ddf7f9]/20'
                  : isStep3Unlocked
                    ? 'border-[#e2e8f0] bg-white cursor-pointer hover:border-[#cbd5e1]'
                    : 'border-[#e2e8f0] bg-slate-50 opacity-40 cursor-not-allowed'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep === 3 ? 'bg-[#36c0c9] text-white' : 'bg-[#e2e8f0] text-[#64748b]'
                  }`}
              >
                03
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0d212c]">03 Review & launch</span>
                <span className="text-[11px] text-[#64748b]">Confirm and start</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div
        className={`w-full px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 ${currentStep === 3 ? 'items-stretch' : 'items-start'
          }`}
      >
        {/* Left Column: STEP CONTENT (8 cols) */}
        <div
          className={`lg:col-span-8 flex flex-col gap-6 ${currentStep === 3 ? 'h-full' : 'h-auto'}`}
        >
          {currentStep === 1 && (
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-1 rounded-lg hover:bg-[#f1f5f9] transition text-[#0d212c] cursor-pointer"
                  title="Back to facilities"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-extrabold text-[#0d212c]">Session setup</h2>
                </div>
              </div>

              {/* CALL TYPE */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  CALL TYPE <span className="text-red-500 font-bold">*</span>
                </span>
                <div className="p-4 rounded-2xl border border-[#e2e8f0] bg-white flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#0d212c] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#0d212c]">Assessment round</span>
                      <span className="text-[11px] text-[#64748b] mt-0.5">
                        Structured due-diligence interview using an approved dataset.
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-[#36c0c9] shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                </div>
              </div>

              {/* DATASET SELECT CUSTOM LIGHT DROPDOWN WITH OPEN PREVIEW */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                    DATASET <span className="text-red-500 font-bold">*</span>
                  </label>
                  {selectedQuestionnaire && (
                    <button
                      type="button"
                      onClick={handleOpenDatasetPreview}
                      className="text-xs font-bold text-[#36c0c9] hover:text-[#0d7280] flex items-center gap-1 cursor-pointer bg-transparent border-0 transition"
                    >
                      <span>Open preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDatasetDropdownOpen(!isDatasetDropdownOpen)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white text-xs font-semibold text-[#0d212c] flex items-center justify-between transition cursor-pointer outline-none ${isDatasetDropdownOpen
                        ? 'border-[#cbd5e1] bg-slate-50/50 shadow-xs'
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1] focus:border-[#cbd5e1]'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[#64748b] shrink-0" />
                      <span className={selectedQuestionnaire ? 'text-[#0d212c] font-bold' : 'text-[#94a3b8]'}>
                        {selectedQuestionnaire || 'Select dataset...'}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748b] shrink-0 transition-transform duration-200 ${isDatasetDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Custom Dropdown Menu Options Popup in Light Mode */}
                  {isDatasetDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e2e8f0] shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1 max-h-60 overflow-y-auto">
                      {datasetOptions.map((opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setSelectedQuestionnaire(opt)
                            setIsDatasetDropdownOpen(false)
                          }}
                          className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${selectedQuestionnaire === opt
                              ? 'bg-[#ddf7f9]/40 border border-[#36c0c9]/40 text-[#0d212c]'
                              : 'hover:bg-slate-50 text-[#0d212c]'
                            }`}
                        >
                          <span className="text-xs font-bold">{opt}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-[#64748b]">
                            {opt === 'ADT-Family History'
                              ? '24 testcases'
                              : opt === 'ORU-Laboratory'
                                ? '46 testcases'
                                : opt === 'ORU-Radiology'
                                  ? '13 testcases'
                                  : opt === 'ORU-Clinical Documents'
                                    ? '9 testcases'
                                    : opt === 'ORU-Vitals'
                                      ? '18 testcases'
                                      : '32 testcases'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedQuestionnaire && (
                  <div className="flex items-center justify-between text-[11px] text-[#64748b] pl-1 mt-0.5">
                    <span>Selected dataset configured</span>
                    <span className="text-[#64748b] font-semibold">{includedCount} testcases included for assessment</span>
                  </div>
                )}
              </div>

              {/* Requirement 5: ESTIMATED DURATION field with Note below */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  ESTIMATED DURATION <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    readOnly
                    value={estimatedDuration}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-slate-50 text-xs font-semibold text-[#0d212c] outline-none cursor-not-allowed select-none"
                  />
                  <Clock className="w-4 h-4 text-[#36c0c9] absolute left-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#64748b] mt-1 leading-relaxed">
                  <strong>Note:</strong> This is the estimated duration based on the number of
                  questions. The minimum time is{' '}
                  {selectedQuestionnaire === 'ADT-Family History'
                    ? 60
                    : selectedQuestionnaire === 'ORU-Laboratory'
                      ? 105
                      : selectedQuestionnaire === 'ORU-Radiology'
                        ? 35
                        : selectedQuestionnaire === 'ORU-Clinical Documents'
                          ? 25
                          : selectedQuestionnaire === 'ORU-Vitals'
                            ? 45
                            : selectedQuestionnaire === 'PPR- Problems'
                              ? 30
                              : selectedQuestionnaire === 'RDS - Pharmacy Dispense'
                                ? 20
                                : 135}{' '}
                  minutes and the maximum time is{' '}
                  {selectedQuestionnaire === 'ADT-Family History'
                    ? 95
                    : selectedQuestionnaire === 'ORU-Laboratory'
                      ? 160
                      : selectedQuestionnaire === 'ORU-Radiology'
                        ? 55
                        : selectedQuestionnaire === 'ORU-Clinical Documents'
                          ? 45
                          : selectedQuestionnaire === 'ORU-Vitals'
                            ? 70
                            : selectedQuestionnaire === 'PPR- Problems'
                              ? 50
                              : selectedQuestionnaire === 'RDS - Pharmacy Dispense'
                                ? 35
                                : 205}{' '}
                  minutes an agent will take to complete the assessment.
                </p>
              </div>

              {/* ROUND LABEL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  ROUND LABEL <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={roundLabel}
                  onChange={(e) => setRoundLabel(e.target.value)}
                  placeholder="e.g. Round 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] outline-none focus:border-[#cbd5e1]"
                />
              </div>

              {/* RECIPIENTS */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  RECIPIENTS <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  value={recipientInput}
                  disabled={recipients.length >= 5}
                  onChange={(e) => {
                    setRecipientInput(e.target.value)
                    if (recipientError) setRecipientError(null)
                  }}
                  onKeyDown={handleKeyDownRecipient}
                  placeholder={
                    recipients.length >= 5
                      ? 'Maximum 5 recipients reached'
                      : 'Enter email address and press Enter...'
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#0d212c] outline-none transition disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed ${recipientError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[#e2e8f0] focus:border-[#cbd5e1]'
                    }`}
                />

                <div
                  className={`flex items-center justify-between text-[11px] ${recipients.length > 5 ? 'text-red-600 font-bold' : 'text-[#64748b]'
                    }`}
                >
                  <span>Maximum 5 recipients can be added</span>
                  <span>{recipients.length}/5</span>
                </div>

                {recipients.length > 5 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-semibold flex items-center gap-2 mt-1 animate-in fade-in duration-150">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>
                      Maximum 5 recipients allowed. Please remove {recipients.length - 5}{' '}
                      recipient(s) to continue.
                    </span>
                  </div>
                )}

                {recipientError && (
                  <span className="text-xs font-medium text-red-600 animate-in fade-in duration-150">
                    {recipientError}
                  </span>
                )}

                {recipients.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {recipients.map((rec) => (
                      <span
                        key={rec}
                        className="inline-flex items-center gap-1.5 bg-[#f1f5f9] text-[#0d212c] text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#cbd5e1]"
                      >
                        <span>{rec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(rec)}
                          className="p-0.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-red-600 transition cursor-pointer border-0"
                          title="Remove recipient"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
                <button
                  onClick={onBack}
                  className="text-xs font-semibold text-[#64748b] hover:text-[#0d212c] cursor-pointer bg-transparent border-0"
                >
                  Cancel
                </button>
                <button
                  disabled={!isStep1Valid}
                  onClick={() => isStep1Valid && setCurrentStep(2)}
                  className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed border-0"
                >
                  <span>Continue to configure Agent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="p-1 rounded-lg hover:bg-[#f1f5f9] transition text-[#0d212c] cursor-pointer bg-transparent border-0"
                  title="Back to setup"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-extrabold text-[#0d212c]">Configure Agent</h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Choose Agent voice and when the session should begin.
                  </p>
                </div>
              </div>

              {/* AGENT VOICE */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  AGENT VOICE
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {primaryVoiceOptions.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${selectedVoice === v.id
                          ? 'border-[#36c0c9] bg-[#ddf7f9]/20'
                          : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                        }`}
                    >
                      {/* Requirement 6: Recommended chip */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <h4 className="font-bold text-xs text-[#0d212c] shrink-0">{v.label}</h4>
                          {v.recommended && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#ddf7f9] text-[#0f766e] whitespace-nowrap shrink-0">
                              Recommended
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => togglePlayVoice(v.id, e)}
                          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 border-0 ${playingVoiceId === v.id
                              ? 'bg-[#36c0c9] text-white shadow-xs'
                              : 'bg-[#f1f5f9] text-[#0d212c] hover:bg-[#e2e8f0]'
                            }`}
                          title={`Listen to ${v.label}'s voice`}
                        >
                          {playingVoiceId === v.id ? (
                            <Pause className="w-3.5 h-3.5 animate-pulse" />
                          ) : (
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>
                      </div>

                      <p className="text-[10px] text-[#64748b] leading-tight">{v.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllVoices(!showAllVoices)}
                  className="text-xs font-bold text-[#36c0c9] hover:underline text-left cursor-pointer pt-1 bg-transparent border-0"
                >
                  {showAllVoices ? 'Hide extra voices' : 'View all 10 voices'}
                </button>

                {showAllVoices && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                    {extraVoiceOptions.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedVoice(ev.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-2 ${selectedVoice === ev.id
                            ? 'bg-[#ddf7f9]/30 border-[#36c0c9] text-[#0d212c] font-bold'
                            : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-[#36c0c9]" />
                          <span>{ev.label}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => togglePlayVoice(ev.id, e)}
                          className="p-1 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0d212c] transition cursor-pointer border-0"
                        >
                          {playingVoiceId === ev.id ? (
                            <Pause className="w-3.5 h-3.5 text-[#36c0c9]" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WHEN */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  WHEN
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setTiming('now')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col gap-1 ${timing === 'now'
                        ? 'border-[#36c0c9] bg-[#ddf7f9]/20'
                        : 'border-[#e2e8f0] bg-white'
                      }`}
                  >
                    <span className="font-bold text-xs text-[#0d212c]">Start now</span>
                    <span className="text-[10px] text-[#64748b]">
                      Open the call room as soon as setup is complete.
                    </span>
                  </div>

                  <div
                    onClick={() => setTiming('later')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col gap-1 ${timing === 'later'
                        ? 'border-[#36c0c9] bg-[#ddf7f9]/20'
                        : 'border-[#e2e8f0] bg-white'
                      }`}
                  >
                    <span className="font-bold text-xs text-[#0d212c]">Schedule for later</span>
                    <span className="text-[10px] text-[#64748b]">
                      Choose a date and time for this session.
                    </span>
                  </div>
                </div>

                {/* Requirement 7: Start & End time fields note below inputs */}
                {timing === 'later' && (
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-3 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0d212c] mb-1">
                          Meeting date
                        </label>
                        <input
                          type="date"
                          value={scheduleDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0d212c] outline-none focus:border-[#cbd5e1]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#0d212c] mb-1">
                          Start time
                        </label>
                        <select
                          value={startTime}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0d212c] outline-none focus:border-[#cbd5e1] cursor-pointer font-medium"
                        >
                          <option value="">Select start time</option>
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#0d212c] mb-1">
                          End time
                        </label>
                        <select
                          disabled={!startTime}
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border bg-white text-xs outline-none focus:border-[#cbd5e1] transition ${!startTime
                              ? 'opacity-40 cursor-not-allowed bg-slate-50 border-[#e2e8f0] text-[#94a3b8]'
                              : isTimeInvalid
                                ? 'border-red-500 text-red-700 font-semibold cursor-pointer'
                                : 'border-[#e2e8f0] text-[#0d212c] cursor-pointer font-medium'
                            }`}
                        >
                          <option value="">
                            {!startTime ? 'Select start time first' : 'Select end time'}
                          </option>
                          {timeSlots
                            .filter(
                              (t) => !startTime || timeToMinutes(t) > timeToMinutes(startTime)
                            )
                            .map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                        </select>
                        {isTimeInvalid && (
                          <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>End time must be after the start time.</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {durationText && (
                      <div className="flex items-center gap-1.5 text-xs text-[#0d7280] font-bold bg-[#ddf7f9] px-3 py-1.5 rounded-xl self-start border border-[#b2ecf2]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Calculated duration: {durationText}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      <strong>Note:</strong> The assessment begins when the user selects “Start
                      Assessment” within the meeting. At this point, the system records the start
                      time and begins tracking the elapsed duration. Completion is expected to take
                      60–120 minutes and the total time is measured between the recorded start time
                      and end time, including any pauses.
                    </p>

                    {isTimeInvalid && (
                      <p className="text-[11px] font-semibold text-red-600">
                        End time must be after the start time.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* TIMEZONE */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                  TIMEZONE
                </span>
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0d212c] appearance-none outline-none focus:border-[#cbd5e1]"
                  >
                    <option value="GST - Gulf Standard Time (UTC+4)">
                      GST - Gulf Standard Time (UTC+4)
                    </option>
                    <option value="Asia/Riyadh - GMT+3:00">Asia/Riyadh - GMT+3:00</option>
                    <option value="Asia/Calcutta - GMT+5:30">Asia/Calcutta - GMT+5:30</option>
                    <option value="UTC - GMT+0:00">UTC - GMT+0:00</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#64748b] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* ADVANCED SETTINGS */}
              <div className="border border-[#e2e8f0] rounded-2xl bg-white overflow-hidden shadow-xs">
                <div
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#f8fafc] transition"
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-4 h-4 text-[#64748b]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#0d212c]">Advanced settings</span>
                      <span className="text-[11px] text-[#64748b]">
                        Document reminders and room behaviour
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
                    <span>{nudgeWaitSeconds}s reminder</span>
                    <ChevronUp
                      className={`w-4 h-4 transition-transform ${showAdvancedSettings ? '' : 'rotate-180'}`}
                    />
                  </div>
                </div>

                {showAdvancedSettings && (
                  <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-col gap-2">
                    <label className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                      UPLOAD WAIT BEFORE NUDGE (SECONDS)
                    </label>
                    <input
                      type="number"
                      value={nudgeWaitSeconds}
                      onChange={(e) => setNudgeWaitSeconds(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs font-bold text-[#0d212c] outline-none focus:border-[#cbd5e1]"
                    />
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      How long Agent waits after asking for a document before nudging the room.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-[#64748b] hover:text-[#0d212c] cursor-pointer bg-transparent border-0"
                >
                  Back to setup
                </button>
                <button
                  disabled={!isStep2Valid}
                  onClick={() => {
                    if (isStep2Valid) {
                      setHasCompletedStep2(true)
                      setCurrentStep(3)
                    }
                  }}
                  className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed border-0"
                >
                  <span>Continue to review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-6 h-full">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="p-1 rounded-lg hover:bg-[#f1f5f9] transition text-[#0d212c] cursor-pointer bg-transparent border-0"
                    title="Back to voice config"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-base font-extrabold text-[#0d212c]">Review & launch</h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Confirm configuration and initiate automated facility assessment call.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-[#e2e8f0]/80 flex flex-col text-xs">
                  <div className="py-3 flex justify-between">
                    <span className="text-[#64748b]">Target facility:</span>
                    <span className="font-bold text-[#0d212c]">{vendor.name}</span>
                  </div>
                  {recipients.length > 0 && (
                    <div className="py-3 flex items-start justify-between gap-3">
                      <span className="text-[#64748b] shrink-0 pt-0.5">Recipients:</span>
                      <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        {recipients.map((recEmail, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-[#f1f5f9] text-[#0d212c] font-medium px-2 py-0.5 rounded-md text-[11px] border border-[#e2e8f0] truncate max-w-[180px]"
                            title={recEmail}
                          >
                            {recEmail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="py-3 flex justify-between">
                    <span className="text-[#64748b]">Selected dataset:</span>
                    <span className="font-bold text-[#0d212c]">{selectedQuestionnaire || 'ADT-Family History'}</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-[#64748b]">Agent Voice:</span>
                    <span className="font-bold text-[#0d212c]">{selectedVoice}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-[#64748b] hover:text-[#0d212c] cursor-pointer bg-transparent border-0"
                >
                  Back to voice config
                </button>
                <Button
                  onClick={() => setIsDispatched(true)}
                  className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer"
                >
                  Launch assessment call
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: CALL SUMMARY BOX */}
        <div
          className={`lg:col-span-4 flex flex-col gap-6 ${currentStep === 3 ? 'h-full' : 'h-auto'}`}
        >
          <div
            className={`bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 text-xs ${currentStep === 3 ? 'h-full justify-between' : 'h-auto justify-start'
              }`}
          >
            <span className="font-bold text-[#0d212c]">Call summary</span>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="w-9 h-9 rounded-xl bg-[#ddf7f9] text-[#0d7280] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#36c0c9]/30">
                {vendor.name ? vendor.name.slice(0, 2).toUpperCase() : 'FC'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[#0d212c] truncate">{vendor.name}</span>
                <span className="text-[11px] text-[#64748b] truncate flex items-center gap-1.5 mt-0.5">
                  <CountryFlag country={vendor.country} />
                  <span>{vendor.country}</span>
                  <span>•</span>
                  <span>{vendor.domain}</span>
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#e2e8f0]/60 flex flex-col">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748b]">CALL TYPE</span>
                <span className="font-bold text-[#0d212c]">Assessment round</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748b]">TESTCASES</span>
                <span className="font-bold text-[#0d212c]">
                  {selectedQuestionnaire ? includedCount : '-'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-[#64748b] shrink-0">MEETING TIME</span>
                <span className="font-bold text-[#0d212c] text-right truncate">
                  {formattedTimeRange}
                </span>
              </div>
            </div>

            <div className="border-t border-[#e2e8f0] pt-3 flex flex-col gap-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-[#64748b]">READINESS</span>
                <span className="font-bold text-[#0d212c]">
                  {isStep1Valid
                    ? currentStep === 3
                      ? '3 of 3 complete'
                      : `${currentStep} of 3 complete`
                    : '0 of 3 complete'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Setup</span>
                  <span className={isStep1Valid ? 'text-[#137333] font-bold' : 'text-[#64748b]'}>
                    {isStep1Valid ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Configure Agent</span>
                  <span className={currentStep > 2 ? 'text-[#137333] font-bold' : 'text-[#64748b]'}>
                    {currentStep > 2 ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Review & launch</span>
                  <span className="text-[#64748b]">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATASET DETAILS PREVIEW LARGE MODAL OVERLAY */}
      {showDatasetPreviewModal && (
        <div className="fixed inset-0 z-[100] bg-[#0d212c]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#e2e8f0] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="bg-white px-6 py-5 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-extrabold text-[#0d212c]">
                {selectedQuestionnaire || 'Dataset Details'}
              </h2>
              <button
                onClick={() => setShowDatasetPreviewModal(false)}
                className="p-1.5 rounded-xl border-0 text-[#64748b] hover:text-[#0d212c] transition cursor-pointer bg-transparent outline-none shadow-none focus:outline-none"
                title="Close preview"
              >
                <X className="w-5 h-5 stroke-current bg-transparent fill-none border-0" />
              </button>
            </div>

            {/* Modal Subheader Bar */}
            <div className="bg-white px-6 py-3.5 border-b border-[#e2e8f0] flex flex-col gap-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-[#0d212c]">Testcases</h3>

                {/* Search filter */}
                <div className="relative w-64 sm:w-72">
                  <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search testcases..."
                    value={datasetSearchQuery}
                    onChange={(e) => setDatasetSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] bg-white outline-none focus:border-[#36c0c9]"
                  />
                </div>
              </div>

              {/* Select All Action & Chips Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleSelectAllDraftTestcases}
                  className="bg-transparent border-0 p-0 shadow-none outline-none flex items-center gap-2.5 text-xs font-bold text-[#0d212c] hover:text-[#0d7280] transition cursor-pointer select-none"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${allDraftTestcasesIncluded
                        ? 'border-[#36c0c9] bg-[#36c0c9] text-white'
                        : 'border-[#cbd5e1] bg-white'
                      }`}
                  >
                    {allDraftTestcasesIncluded && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span>Select all testcase during assessment</span>
                </button>

                {/* Chips Legend */}
                <div className="flex items-center gap-3 text-[11px] text-[#64748b] bg-white px-3.5 py-1.5 rounded-xl border border-[#e2e8f0] shadow-2xs self-start sm:self-auto">
                  <span className="font-bold text-[#0d212c]">Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#0d212c] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[10px]">
                      TC-01
                    </span>
                    <span>Message Type</span>
                  </div>
                  <span className="text-[#cbd5e1]">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                      Category
                    </span>
                    <span>Type - Accessible Section</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testcases List Table with Horizontal Line Separators */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e2e8f0]">
              {sampleDatasetTestcases
                .filter(
                  (tc) =>
                    tc.title.toLowerCase().includes(datasetSearchQuery.toLowerCase()) ||
                    tc.code.toLowerCase().includes(datasetSearchQuery.toLowerCase())
                )
                .map((tc) => {
                  const isIncluded = !!draftTestcaseInclusions[tc.id]

                  return (
                    <div
                      key={tc.id}
                      className={`py-5 px-6 transition flex items-start gap-4 ${isIncluded ? 'bg-white' : 'bg-slate-50/50 opacity-75'
                        }`}
                    >
                      {/* Left side: Inclusion Checkbox */}
                      <div className="flex items-center shrink-0 pt-0.5" title="Include testcase during assessment">
                        <Checkbox
                          checked={isIncluded}
                          onChange={() => toggleDraftTestcaseInclusion(tc.id)}
                        />
                      </div>

                      {/* Right side: Testcase metadata (Read-only / Non-editable) */}
                      <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-extrabold text-[#0d212c] bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {tc.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tc.type === 'Problems'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : tc.type === 'Sensitive Info'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : tc.type === 'Meds Dispensing'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}
                          >
                            {tc.type}
                          </span>
                        </div>

                        {/* Title & Description (Non-editable text) */}
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-xs font-extrabold text-[#0d212c]">
                            {tc.title}
                          </h4>
                          <p className="text-[11px] text-[#64748b] leading-relaxed">
                            {tc.responseCue}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2.5 text-xs text-[#64748b] flex-wrap">
                <span>
                  Included in Assessment: <strong className="text-[#0d212c] font-bold">{draftIncludedCount} / 7 testcases</strong>
                </span>
                <span>|</span>
                <span>
                  Estimated Duration: <strong className="text-[#0d212c] font-bold">{estimatedDuration}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setShowDatasetPreviewModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#0d212c] border border-[#cbd5e1] hover:bg-slate-50 cursor-pointer bg-white transition"
                >
                  Close preview
                </button>
                <button
                  id="save-dataset-preview-btn"
                  onClick={() => {
                    setTestcaseInclusions(draftTestcaseInclusions)
                    setShowDatasetPreviewModal(false)
                  }}
                  disabled={draftIncludedCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#36c0c9] text-white font-bold text-xs hover:bg-[#0d7280] transition cursor-pointer shadow-2xs border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderScheduleAndCancelModals()}
    </div>
  )
}
