'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  PhoneCall,
  BarChart2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Check,
  RefreshCw,
  LineChart,
  Menu,
} from 'lucide-react'

// Week definition interface
export interface WeekOption {
  id: string
  label: string
  dateRange: string
  shortRange: string
  isCurrent?: boolean
  outputCalls: number
  tokensM: number
  tokenBreakdown?: {
    input: string
    output: string
    voiceInput: string
    voiceOutput: string
  }
  assessments: {
    completed: { id: string; name: string; round: string }[]
    scheduled: { id: string; name: string; round: string }[]
    finalised: { id: string; name: string; round: string }[]
  }
}

// 5 Weeks of October 2026 data using the authentic assessment names from the home page table
const WEEKS_DATA: WeekOption[] = [
  {
    id: 'week-1',
    label: 'Sep 28 – Oct 4, 2026',
    dateRange: 'Sep 28 – Oct 4, 2026',
    shortRange: 'Sep 28 – Oct 4, 2026',
    isCurrent: false,
    outputCalls: 14,
    tokensM: 12.8,
    tokenBreakdown: {
      input: '5.6M',
      output: '4.4M',
      voiceInput: '1.8M',
      voiceOutput: '1.0M',
    },
    assessments: {
      completed: [
        { id: 'c1', name: 'Cleveland Clinic Abu Dhabi | Clinical EHR & Patient Records Dataset', round: 'Round 1' },
        { id: 'c2', name: 'Danat Al Emarat Hospital | PACS & Radiology Imaging Dataset', round: 'Round 2' },
        { id: 'c3', name: 'Healthpoint Hospital | Lab Telemetry & Diagnostic Sync Dataset', round: 'Initial Review' },
        { id: 'c4', name: 'Imperial College London Diabetes Centre | HIPAA & Healthcare Data Compliance Dataset', round: 'Follow-up Audit' },
        { id: 'c5', name: 'Al Rahba Hospital | Third-Party Cloud API Integration Dataset', round: 'Round 3' },
      ],
      scheduled: [
        { id: 's1', name: 'Sheikh Shakhbout Medical City (SSMC) | Pharmacy & Medication Inventory Dataset', round: 'Stage 2 Audit' },
        { id: 's2', name: 'Medica Diagnostic Center | UAE DOH Health Data Residency Dataset', round: 'Round 2 - Compliance' },
        { id: 's3', name: 'Cleveland Clinic Abu Dhabi | Third-Party Cloud API Integration Dataset', round: 'Round 1' },
        { id: 's4', name: 'Danat Al Emarat Hospital | Clinical AI Safety & Ethics Dataset', round: 'Round 2' },
        { id: 's5', name: 'Healthpoint Hospital | Pharmacy & Medication Inventory Dataset', round: 'Follow-up' },
      ],
      finalised: [
        { id: 'f1', name: 'Moorfields Eye Hospital Abu Dhabi | SOC 2 Type II Facility Security Dataset', round: 'Round 1 - Technical' },
        { id: 'f2', name: 'M42 Genomic Sciences Center | Cloud Infrastructure Audit Dataset', round: 'Stage 1 Discovery' },
        { id: 'f3', name: 'Global Health Telemetry Unit | Business Continuity & Disaster Recovery Dataset', round: 'Final Review' },
        { id: 'f4', name: 'Healthpoint Hospital | ISO 27001 ISMS Healthcare Checklist', round: 'Final Signoff' },
      ],
    },
  },
  {
    id: 'week-2',
    label: 'Oct 5 – Oct 11, 2026',
    dateRange: 'Oct 5 – Oct 11, 2026',
    shortRange: 'Oct 5 – 11, 2026',
    isCurrent: false,
    outputCalls: 17,
    tokensM: 15.4,
    tokenBreakdown: {
      input: '6.8M',
      output: '5.3M',
      voiceInput: '2.1M',
      voiceOutput: '1.2M',
    },
    assessments: {
      completed: [
        { id: 'c1', name: 'Cleveland Clinic Abu Dhabi | Clinical EHR & Patient Records Dataset', round: 'Round 1' },
        { id: 'c2', name: 'Danat Al Emarat Hospital | PACS & Radiology Imaging Dataset', round: 'Round 2' },
        { id: 'c3', name: 'Healthpoint Hospital | Lab Telemetry & Diagnostic Sync Dataset', round: 'Initial Review' },
        { id: 'c4', name: 'Imperial College London Diabetes Centre | HIPAA & Healthcare Data Compliance Dataset', round: 'Follow-up Audit' },
        { id: 'c5', name: 'Al Rahba Hospital | Third-Party Cloud API Integration Dataset', round: 'Round 3' },
        { id: 'c6', name: 'Amana Healthcare Rehabilitation | ISO 27001 ISMS Healthcare Checklist', round: 'Annual Re-evaluation' },
      ],
      scheduled: [
        { id: 's1', name: 'Sheikh Shakhbout Medical City (SSMC) | Pharmacy & Medication Inventory Dataset', round: 'Stage 2 Audit' },
        { id: 's2', name: 'Medica Diagnostic Center | UAE DOH Health Data Residency Dataset', round: 'Round 2 - Compliance' },
        { id: 's3', name: 'Cleveland Clinic Abu Dhabi | Third-Party Cloud API Integration Dataset', round: 'Round 1' },
        { id: 's4', name: 'Danat Al Emarat Hospital | Clinical AI Safety & Ethics Dataset', round: 'Round 2' },
        { id: 's5', name: 'Healthpoint Hospital | Pharmacy & Medication Inventory Dataset', round: 'Follow-up' },
        { id: 's6', name: 'Moorfields Eye Hospital Abu Dhabi | HIPAA & Healthcare Data Compliance Dataset', round: 'Stage 1 Discovery' },
      ],
      finalised: [
        { id: 'f1', name: 'Moorfields Eye Hospital Abu Dhabi | SOC 2 Type II Facility Security Dataset', round: 'Round 1 - Technical' },
        { id: 'f2', name: 'M42 Genomic Sciences Center | Cloud Infrastructure Audit Dataset', round: 'Stage 1 Discovery' },
        { id: 'f3', name: 'Global Health Telemetry Unit | Business Continuity & Disaster Recovery Dataset', round: 'Final Review' },
        { id: 'f4', name: 'Healthpoint Hospital | ISO 27001 ISMS Healthcare Checklist', round: 'Final Signoff' },
        { id: 'f5', name: 'Danat Al Emarat Hospital | UAE DOH Health Data Residency Dataset', round: 'Technical Final' },
      ],
    },
  },
  {
    id: 'week-3',
    label: 'Oct 12 – Oct 18, 2026',
    dateRange: 'Oct 12 – Oct 18, 2026',
    shortRange: 'Oct 12 – 18, 2026',
    isCurrent: true,
    outputCalls: 20,
    tokensM: 18.6,
    tokenBreakdown: {
      input: '8.2M',
      output: '6.4M',
      voiceInput: '2.5M',
      voiceOutput: '1.5M',
    },
    assessments: {
      completed: [
        { id: 'c1', name: 'Cleveland Clinic Abu Dhabi | Clinical EHR & Patient Records Dataset', round: 'Round 1' },
        { id: 'c2', name: 'Danat Al Emarat Hospital | PACS & Radiology Imaging Dataset', round: 'Round 2' },
        { id: 'c3', name: 'Healthpoint Hospital | Lab Telemetry & Diagnostic Sync Dataset', round: 'Initial Review' },
        { id: 'c4', name: 'Imperial College London Diabetes Centre | HIPAA & Healthcare Data Compliance Dataset', round: 'Follow-up Audit' },
        { id: 'c5', name: 'Al Rahba Hospital | Third-Party Cloud API Integration Dataset', round: 'Round 3' },
        { id: 'c6', name: 'Amana Healthcare Rehabilitation | ISO 27001 ISMS Healthcare Checklist', round: 'Annual Re-evaluation' },
        { id: 'c7', name: 'Capital Health Screening Centre | Clinical AI Safety & Ethics Dataset', round: 'Pre-onboarding' },
      ],
      scheduled: [
        { id: 's1', name: 'Sheikh Shakhbout Medical City (SSMC) | Pharmacy & Medication Inventory Dataset', round: 'Stage 2 Audit' },
        { id: 's2', name: 'Medica Diagnostic Center | UAE DOH Health Data Residency Dataset', round: 'Round 2 - Compliance' },
        { id: 's3', name: 'Cleveland Clinic Abu Dhabi | Third-Party Cloud API Integration Dataset', round: 'Round 1' },
        { id: 's4', name: 'Danat Al Emarat Hospital | Clinical AI Safety & Ethics Dataset', round: 'Round 2' },
        { id: 's5', name: 'Healthpoint Hospital | Pharmacy & Medication Inventory Dataset', round: 'Follow-up' },
        { id: 's6', name: 'Moorfields Eye Hospital Abu Dhabi | HIPAA & Healthcare Data Compliance Dataset', round: 'Stage 1 Discovery' },
      ],
      finalised: [
        { id: 'f1', name: 'Moorfields Eye Hospital Abu Dhabi | SOC 2 Type II Facility Security Dataset', round: 'Round 1 - Technical' },
        { id: 'f2', name: 'M42 Genomic Sciences Center | Cloud Infrastructure Audit Dataset', round: 'Stage 1 Discovery' },
        { id: 'f3', name: 'Global Health Telemetry Unit | Business Continuity & Disaster Recovery Dataset', round: 'Final Review' },
        { id: 'f4', name: 'Healthpoint Hospital | ISO 27001 ISMS Healthcare Checklist', round: 'Final Signoff' },
        { id: 'f5', name: 'Danat Al Emarat Hospital | UAE DOH Health Data Residency Dataset', round: 'Technical Final' },
        { id: 'f6', name: 'Sheikh Shakhbout Medical City (SSMC) | Clinical EHR & Patient Records Dataset', round: 'Final Signoff' },
      ],
    },
  },
  {
    id: 'week-4',
    label: 'Oct 19 – Oct 25, 2026',
    dateRange: 'Oct 19 – Oct 25, 2026',
    shortRange: 'Oct 19 – 25, 2026',
    isCurrent: false,
    outputCalls: 22,
    tokensM: 20.2,
    tokenBreakdown: {
      input: '8.9M',
      output: '7.0M',
      voiceInput: '2.7M',
      voiceOutput: '1.6M',
    },
    assessments: {
      completed: [
        { id: 'c1', name: 'Cleveland Clinic Abu Dhabi | Clinical EHR & Patient Records Dataset', round: 'Round 1' },
        { id: 'c2', name: 'Danat Al Emarat Hospital | PACS & Radiology Imaging Dataset', round: 'Round 2' },
        { id: 'c3', name: 'Healthpoint Hospital | Lab Telemetry & Diagnostic Sync Dataset', round: 'Initial Review' },
        { id: 'c4', name: 'Imperial College London Diabetes Centre | HIPAA & Healthcare Data Compliance Dataset', round: 'Follow-up Audit' },
        { id: 'c5', name: 'Al Rahba Hospital | Third-Party Cloud API Integration Dataset', round: 'Round 2' },
        { id: 'c6', name: 'Amana Healthcare Rehabilitation | ISO 27001 ISMS Healthcare Checklist', round: 'Round 3' },
      ],
      scheduled: [
        { id: 's1', name: 'Sheikh Shakhbout Medical City (SSMC) | Pharmacy & Medication Inventory Dataset', round: 'Stage 2 Audit' },
        { id: 's2', name: 'Medica Diagnostic Center | UAE DOH Health Data Residency Dataset', round: 'Round 2 - Compliance' },
        { id: 's3', name: 'Cleveland Clinic Abu Dhabi | Third-Party Cloud API Integration Dataset', round: 'Round 2' },
        { id: 's4', name: 'Danat Al Emarat Hospital | Clinical AI Safety & Ethics Dataset', round: 'Round 1' },
      ],
      finalised: [
        { id: 'f1', name: 'Moorfields Eye Hospital Abu Dhabi | SOC 2 Type II Facility Security Dataset', round: 'Round 1 - Technical' },
        { id: 'f2', name: 'M42 Genomic Sciences Center | Cloud Infrastructure Audit Dataset', round: 'Stage 1 Discovery' },
        { id: 'f3', name: 'Global Health Telemetry Unit | Business Continuity & Disaster Recovery Dataset', round: 'Final Review' },
        { id: 'f4', name: 'Healthpoint Hospital | ISO 27001 ISMS Healthcare Checklist', round: 'Final Signoff' },
      ],
    },
  },
  {
    id: 'week-5',
    label: 'Oct 26 – Nov 1, 2026',
    dateRange: 'Oct 26 – Nov 1, 2026',
    shortRange: 'Oct 26 – Nov 1, 2026',
    isCurrent: false,
    outputCalls: 19,
    tokensM: 17.5,
    tokenBreakdown: {
      input: '7.7M',
      output: '6.0M',
      voiceInput: '2.4M',
      voiceOutput: '1.4M',
    },
    assessments: {
      completed: [
        { id: 'c1', name: 'Cleveland Clinic Abu Dhabi | Clinical EHR & Patient Records Dataset', round: 'Round 1' },
        { id: 'c2', name: 'Danat Al Emarat Hospital | PACS & Radiology Imaging Dataset', round: 'Round 2' },
        { id: 'c3', name: 'Healthpoint Hospital | Lab Telemetry & Diagnostic Sync Dataset', round: 'Initial Review' },
        { id: 'c4', name: 'Imperial College London Diabetes Centre | HIPAA & Healthcare Data Compliance Dataset', round: 'Follow-up Audit' },
      ],
      scheduled: [
        { id: 's1', name: 'Sheikh Shakhbout Medical City (SSMC) | Pharmacy & Medication Inventory Dataset', round: 'Stage 2 Audit' },
        { id: 's2', name: 'Medica Diagnostic Center | UAE DOH Health Data Residency Dataset', round: 'Round 2 - Compliance' },
        { id: 's3', name: 'Cleveland Clinic Abu Dhabi | Third-Party Cloud API Integration Dataset', round: 'Round 2' },
        { id: 's4', name: 'Danat Al Emarat Hospital | Clinical AI Safety & Ethics Dataset', round: 'Round 1' },
        { id: 's5', name: 'Healthpoint Hospital | Pharmacy & Medication Inventory Dataset', round: 'Stage 1 Discovery' },
      ],
      finalised: [
        { id: 'f1', name: 'Moorfields Eye Hospital Abu Dhabi | SOC 2 Type II Facility Security Dataset', round: 'Round 1 - Technical' },
        { id: 'f2', name: 'M42 Genomic Sciences Center | Cloud Infrastructure Audit Dataset', round: 'Stage 1 Discovery' },
        { id: 'f3', name: 'Global Health Telemetry Unit | Business Continuity & Disaster Recovery Dataset', round: 'Final Review' },
        { id: 'f4', name: 'Healthpoint Hospital | ISO 27001 ISMS Healthcare Checklist', round: 'Final Signoff' },
      ],
    },
  },
]

