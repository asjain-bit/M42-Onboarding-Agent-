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

export const UsageInsightsScreen: React.FC = () => {
  // Current active week index (default: week-3 / index 2)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(2)
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false)
  const weekDropdownRef = useRef<HTMLDivElement>(null)

  const currentWeek = WEEKS_DATA[selectedWeekIndex]

  // Assumptions input states (staged/editing)
  const [hoursSpent, setHoursSpent] = useState<number>(4)
  const [costPerHour, setCostPerHour] = useState<number>(30)
  const [tokenPrice, setTokenPrice] = useState<number>(4.0)

  // Applied values used for calculations
  const [appliedHoursSpent, setAppliedHoursSpent] = useState<number>(4)
  const [appliedCostPerHour, setAppliedCostPerHour] = useState<number>(30)
  const [appliedTokenPrice, setAppliedTokenPrice] = useState<number>(4.0)

  // Recalculation animation state
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false)

  // Single expanded toggle for all columns in "Assessments by Status"
  const [isExpandedAll, setIsExpandedAll] = useState<boolean>(false)

  // Detect unapplied changes
  const hasUnappliedChanges = useMemo(() => {
    return (
      hoursSpent !== appliedHoursSpent ||
      costPerHour !== appliedCostPerHour ||
      tokenPrice !== appliedTokenPrice
    )
  }, [
    hoursSpent,
    costPerHour,
    tokenPrice,
    appliedHoursSpent,
    appliedCostPerHour,
    appliedTokenPrice,
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
      setAppliedTokenPrice(tokenPrice)
      setIsRecalculating(false)
    }, 800)
  }

  // Financial impact calculation rules
  // Manual Cost = Outputs × Manual Hours × Cost per Hour
  const totalHours = currentWeek.outputCalls * appliedHoursSpent
  const manualCost = totalHours * appliedCostPerHour

  // AI Cost = Tokens (in Millions) × Token Price per 1M
  const rawAICost = currentWeek.tokensM * appliedTokenPrice
  const aiCost = Math.round(rawAICost)

  // Estimated ROI = Manual Cost ÷ AI Cost
  const roiMultiplier = rawAICost > 0 ? Math.round(manualCost / rawAICost) : 0

  // Estimated Savings = Manual Cost − AI Cost
  const rawSavings = manualCost - rawAICost
  const estimatedSavings = Math.round(rawSavings)

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
            <div className="border-t border-[#e2e8f0] pt-2">
              <span className="text-[11px] text-[#64748b] font-normal">
                week of {currentWeek.shortRange}
              </span>
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
                week of {currentWeek.shortRange} · @ ${appliedTokenPrice.toFixed(0)} / 1M tokens
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
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
            <div className="flex flex-col gap-3">
              {/* Row 1: Hours spent on manual assessments */}
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Hours spent on manual assessments
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-normal">
                    (per assessment)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#e2e8f0] rounded-lg bg-white px-2.5 py-1 w-[88px] justify-between transition focus-within:border-[#cbd5e1] focus-within:bg-[#f8fafc]">
                    <input
                      type="number"
                      step={1}
                      min={1}
                      max={40}
                      value={hoursSpent}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setHoursSpent(isNaN(val) ? 0 : val)
                      }}
                      className="w-full text-xs font-semibold text-[#0d212c] text-center outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex flex-col shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={() => setHoursSpent((h) => Math.min(40, h + 1))}
                        className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHoursSpent((h) => Math.max(1, h - 1))}
                        className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748b] font-normal w-10 text-left">
                    hours
                  </span>
                </div>
              </div>

              {/* Row 2: Cost per hour */}
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Cost per hour
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#e2e8f0] rounded-lg bg-white px-2.5 py-1 w-[88px] justify-between transition focus-within:border-[#cbd5e1] focus-within:bg-[#f8fafc]">
                    <span className="text-xs text-[#94a3b8] font-normal mr-1">$</span>
                    <input
                      type="number"
                      step={5}
                      min={5}
                      max={500}
                      value={costPerHour}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setCostPerHour(isNaN(val) ? 0 : val)
                      }}
                      className="w-full text-xs font-semibold text-[#0d212c] text-center outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex flex-col shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={() => setCostPerHour((c) => Math.min(500, c + 5))}
                        className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCostPerHour((c) => Math.max(5, c - 5))}
                        className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748b] font-normal w-10 text-left">
                    USD
                  </span>
                </div>
              </div>

              {/* Row 3: Token price */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Token price
                  </span>
                  <span className="text-[11px] text-[#94a3b8] font-normal">
                    (per 1M tokens)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#e2e8f0] rounded-lg bg-white px-2.5 py-1 w-[88px] justify-between transition focus-within:border-[#cbd5e1] focus-within:bg-[#f8fafc]">
                    <span className="text-xs text-[#94a3b8] font-normal mr-1">$</span>
                    <input
                      type="number"
                      step={0.5}
                      min={0.5}
                      max={50}
                      value={tokenPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setTokenPrice(isNaN(val) ? 0 : val)
                      }}
                      className="w-full text-xs font-semibold text-[#0d212c] text-center outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex flex-col shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={() =>
                          setTokenPrice((p) => Math.min(50, parseFloat((p + 0.5).toFixed(1))))
                        }
                        className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTokenPrice((p) => Math.max(0.5, parseFloat((p - 0.5).toFixed(1))))
                        }
                        className="text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0 leading-none"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748b] font-normal w-10 text-left">
                    USD
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row of Left Card */}
            <div className="flex items-center justify-between pt-4 mt-2">
              <span className="text-[11px] text-[#94a3b8] font-normal">
                AI cost excludes web search
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

          {/* Right Card: Financial Impact Metrics */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs relative flex flex-col justify-between overflow-hidden min-h-[220px]">
            {/* Recalculation Overlay (800ms) */}
            {isRecalculating && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-2xl z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-150">
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

            {/* Top Half (50%) */}
            <div className="grid grid-cols-2 gap-4 pb-3">
              {/* Manual cost */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#0d212c]">Manual cost</span>
                  <div className="relative group flex items-center">
                    <Info className="w-3.5 h-3.5 text-[#94a3b8] hover:text-[#64748b] cursor-pointer" />
                    <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                      <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        Formula: Outputs × Manual Hours × Cost per Hour
                      </div>
                      <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-[#0d212c] tracking-tight">
                  ${manualCost.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#64748b] font-normal">
                  Total hours {totalHours} | Cost per hour ${appliedCostPerHour}
                </div>
              </div>

              {/* AI cost */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#0d212c]">AI cost</span>
                  <div className="relative group flex items-center">
                    <Info className="w-3.5 h-3.5 text-[#94a3b8] hover:text-[#64748b] cursor-pointer" />
                    <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                      <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        Formula: Tokens (in Millions) × Token Price per 1M
                      </div>
                      <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-[#0d212c] tracking-tight">
                  ${aiCost}
                </div>
                <div className="text-[11px] text-[#64748b] font-normal">
                  Total tokens {currentWeek.tokensM}M | Token price $
                  {appliedTokenPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Horizontal 50/50 Centered Divider */}
            <div className="border-t border-[#f1f5f9] my-2" />

            {/* Bottom Half (50%) */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Estimated ROI */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#0d212c]">Estimated ROI</span>
                  <div className="relative group flex items-center">
                    <Info className="w-3.5 h-3.5 text-[#94a3b8] hover:text-[#64748b] cursor-pointer" />
                    <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                      <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        Formula: Manual Cost ÷ AI Cost
                      </div>
                      <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-[#36c0c9] tracking-tight">
                  {roiMultiplier}x
                </div>
              </div>

              {/* Estimated savings */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Estimated savings
                  </span>
                  <div className="relative group flex items-center">
                    <Info className="w-3.5 h-3.5 text-[#94a3b8] hover:text-[#64748b] cursor-pointer" />
                    <div className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-start z-30">
                      <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        Formula: Manual Cost − AI Cost
                      </div>
                      <div className="w-2 h-2 bg-[#0d212c] rotate-45 -mt-1 ml-2" />
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-[#36c0c9] tracking-tight flex items-baseline">
                  ${estimatedSavings.toLocaleString()}
                  <span className="text-xs font-normal text-[#64748b] ml-1.5">
                    this week
                  </span>
                </div>
              </div>
            </div>
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