interface NumericStepperInputProps {
  value: number
  onChange: (val: number) => void
  unit: string
  prefix?: string
  step?: number
  min?: number
  max?: number
  precision?: number
}

const NumericStepperInput: React.FC<NumericStepperInputProps> = ({
  value,
  onChange,
  unit,
  prefix,
  step = 1,
  min = 0,
  max = 9999,
  precision = 0,
}) => {
  const formatVal = (v: number) => (precision > 0 ? v.toFixed(precision) : String(v))
  const [localStr, setLocalStr] = useState<string>(() => formatVal(value))
  const [prevVal, setPrevVal] = useState<number>(value)

  if (prevVal !== value) {
    setPrevVal(value)
    setLocalStr(formatVal(value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setLocalStr(raw)
    const num = parseFloat(raw)
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)))
    } else if (raw === '') {
      onChange(min)
    }
  }

  const handleBlur = () => {
    const num = parseFloat(localStr)
    if (isNaN(num)) {
      setLocalStr(formatVal(min))
      onChange(min)
    } else {
      const clamped = Math.max(min, Math.min(max, num))
      setLocalStr(formatVal(clamped))
      onChange(clamped)
    }
  }

  const increment = () => {
    const next = Math.min(max, parseFloat((value + step).toFixed(precision || 2)))
    onChange(next)
    setLocalStr(formatVal(next))
  }

  const decrement = () => {
    const next = Math.max(min, parseFloat((value - step).toFixed(precision || 2)))
    onChange(next)
    setLocalStr(formatVal(next))
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-[#e2e8f0] rounded-lg bg-white px-2 py-1 w-[92px] justify-between transition focus-within:border-[#36c0c9] focus-within:bg-[#f8fafc] shadow-2xs">
        {prefix && (
          <span className="text-xs text-[#94a3b8] font-normal mr-0.5 select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={localStr}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-full text-xs font-semibold text-[#0d212c] text-center outline-none bg-transparent"
        />
        <div className="flex flex-col shrink-0 ml-1">
          <button
            type="button"
            onClick={increment}
            className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
            aria-label="Increase"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
            aria-label="Decrease"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
      <span className="text-xs text-[#64748b] font-normal w-10 text-left select-none">
        {unit}
      </span>
    </div>
  )
}

export const UsageInsightsScreen: React.FC = () => {
  // Current active week index (default: week-3 / index 2)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(2)
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false)
  const weekDropdownRef = useRef<HTMLDivElement>(null)

  const currentWeek = WEEKS_DATA[selectedWeekIndex]

  // Assumptions input states (staged/editing)
  const [hoursSpent, setHoursSpent] = useState<number>(4)
  const [costPerHour, setCostPerHour] = useState<number>(30)
  const [inputTokenPrice, setInputTokenPrice] = useState<number>(1.25)
  const [outputTokenPrice, setOutputTokenPrice] = useState<number>(10.0)
  const [inputVoiceTokenPrice, setInputVoiceTokenPrice] = useState<number>(10.0)
  const [outputVoiceTokenPrice, setOutputVoiceTokenPrice] = useState<number>(20.0)

  // Applied values used for calculations
  const [appliedHoursSpent, setAppliedHoursSpent] = useState<number>(4)
  const [appliedCostPerHour, setAppliedCostPerHour] = useState<number>(30)
  const [appliedInputTokenPrice, setAppliedInputTokenPrice] = useState<number>(1.25)
  const [appliedOutputTokenPrice, setAppliedOutputTokenPrice] = useState<number>(10.0)
  const [appliedInputVoiceTokenPrice, setAppliedInputVoiceTokenPrice] = useState<number>(10.0)
  const [appliedOutputVoiceTokenPrice, setAppliedOutputVoiceTokenPrice] = useState<number>(20.0)

  // View mode for Right Card (Graph view vs Data view) - Default to Graph view
  const [roiViewMode, setRoiViewMode] = useState<'graph' | 'data'>('graph')
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)

  // Recalculation animation state
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false)

  // Single expanded toggle for all columns in "Assessments by Status"
  const [isExpandedAll, setIsExpandedAll] = useState<boolean>(false)

  // Detect unapplied changes
  const hasUnappliedChanges = useMemo(() => {
    return (
      hoursSpent !== appliedHoursSpent ||
      costPerHour !== appliedCostPerHour ||
      inputTokenPrice !== appliedInputTokenPrice ||
      outputTokenPrice !== appliedOutputTokenPrice ||
      inputVoiceTokenPrice !== appliedInputVoiceTokenPrice ||
      outputVoiceTokenPrice !== appliedOutputVoiceTokenPrice
    )
  }, [
    hoursSpent,
    costPerHour,
    inputTokenPrice,
    outputTokenPrice,
    inputVoiceTokenPrice,
    outputVoiceTokenPrice,
    appliedHoursSpent,
    appliedCostPerHour,
    appliedInputTokenPrice,
    appliedOutputTokenPrice,
    appliedInputVoiceTokenPrice,
    appliedOutputVoiceTokenPrice,
  ])

  // Close week dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        weekDropdownRef.current &&
        !weekDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWeekDropdownOpen(false)
      }
    }
    if (isWeekDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isWeekDropdownOpen])

  // Week step navigation
  const handlePrevWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex((prev) => prev - 1)
    }
  }

  const handleNextWeek = () => {
    if (selectedWeekIndex < WEEKS_DATA.length - 1) {
      setSelectedWeekIndex((prev) => prev + 1)
    }
  }

  // Recalculate action with 800ms animation
  const handleRecalculate = () => {
    if (!hasUnappliedChanges || isRecalculating) return
    setIsRecalculating(true)

    setTimeout(() => {
      setAppliedHoursSpent(hoursSpent)
      setAppliedCostPerHour(costPerHour)
      setAppliedInputTokenPrice(inputTokenPrice)
      setAppliedOutputTokenPrice(outputTokenPrice)
      setAppliedInputVoiceTokenPrice(inputVoiceTokenPrice)
      setAppliedOutputVoiceTokenPrice(outputVoiceTokenPrice)
      setIsRecalculating(false)
    }, 800)
  }

  // Financial impact calculation rules
  // Manual Cost = Outputs × Manual Hours × Cost per Hour
  const totalHours = currentWeek.outputCalls * appliedHoursSpent
  const manualCost = totalHours * appliedCostPerHour

  // AI Cost across categories:
  // Text Input tokens (40%), Text Output tokens (15%), Voice Input tokens (25%), Voice Output tokens (20%)
  const tokensM = currentWeek.tokensM
  const inputTokensM = tokensM * 0.4
  const outputTokensM = tokensM * 0.15
  const voiceInputTokensM = tokensM * 0.25
  const voiceOutputTokensM = tokensM * 0.2

  const rawAICost =
    inputTokensM * appliedInputTokenPrice +
    outputTokensM * appliedOutputTokenPrice +
    voiceInputTokensM * appliedInputVoiceTokenPrice +
    voiceOutputTokensM * appliedOutputVoiceTokenPrice
  const aiCost = Math.round(rawAICost)

  // Estimated ROI = Manual Cost ÷ AI Cost
  const roiMultiplier = rawAICost > 0 ? Math.round(manualCost / rawAICost) : 0

  // Estimated Savings = Manual Cost − AI Cost
  const rawSavings = manualCost - rawAICost
  const estimatedSavings = Math.round(rawSavings)

  // Comparison Historical Data for Line Chart matching current month's weeks
  const comparisonData = useMemo(() => {
    return WEEKS_DATA.map((w, idx) => {
      const isSelected = idx === selectedWeekIndex
      if (isSelected) {
        return {
          id: w.id,
          date: w.shortRange.replace(', 2026', ''),
          fullLabel: w.label,
          manual: manualCost,
          ai: Math.round(rawAICost * 100) / 100,
          isCurrent: w.isCurrent,
          isSelected: true,
        }
      }
      const outputs = w.outputCalls
      const mCost = Math.round(outputs * appliedHoursSpent * appliedCostPerHour)
      const t = w.tokensM
      const wAiCost =
        Math.round(
          (t * 0.4 * appliedInputTokenPrice +
            t * 0.15 * appliedOutputTokenPrice +
            t * 0.25 * appliedInputVoiceTokenPrice +
            t * 0.2 * appliedOutputVoiceTokenPrice) *
            100
        ) / 100

      return {
        id: w.id,
        date: w.shortRange.replace(', 2026', ''),
        fullLabel: w.label,
        manual: mCost,
        ai: wAiCost,
        isCurrent: w.isCurrent,
        isSelected: false,
      }
    })
  }, [
    selectedWeekIndex,
    manualCost,
    rawAICost,
    appliedHoursSpent,
    appliedCostPerHour,
    appliedInputTokenPrice,
    appliedOutputTokenPrice,
    appliedInputVoiceTokenPrice,
    appliedOutputVoiceTokenPrice,
  ])

  const hasMoreItems =
    currentWeek.assessments.completed.length > 4 ||
    currentWeek.assessments.scheduled.length > 4 ||
    currentWeek.assessments.finalised.length > 4

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-[#0d212c] font-sans antialiased px-6 py-4 flex flex-col gap-8">
      {/* ── 1. HEADER & WEEKLY FILTER FLOW ────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0d212c]">Overview</h2>

          {/* Right: Week navigation & filter controls */}
          <div className="flex items-center gap-2 relative">
            {/* Previous Week Chevron */}
            <button
              type="button"
              onClick={handlePrevWeek}
              disabled={selectedWeekIndex === 0}
              className="w-8 h-8 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0d212c] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer shadow-2xs"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Week Dropdown Selector */}
            <div ref={weekDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsWeekDropdownOpen((prev) => !prev)}
                className="h-8 px-3 rounded-lg border border-[#e2e8f0] bg-white flex items-center gap-2 text-xs font-semibold text-[#0d212c] hover:border-[#cbd5e1] transition cursor-pointer shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-[#36c0c9]" />
                <span>{currentWeek.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#64748b] transition-transform duration-200 ${
                    isWeekDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Week Dropdown Menu */}
              {isWeekDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                    October 2026 Weeks
                  </div>
                  {WEEKS_DATA.map((week, idx) => {
                    const isSelected = idx === selectedWeekIndex
                    return (
                      <button
                        key={week.id}
                        type="button"
                        onClick={() => {
                          setSelectedWeekIndex(idx)
                          setIsWeekDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-left text-xs transition cursor-pointer border-0 ${
                          isSelected
                            ? 'bg-[#ddf7f9]/50 text-[#0d212c] font-semibold'
                            : 'hover:bg-slate-50 text-[#0d212c] font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{week.label}</span>
                          {week.isCurrent && (
                            <span className="bg-[#ddf7f9] text-[#009299] text-[10px] font-semibold px-1.5 py-0.2 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#36c0c9] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Next Week Chevron */}
            <button
              type="button"
              onClick={handleNextWeek}
              disabled={selectedWeekIndex === WEEKS_DATA.length - 1}
              className="w-8 h-8 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0d212c] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer shadow-2xs"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Info Icon with Tooltip */}
            <div className="relative group flex items-center">
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#64748b] transition cursor-pointer border-0 bg-transparent"
                aria-label="Week selection info"
              >
                <Info className="w-4 h-4" />
              </button>
              {/* Tooltip */}
              <div className="pointer-events-none absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50">
                <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  Week selection is valid for current month only
                </div>
                <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 mr-3" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. TOP 3 KPI CARDS (Exactly 110px height, Title increased by 2px to 14px) ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Output Generated */}
          <div className="h-[110px] bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#0d212c]" />
                <span className="text-[14px] font-semibold text-[#0d212c]">Output Generated</span>
              </div>
              <span className="text-[24px] font-semibold text-[#36c0c9] leading-none">
                {currentWeek.outputCalls}
              </span>
            </div>
            <div className="border-t border-[#e2e8f0] pt-2">
              <span className="text-[11px] text-[#64748b] font-normal">
                {currentWeek.outputCalls} Assesment calls
              </span>
            </div>
          </div>

          {/* Card 2: Tokens Consumed */}
          <div className="h-[110px] bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#0d212c]" />
                <span className="text-[14px] font-semibold text-[#0d212c]">Tokens Consumed</span>
              </div>
              <span className="text-[24px] font-semibold text-[#36c0c9] leading-none">
                {currentWeek.tokensM}M
              </span>
            </div>
            <div className="border-t border-[#e2e8f0] pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#64748b] font-normal">Input</span>
                <span className="text-[11px] font-bold text-[#0d212c]">
                  {currentWeek.tokenBreakdown?.input ?? '8.2M'}
                </span>
              </div>
              <div className="h-3 w-px bg-[#e2e8f0] shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#64748b] font-normal">Output</span>
                <span className="text-[11px] font-bold text-[#0d212c]">
                  {currentWeek.tokenBreakdown?.output ?? '6.4M'}
                </span>
              </div>
              <div className="h-3 w-px bg-[#e2e8f0] shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#64748b] font-normal">Voice Input</span>
                <span className="text-[11px] font-bold text-[#0d212c]">
                  {currentWeek.tokenBreakdown?.voiceInput ?? '2.5M'}
                </span>
              </div>
              <div className="h-3 w-px bg-[#e2e8f0] shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#64748b] font-normal">Voice Output</span>
                <span className="text-[11px] font-bold text-[#0d212c]">
                  {currentWeek.tokenBreakdown?.voiceOutput ?? '1.5M'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Estimated AI Cost */}
          <div className="h-[110px] bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#0d212c]" />
                <span className="text-[14px] font-semibold text-[#0d212c]">Estimated AI Cost</span>
              </div>
              <span className="text-[24px] font-semibold text-[#36c0c9] leading-none">
                ${aiCost}
              </span>
            </div>
            <div className="border-t border-[#e2e8f0] pt-2">
              <span className="text-[11px] text-[#64748b] font-normal">
                week of {currentWeek.shortRange} · Text &amp; Voice tokens
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. VALUE/ROI SECTION ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#0d212c]">Value/ROI</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Left Card: Assumptions Table */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between min-h-[460px]">
            <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-between py-0.5">
              {/* Row 1: Hours spent on manual assessments */}
              <div className="py-2.5 flex items-center justify-between gap-3 first:pt-0">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Hours spent on manual assessments
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-normal">
                    (per assessment)
                  </span>
                </div>
                <NumericStepperInput
                  value={hoursSpent}
                  onChange={setHoursSpent}
                  unit="hours"
                  step={1}
                  min={1}
                  max={40}
                  precision={0}
                />
              </div>

              {/* Row 2: Cost per hour */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Cost per hour
                  </span>
                </div>
                <NumericStepperInput
                  value={costPerHour}
                  onChange={setCostPerHour}
                  unit="USD"
                  prefix="$"
                  step={5}
                  min={5}
                  max={500}
                  precision={0}
                />
              </div>

              {/* Row 3: Input Token Price */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Input Token Price
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-normal">
                    (per 1M input tokens)
                  </span>
                </div>
                <NumericStepperInput
                  value={inputTokenPrice}
                  onChange={setInputTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={0.05}
                  min={0.01}
                  max={100}
                  precision={2}
                />
              </div>

              {/* Row 4: Output Token Price */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Output Token Price
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-normal">
                    (per 1M output tokens)
                  </span>
                </div>
                <NumericStepperInput
                  value={outputTokenPrice}
                  onChange={setOutputTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={0.5}
                  min={0.1}
                  max={100}
                  precision={2}
                />
              </div>

              {/* Row 5: Input Token (Voice) */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Input Token (Voice)
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-normal">
                    (per 1M voice tokens)
                  </span>
                </div>
                <NumericStepperInput
                  value={inputVoiceTokenPrice}
                  onChange={setInputVoiceTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={1}
                  min={0.5}
                  max={200}
                  precision={2}
                />
              </div>

              {/* Row 6: Output Token (Voice) */}
              <div className="py-2.5 flex items-center justify-between gap-3 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Output Token (Voice)
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-normal">
                    (per 1M voice tokens)
                  </span>
                </div>
                <NumericStepperInput
                  value={outputVoiceTokenPrice}
                  onChange={setOutputVoiceTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={1}
                  min={0.5}
                  max={200}
                  precision={2}
                />
              </div>
            </div>

            {/* Bottom Row of Left Card */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <span className="text-[11px] text-[#94a3b8] font-normal">
                {hasUnappliedChanges ? 'Unapplied changes' : 'AI cost includes text + voice tokens'}
              </span>

              {/* Recalculate Button */}
              <button
                type="button"
                onClick={handleRecalculate}
                disabled={!hasUnappliedChanges || isRecalculating}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition border-0 ${
                  hasUnappliedChanges && !isRecalculating
                    ? 'bg-[#36c0c9] hover:bg-[#2baab3] text-white cursor-pointer shadow-xs'
                    : 'bg-[#36c0c9] text-white opacity-40 cursor-not-allowed pointer-events-none'
                }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`}
                />
                <span>
                  {isRecalculating ? 'Recalculating metrics...' : 'Recalculate'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Card: Comparison Graph or Numbers View */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs relative flex flex-col justify-between overflow-hidden min-h-[460px] transition-all duration-300">
            {/* Recalculation Overlay (800ms) */}
            {isRecalculating && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] rounded-2xl z-30 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-150">
                <svg
                  className="w-8 h-8 animate-spin text-[#36c0c9]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    strokeLinecap="round"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-xs font-semibold text-[#0d212c]">
                  Recalculating Value, Cost &amp; ROI
                </span>
              </div>
            )}

            {/* Header: Title, Legend & View Mode Toggle */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 shrink-0 ${
                roiViewMode === 'graph' ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#0d212c]">
                  Manual cost vs AI cost
                </h3>
                {/* Legend (Only shown in graph view) */}
                {roiViewMode === 'graph' && (
                  <div className="flex items-center gap-3.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 bg-[#36c0c9] rounded-full inline-block" />
                      <span className="text-[#64748b] font-normal text-[11px]">Manual cost</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 bg-[#ed4d19] rounded-full inline-block" />
                      <span className="text-[#64748b] font-normal text-[11px]">AI cost</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Segmented Switcher Buttons */}
              <div className="inline-flex items-center p-0.5 bg-white border border-[#e2e8f0] rounded-lg shadow-2xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setRoiViewMode('graph')}
                  title="Graph view"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    roiViewMode === 'graph'
                      ? 'bg-[#36c0c9] text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0d212c] bg-transparent'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRoiViewMode('data')}
                  title="Data view"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    roiViewMode === 'data'
                      ? 'bg-[#36c0c9] text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0d212c] bg-transparent'
                  }`}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area: Graph View (Default) vs Data / Numbers View */}
            {roiViewMode === 'graph' ? (
              /* GRAPH VIEW: SVG Comparison Line Chart */
              <div className="flex-1 flex flex-col justify-center py-2 relative select-none">
                {(() => {
                  const maxManual = Math.max(...comparisonData.map((d) => d.manual), 3000)
                  const yMax = Math.ceil(maxManual / 1000) * 1000
                  const svgWidth = 640
                  const svgHeight = 290
                  const padLeft = 45
                  const padRight = 115
                  const padTop = 30
                  const padBottom = 38
                  const plotWidth = svgWidth - padLeft - padRight
                  const plotHeight = svgHeight - padTop - padBottom

                  const getX = (idx: number) => padLeft + (idx / (comparisonData.length - 1)) * plotWidth
                  const getY = (val: number) => padTop + plotHeight * (1 - Math.min(yMax, Math.max(0, val)) / yMax)

                  // Path generator
                  const manualPoints = comparisonData.map((d, i) => `${getX(i)},${getY(d.manual)}`).join(' ')
                  const aiPoints = comparisonData.map((d, i) => `${getX(i)},${getY(d.ai)}`).join(' ')

                  const step = yMax >= 8000 ? 2000 : 1000
                  const yTicks: number[] = []
                  for (let v = yMax; v >= 0; v -= step) {
                    yTicks.push(v)
                  }

                  const lastIdx = comparisonData.length - 1
                  const lastPoint = comparisonData[lastIdx]
                  const lastX = getX(lastIdx)
                  const lastManualY = getY(lastPoint.manual)
                  const lastAiY = getY(lastPoint.ai)

                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-auto max-h-[340px] overflow-visible"
                      >
                        {/* Y-Axis Horizontal Gridlines and Labels */}
                        {yTicks.map((val) => {
                          const y = getY(val)
                          const label = val === 0 ? '$0' : `$${val / 1000}K`
                          return (
                            <g key={val}>
                              <line
                                x1={padLeft}
                                y1={y}
                                x2={lastX}
                                y2={y}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                              />
                              <text
                                x={padLeft - 10}
                                y={y + 3.5}
                                textAnchor="end"
                                fill="#94a3b8"
                                fontSize="11"
                                fontFamily="monospace"
                              >
                                {label}
                              </text>
                            </g>
                          )
                        })}

                        {/* Manual Cost Line (Primary Light Color Line #36c0c9) */}
                        <polyline
                          fill="none"
                          stroke="#36c0c9"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={manualPoints}
                        />

                        {/* AI Cost Line (Orange Line #ed4d19) */}
                        <polyline
                          fill="none"
                          stroke="#ed4d19"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={aiPoints}
                        />

                        {/* Interactive Data Points & Hover Targets */}
                        {comparisonData.map((d, i) => {
                          const x = getX(i)
                          const mY = getY(d.manual)
                          const aY = getY(d.ai)
                          const isHovered = hoveredPointIndex === i
                          const isSelected = i === selectedWeekIndex

                          return (
                            <g
                              key={d.id || d.date}
                              onMouseEnter={() => setHoveredPointIndex(i)}
                              onMouseLeave={() => setHoveredPointIndex(null)}
                              onClick={() => setSelectedWeekIndex(i)}
                              className="cursor-pointer"
                            >
                              {/* Transparent hit area */}
                              <rect
                                x={x - 22}
                                y={padTop}
                                width={44}
                                height={plotHeight}
                                fill="transparent"
                              />

                              {/* Subtle vertical indicator dashed line on hover or selection */}
                              {(isHovered || isSelected) && (
                                <line
                                  x1={x}
                                  y1={padTop}
                                  x2={x}
                                  y2={padTop + plotHeight}
                                  stroke="#e2e8f0"
                                  strokeWidth="1"
                                  strokeDasharray="3 3"
                                />
                              )}

                              {/* Manual Point Circle (#36c0c9) */}
                              <circle
                                cx={x}
                                cy={mY}
                                r={isSelected ? 5 : isHovered ? 4.5 : 3.5}
                                fill="#36c0c9"
                                stroke="#ffffff"
                                strokeWidth={isSelected ? 2.5 : 1.5}
                                className="transition-all"
                              />

                              {/* AI Point Circle (#ed4d19) */}
                              <circle
                                cx={x}
                                cy={aY}
                                r={isSelected ? 5 : isHovered ? 4.5 : 3.5}
                                fill="#ed4d19"
                                stroke="#ffffff"
                                strokeWidth={isSelected ? 2.5 : 1.5}
                                className="transition-all"
                              />

                              {/* X-Axis Date Labels (Weeks from data selector) */}
                              <text
                                x={x}
                                y={svgHeight - 12}
                                textAnchor="middle"
                                fill={isSelected ? '#0d212c' : '#64748b'}
                                fontSize="10.5"
                                fontWeight={isSelected ? '600' : '400'}
                                className="transition-colors select-none"
                              >
                                {d.date}
                              </text>
                            </g>
                          )
                        })}

                        {/* End Labels for the lines */}
                        <g>
                          <text
                            x={lastX + 12}
                            y={lastManualY + 4}
                            fill="#0d212c"
                            fontSize="11.5"
                            fontWeight="600"
                            className="select-none"
                          >
                            Manual ${lastPoint.manual.toLocaleString()}
                          </text>
                          <text
                            x={lastX + 12}
                            y={Math.max(lastManualY + 18, lastAiY + 4)}
                            fill="#0d212c"
                            fontSize="11.5"
                            fontWeight="600"
                            className="select-none"
                          >
                            AI ${lastPoint.ai < 100 ? lastPoint.ai.toFixed(2) : Math.round(lastPoint.ai).toLocaleString()}
                          </text>
                        </g>
                      </svg>

                      {/* Custom Light Theme Tooltip on Hover */}
                      {hoveredPointIndex !== null && (
                        <div
                          className="absolute z-40 bg-white text-[#0d212c] p-3 rounded-xl border border-[#e2e8f0] shadow-xl text-left pointer-events-none text-xs animate-in fade-in zoom-in-95 duration-100 min-w-[175px]"
                          style={{
                            left: `${(getX(hoveredPointIndex) / svgWidth) * 100}%`,
                            top: '8%',
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
                            <span className="font-semibold text-[#0d212c] text-xs">
                              {comparisonData[hoveredPointIndex].fullLabel || comparisonData[hoveredPointIndex].date}
                            </span>
                            {hoveredPointIndex === selectedWeekIndex && (
                              <span className="text-[9px] font-medium bg-[#ddf7f9] text-[#009299] px-1.5 py-0.5 rounded-full shrink-0">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5 text-[#64748b]">
                                <span className="w-2 h-2 rounded-full bg-[#36c0c9] shrink-0" />
                                <span>Manual cost:</span>
                              </div>
                              <span className="font-semibold text-[#0d212c] font-mono">
                                ${comparisonData[hoveredPointIndex].manual.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5 text-[#64748b]">
                                <span className="w-2 h-2 rounded-full bg-[#ed4d19] shrink-0" />
                                <span>AI cost:</span>
                              </div>
                              <span className="font-semibold text-[#ed4d19] font-mono">
                                ${comparisonData[hoveredPointIndex].ai < 100 ? comparisonData[hoveredPointIndex].ai.toFixed(2) : Math.round(comparisonData[hoveredPointIndex].ai).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-slate-100">
                              <span className="text-[#64748b] font-medium">Estimated savings:</span>
                              <span className="font-semibold text-[#36c0c9] font-mono">
                                ${(Math.max(0, comparisonData[hoveredPointIndex].manual - comparisonData[hoveredPointIndex].ai)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                          {/* Tooltip downward caret arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white border-r border-b border-[#e2e8f0] rotate-45" />
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            ) : (
              /* NUMBERS / DATA VIEW: 4 Financial blocks with adjusted spacing & divider lines matching taller card */
              <div className="flex-1 flex flex-col justify-around divide-y divide-[#f1f5f9] py-2">
                {/* Top Row: Manual cost vs AI cost */}
                <div className="pb-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#f1f5f9]">
                    {/* Manual cost */}
                    <div className="sm:pr-5 space-y-1 pb-3 sm:pb-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0d212c]">
                        <span>Manual cost</span>
                        <div className="relative group flex items-center">
                          <button
                            type="button"
                            className="p-0.5 text-[#94a3b8] hover:text-[#64748b] transition-colors cursor-help"
                            aria-label="Manual cost info"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                            <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                              Formula: Outputs × Manual Hours × Cost per Hour
                            </div>
                            <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#0d212c] tracking-tight">
                        ${manualCost.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#64748b] font-normal pt-0.5">
                        Total hours {totalHours} | Cost per hour ${appliedCostPerHour}
                      </div>
                    </div>

                    {/* AI cost (Primary light color #36c0c9) */}
                    <div className="sm:pl-5 space-y-1 pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0d212c]">
                        <span>AI cost</span>
                        <div className="relative group flex items-center">
                          <button
                            type="button"
                            className="p-0.5 text-[#94a3b8] hover:text-[#64748b] transition-colors cursor-help"
                            aria-label="AI cost info"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                            <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                              Formula: (Input + Output + Voice Tokens) × Token Prices
                            </div>
                            <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#36c0c9] tracking-tight">
                        ${aiCost.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#64748b] font-normal pt-0.5">
                        Total tokens {currentWeek.tokensM}M · Text &amp; Voice
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Estimated ROI vs Estimated savings */}
                <div className="pt-4 pb-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#f1f5f9]">
                    {/* Estimated ROI */}
                    <div className="sm:pr-5 space-y-1 pb-3 sm:pb-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0d212c]">
                        <span>Estimated ROI</span>
                        <div className="relative group flex items-center">
                          <button
                            type="button"
                            className="p-0.5 text-[#94a3b8] hover:text-[#64748b] transition-colors cursor-help"
                            aria-label="Estimated ROI info"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                            <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                              Formula: Manual Cost ÷ AI Cost
                            </div>
                            <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#36c0c9] tracking-tight">
                        {roiMultiplier}x
                      </div>
                    </div>

                    {/* Estimated savings */}
                    <div className="sm:pl-5 space-y-1 pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0d212c]">
                        <span>Estimated savings</span>
                        <div className="relative group flex items-center">
                          <button
                            type="button"
                            className="p-0.5 text-[#94a3b8] hover:text-[#64748b] transition-colors cursor-help"
                            aria-label="Estimated savings info"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                            <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                              Formula: Manual Cost − AI Cost
                            </div>
                            <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#36c0c9] tracking-tight flex items-baseline">
                        ${estimatedSavings.toLocaleString()}
                        <span className="text-xs font-normal text-[#64748b] ml-1.5">
                          this week
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. ASSESSMENTS BY STATUS SECTION ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0d212c]">
            Assessments by Status
          </h2>
          <span className="text-xs text-[#64748b] font-normal">
            Week of {currentWeek.shortRange}
          </span>
        </div>

        {/* 3-Column Card */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-[#e2e8f0] gap-8 md:gap-0">
            {/* Column 1: Completed */}
            <div className="flex flex-col md:pr-6">
              <h3 className="text-sm font-semibold text-[#0d212c] mb-3">Completed</h3>
              <div className="flex flex-col">
                {(isExpandedAll
                  ? currentWeek.assessments.completed
                  : currentWeek.assessments.completed.slice(0, 4)
                ).map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 border-b border-slate-50 last:border-0 flex items-center justify-between gap-6 group relative"
                  >
                    <span
                      className="text-xs text-[#0d212c] truncate max-w-[170px] sm:max-w-[185px] xl:max-w-[210px] font-normal"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs font-medium text-[#36c0c9] shrink-0 text-right">
                      {item.round}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Scheduled */}
            <div className="flex flex-col md:px-6">
              <h3 className="text-sm font-semibold text-[#0d212c] mb-3">Scheduled</h3>
              <div className="flex flex-col">
                {(isExpandedAll
                  ? currentWeek.assessments.scheduled
                  : currentWeek.assessments.scheduled.slice(0, 4)
                ).map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 border-b border-slate-50 last:border-0 flex items-center justify-between gap-6 group relative"
                  >
                    <span
                      className="text-xs text-[#0d212c] truncate max-w-[170px] sm:max-w-[185px] xl:max-w-[210px] font-normal"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs font-medium text-[#36c0c9] shrink-0 text-right">
                      {item.round}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Finalised */}
            <div className="flex flex-col md:pl-6">
              <h3 className="text-sm font-semibold text-[#0d212c] mb-3">Finalised</h3>
              <div className="flex flex-col">
                {(isExpandedAll
                  ? currentWeek.assessments.finalised
                  : currentWeek.assessments.finalised.slice(0, 4)
                ).map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 border-b border-slate-50 last:border-0 flex items-center justify-between gap-6 group relative"
                  >
                    <span
                      className="text-xs text-[#0d212c] truncate max-w-[170px] sm:max-w-[185px] xl:max-w-[210px] font-normal"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs font-medium text-[#36c0c9] shrink-0 text-right">
                      {item.round}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Centered Single "See more" / "See less" Button for all 3 columns */}
          {hasMoreItems && (
            <div className="flex justify-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsExpandedAll((prev) => !prev)}
                className="text-xs text-[#36c0c9] hover:text-[#2baab3] font-medium flex items-center justify-center gap-1 transition cursor-pointer border-0 bg-transparent py-1.5 px-4"
              >
                <span>{isExpandedAll ? 'See less' : 'See more'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isExpandedAll ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
