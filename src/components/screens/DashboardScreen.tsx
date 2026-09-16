'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Users, RefreshCw, Folder, Info, Calendar as CalendarIcon, AlertTriangle as AlertTriangleIcon, X } from 'lucide-react'
import { StatusChip } from '@/components/atoms/StatusChip'
import { SearchBar } from '@/components/molecules/SearchBar'
import { AssessmentDetailScreen, AssessmentDetailData } from './AssessmentDetailScreen'

interface AssessmentRow {
  id: string
  vendor: string
  questionnaire: string
  round: string
  status: 'awaiting_evidence' | 'completed' | 'scheduled' | 'finalised' | 'ready' | 'cancelled'
  score: string
  passRate: string
  passRateReason?: string
  createdDate: string
}

export const DashboardScreen: React.FC = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentDetailData | null>(null)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Reschedule & Cancel Modals State
  const [rescheduleTarget, setRescheduleTarget] = useState<AssessmentRow | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-25')
  const [rescheduleStartTime, setRescheduleStartTime] = useState('14:30')
  const [rescheduleEndTime, setRescheduleEndTime] = useState('15:30')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduleRecipients, setRescheduleRecipients] = useState<string[]>([
    'zaid.alali@m42.ae',
    'audit@facility.ae',
    'sam.ai@m42.ae',
  ])
  const [newRecipientInput, setNewRecipientInput] = useState('')
  const [recipientError, setRecipientError] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<AssessmentRow | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Lock background scroll when modals are open
  useEffect(() => {
    if (rescheduleTarget || cancelTarget) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [rescheduleTarget, cancelTarget])

  // Show 8 rows per page consistently across all tables
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  // Varied rounds data and created date with time & AM/PM
  const [assessments, setAssessments] = useState<AssessmentRow[]>([
    {
      id: 'ast-1',
      vendor: 'Cleveland Clinic Abu Dhabi',
      questionnaire: 'Clinical EHR & Patient Records Dataset',
      round: 'Round 1',
      status: 'completed',
      score: 'Medium',
      passRate: '85%',
      passRateReason: 'High pass rate: 17 out of 20 testcases passed during assessment evaluation.',
      createdDate: '1 Sept 2026, 10:30 AM',
    },
    {
      id: 'ast-2',
      vendor: 'Danat Al Emarat Hospital',
      questionnaire: 'PACS & Radiology Imaging Dataset',
      round: 'Round 2',
      status: 'completed',
      score: 'Low',
      passRate: '30%',
      passRateReason: 'Low pass rate: 6 out of 20 testcases passed during imaging integration audit.',
      createdDate: '28 Aug 2026, 02:15 PM',
    },
    {
      id: 'ast-3',
      vendor: 'Healthpoint Hospital',
      questionnaire: 'Lab Telemetry & Diagnostic Sync Dataset',
      round: 'Initial Review',
      status: 'completed',
      score: 'High',
      passRate: '92%',
      passRateReason: 'High pass rate: 18 out of 20 testcases passed telemetry data validations.',
      createdDate: '24 Aug 2026, 11:45 AM',
    },
    {
      id: 'ast-4',
      vendor: 'Sheikh Shakhbout Medical City (SSMC)',
      questionnaire: 'Pharmacy & Medication Inventory Dataset',
      round: 'Stage 2 Audit',
      status: 'scheduled',
      score: '-',
      passRate: '-',
      passRateReason: 'Assessment scheduled. Pass rate will be computed upon call completion.',
      createdDate: '20 Aug 2026, 04:20 PM',
    },
    {
      id: 'ast-5',
      vendor: 'Moorfields Eye Hospital Abu Dhabi',
      questionnaire: 'SOC 2 Type II Facility Security Dataset',
      round: 'Round 1 - Technical',
      status: 'finalised',
      score: 'Low',
      passRate: '20%',
      passRateReason: 'Low pass rate: 4 out of 20 testcases passed during security controls audit.',
      createdDate: '15 Aug 2026, 09:10 AM',
    },
    {
      id: 'ast-6',
      vendor: 'Imperial College London Diabetes Centre',
      questionnaire: 'HIPAA & Healthcare Data Compliance Dataset',
      round: 'Follow-up Audit',
      status: 'completed',
      score: 'Medium',
      passRate: '57%',
      passRateReason: 'Medium pass rate: 11 out of 20 testcases passed data compliance verification.',
      createdDate: '12 Aug 2026, 03:45 PM',
    },
    {
      id: 'ast-7',
      vendor: 'Al Rahba Hospital',
      questionnaire: 'Third-Party Cloud API Integration Dataset',
      round: 'Round 3',
      status: 'completed',
      score: 'High',
      passRate: '80%',
      passRateReason: 'High pass rate: 16 out of 20 testcases passed API integration checks.',
      createdDate: '10 Aug 2026, 01:25 PM',
    },
    {
      id: 'ast-8',
      vendor: 'Amana Healthcare Rehabilitation',
      questionnaire: 'ISO 27001 ISMS Healthcare Checklist',
      round: 'Annual Re-evaluation',
      status: 'completed',
      score: 'Low',
      passRate: '35%',
      passRateReason: 'Low pass rate: 7 out of 20 testcases passed ISMS requirements.',
      createdDate: '08 Aug 2026, 11:10 AM',
    },
    {
      id: 'ast-9',
      vendor: 'M42 Genomic Sciences Center',
      questionnaire: 'Cloud Infrastructure Audit Dataset',
      round: 'Stage 1 Discovery',
      status: 'finalised',
      score: 'High',
      passRate: '86%',
      passRateReason: 'High pass rate: 17 out of 20 testcases passed infrastructure security audit.',
      createdDate: '05 Aug 2026, 05:50 PM',
    },
    {
      id: 'ast-10',
      vendor: 'Capital Health Screening Centre',
      questionnaire: 'Clinical AI Safety & Ethics Dataset',
      round: 'Pre-onboarding',
      status: 'completed',
      score: 'Low',
      passRate: '25%',
      passRateReason: 'Low pass rate: 5 out of 20 testcases passed safety & ethics criteria.',
      createdDate: '01 Aug 2026, 09:30 AM',
    },
    {
      id: 'ast-11',
      vendor: 'Medica Diagnostic Center',
      questionnaire: 'UAE DOH Health Data Residency Dataset',
      round: 'Round 2 - Compliance',
      status: 'scheduled',
      score: '-',
      passRate: '-',
      passRateReason: 'Assessment scheduled. Pass rate will be computed upon call completion.',
      createdDate: '28 Jul 2026, 04:15 PM',
    },
    {
      id: 'ast-12',
      vendor: 'Global Health Telemetry Unit',
      questionnaire: 'Business Continuity & Disaster Recovery Dataset',
      round: 'Final Review',
      status: 'cancelled',
      score: '-',
      passRate: '-',
      passRateReason: 'Assessment session was cancelled by admin.',
      createdDate: '25 Jul 2026, 02:00 PM',
    },
  ])

  // KPI Card data calculations
  const completedAssessments = assessments.filter((a) => a.status === 'completed').length
  const finalizedAssessments = assessments.filter((a) => a.status === 'finalised').length
  const scheduledAssessments = assessments.filter((a) => a.status === 'scheduled').length
  const cancelledAssessments = assessments.filter((a) => a.status === 'cancelled').length

  // Filter chips click options
  const filterOptions = [
    { key: 'all', label: 'All assessments', count: assessments.length },
    { key: 'completed', label: 'Completed', count: completedAssessments },
    { key: 'finalised', label: 'Finalised', count: finalizedAssessments },
    { key: 'scheduled', label: 'Scheduled', count: scheduledAssessments },
    { key: 'cancelled', label: 'Cancelled', count: cancelledAssessments },
  ]

  const handleFilterClick = (key: string) => {
    setSelectedStatusFilter(key)
    setCurrentPage(1)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  // Filtered dataset
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const matchesStatus = selectedStatusFilter === 'all' || item.status === selectedStatusFilter
      const matchesSearch =
        item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.questionnaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.round.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [assessments, selectedStatusFilter, searchTerm])

  // Pagination math (8 items per page)
  const totalPages = Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedAssessments = filteredAssessments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleUpdateStatus = (id: string, newStatus: 'ready' | 'finalised' | 'completed') => {
    setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
    if (selectedAssessment && selectedAssessment.id === id) {
      setSelectedAssessment((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget) return
    const formattedDateTime = `${rescheduleDate}, ${rescheduleStartTime} - ${rescheduleEndTime}`
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === rescheduleTarget.id
          ? {
              ...a,
              status: 'scheduled',
              createdDate: formattedDateTime,
            }
          : a
      )
    )
    setToastMessage(`Assessment for ${rescheduleTarget.vendor} rescheduled to ${formattedDateTime}.`)
    setRescheduleTarget(null)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleConfirmCancel = () => {
    if (!cancelTarget) return
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === cancelTarget.id
          ? {
              ...a,
              status: 'cancelled',
              passRateReason: 'Assessment cancelled by admin user.',
            }
          : a
      )
    )
    setToastMessage(`Assessment for ${cancelTarget.vendor} has been cancelled.`)
    setCancelTarget(null)
    setTimeout(() => setToastMessage(null), 3500)
  }

  if (selectedAssessment) {
    return (
      <AssessmentDetailScreen
        assessment={selectedAssessment}
        onBack={() => setSelectedAssessment(null)}
        onStatusChange={(newStatus) => handleUpdateStatus(selectedAssessment.id, newStatus)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full px-4 sm:px-6 lg:px-10 py-4 text-[#0d212c]">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#f0fdf4] text-[#15803d] text-xs font-semibold px-4 py-3 rounded-xl shadow-md border border-[#bbf7d0] flex items-center gap-2.5 animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-[#16a34a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Menu */}
      <div className="text-xs font-semibold text-[#64748b] flex items-center gap-1.5">
        <span>M42 admin</span>
        <span>/</span>
        <span className="text-[#36c0c9] font-bold">Dashboard</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* KPI Card 1: Facilities by Pass Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Users className="w-5 h-5 text-[#0d212c] shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-[#0d212c] truncate">
                Facilities by Pass Rate
              </h3>
            </div>
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">20</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#137333]">8</span>
              <span className="text-[11px] text-[#64748b] font-medium">High (80-100%)</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#b45309]">7</span>
              <span className="text-[11px] text-[#64748b] font-medium">Medium (60-79%)</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-lg font-bold text-[#c5221f]">5</span>
              <span className="text-[11px] text-[#64748b] font-medium">Low (0-59%)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#64748b]">
            <Info className="w-3.5 h-3.5 text-[#36c0c9] shrink-0" />
            <span>Grouped by testcases pass rate evaluation</span>
          </div>
        </div>

        {/* KPI Card 2: Average Rounds per Facility */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <RefreshCw className="w-5 h-5 text-[#0d212c] shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-[#0d212c] truncate">
                Average Rounds per Facility
              </h3>
            </div>
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">2</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#0d212c]">8</span>
              <span className="text-[11px] text-[#64748b] font-medium">1 Round</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">3</span>
              <span className="text-[11px] text-[#64748b] font-medium">2 Rounds</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-lg font-bold text-[#0d212c]">1</span>
              <span className="text-[11px] text-[#64748b] font-medium">3+ Rounds</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#64748b]">
            <Info className="w-3.5 h-3.5 text-[#36c0c9] shrink-0" />
            <span>Breakdown by Assessment Rounds</span>
          </div>
        </div>

        {/* KPI Card 3: Sessions Conducted & Planned */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Folder className="w-5 h-5 text-[#0d212c] shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-[#0d212c] truncate">
                Sessions Conducted & Planned
              </h3>
            </div>
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">65</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#36c0c9]">8</span>
              <span className="text-[11px] text-[#64748b] font-medium">This Week</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">12</span>
              <span className="text-[11px] text-[#64748b] font-medium">Last Week</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-lg font-bold text-[#0d212c]">45</span>
              <span className="text-[11px] text-[#64748b] font-medium">Last Month</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#64748b]">
            <Info className="w-3.5 h-3.5 text-[#36c0c9] shrink-0" />
            <span>Calendar week: Monday – Sunday</span>
          </div>
        </div>
      </div>

      {/* Assessments Title & Search Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <h2 className="text-xl font-extrabold text-[#0d212c]">Assessments</h2>
        <div className="w-full sm:w-80 shrink-0">
          <SearchBar
            placeholder="Search facility name, dataset..."
            onSearch={handleSearchChange}
          />
        </div>
      </div>

      {/* Filter Chips (below Title & Search Bar row) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((chip) => {
          const isSelected = selectedStatusFilter === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => handleFilterClick(chip.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#36c0c9] text-white font-bold shadow-xs'
                  : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                }`}
              >
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Facilities Directory Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden w-full flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-xs font-bold">
                <th className="py-3.5 px-4">Facilities</th>
                <th className="py-3.5 px-4">Dataset</th>
                <th className="py-3.5 px-4">Round</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Pass Rate</th>
                <th className="py-3.5 px-4">Created date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/60">
              {paginatedAssessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748b] text-sm">
                    No assessments matching search criteria.
                  </td>
                </tr>
              ) : (
                paginatedAssessments.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      if (row.status !== 'cancelled') {
                        setSelectedAssessment({
                          ...row,
                          score:
                            row.score === 'High' ? '94.0' : row.score === 'Medium' ? '72.0' : '0.0',
                        })
                      }
                    }}
                    className={`transition cursor-pointer group ${
                      row.status === 'cancelled' ? 'bg-slate-50/50 hover:bg-slate-100/50' : 'hover:bg-[#f8fafc]'
                    }`}
                  >
                    <td
                      className="py-3.5 px-4 font-semibold text-xs text-[#0d212c] group-hover:text-[#36c0c9] truncate"
                      title={row.vendor}
                    >
                      {row.vendor}
                    </td>
                    <td
                      className="py-3.5 px-4 text-xs text-[#0d212c] truncate"
                      title={row.questionnaire}
                    >
                      {row.questionnaire}
                    </td>
                    <td
                      className="py-3.5 px-4 text-[#64748b] text-xs font-medium"
                      title={row.round}
                    >
                      {row.round}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusChip
                        label={
                          row.status === 'scheduled'
                            ? 'Scheduled'
                            : row.status === 'finalised'
                              ? 'Finalised'
                              : row.status === 'cancelled'
                                ? 'Cancelled'
                                : 'Completed'
                        }
                        status={
                          row.status === 'scheduled'
                            ? 'info'
                            : row.status === 'finalised'
                              ? 'finalised'
                              : row.status === 'cancelled'
                                ? 'error'
                                : 'success'
                        }
                        dot={false}
                      />
                    </td>
                    {/* Pass Rate column: Show only color-coded percentage */}
                    <td className="py-3.5 px-4 text-xs font-extrabold">
                      {row.passRate !== '-' && row.status !== 'cancelled' ? (
                        (() => {
                          const val = parseInt(row.passRate.replace('%', ''), 10)
                          const colorClass =
                            val >= 80
                              ? 'text-[#137333]'
                              : val >= 60
                                ? 'text-[#b45309]'
                                : 'text-[#c5221f]'
                          const tooltipReason =
                            row.passRateReason || `${row.passRate} pass rate based on assessment execution.`

                          return (
                            <span className={`font-extrabold text-xs ${colorClass}`} title={tooltipReason}>
                              {row.passRate}
                            </span>
                          )
                        })()
                      ) : (
                        <span className="text-[#64748b] font-normal" title={row.passRateReason}>-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748b] text-xs font-medium">
                      {row.createdDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredAssessments.length > 0 && (
          <div className="flex items-[#64748b] justify-between px-4 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <div className="text-xs text-[#64748b] font-medium">
              Showing page <span className="font-semibold text-[#0d212c]">{currentPage}</span> of{' '}
              <span className="font-semibold text-[#0d212c]">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#cbd5e1] text-xs font-semibold text-[#0d212c] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer flex items-center justify-center"
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#36c0c9] text-white'
                        : 'text-[#64748b] hover:bg-slate-200/60'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#cbd5e1] text-xs font-semibold text-[#0d212c] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer flex items-center justify-center"
                title="Next page"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Meeting Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-8 sm:p-10 w-full max-w-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setRescheduleTarget(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer bg-transparent border-0 outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4 fill-none stroke-current" />
            </button>

            {/* Left-aligned Icon and Title */}
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-xl bg-[#ddf7f9] text-[#0d7280] flex items-center justify-center border border-[#36c0c9]/30 shadow-2xs shrink-0">
                <CalendarIcon className="w-4.5 h-4.5 text-[#0d7280]" />
              </div>
              <h3 className="text-lg font-bold text-[#0d212c]">Reschedule meeting</h3>
            </div>

            <div className="flex flex-col gap-4 w-full text-left">
              {/* Date selection with past date check */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0d212c]">
                  New date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-semibold outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white transition"
                />
              </div>

              {/* Start and End Time selection with validation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0d212c]">
                    Start time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={rescheduleStartTime}
                    onChange={(e) => setRescheduleStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-semibold outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0d212c]">
                    End time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-semibold outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white transition"
                  />
                </div>
              </div>
              {rescheduleEndTime <= rescheduleStartTime && (
                <p className="text-[11px] text-red-500 font-semibold -mt-2">
                  End time must be after start time.
                </p>
              )}

              {/* Mandatory Recipients tag-input matching Add Facility flow (max 5) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0d212c]">
                  Recipients <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder={
                    rescheduleRecipients.length >= 5
                      ? 'Maximum 5 recipients reached'
                      : 'Enter email and press Enter...'
                  }
                  value={newRecipientInput}
                  disabled={rescheduleRecipients.length >= 5}
                  onChange={(e) => {
                    setNewRecipientInput(e.target.value)
                    if (recipientError) setRecipientError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const email = newRecipientInput.trim()
                      if (!email) return
                      if (rescheduleRecipients.includes(email)) {
                        setRecipientError('This recipient has already been added.')
                        return
                      }
                      if (rescheduleRecipients.length >= 5) {
                        setRecipientError('Maximum 5 recipients allowed.')
                        return
                      }
                      setRescheduleRecipients([...rescheduleRecipients, email])
                      setNewRecipientInput('')
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#0d212c] outline-none transition disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed ${
                    recipientError
                      ? 'border-red-500'
                      : 'border-[#cbd5e1] focus:border-slate-400 focus:bg-slate-50/50'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                  <span>Maximum 5 recipients can be added</span>
                  <span>{rescheduleRecipients.length}/5</span>
                </div>
                {recipientError && (
                  <span className="text-xs text-red-600 font-medium">{recipientError}</span>
                )}
                {rescheduleRecipients.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {rescheduleRecipients.map((email, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#f1f5f9] text-[#0d212c] text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#cbd5e1]"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() =>
                            setRescheduleRecipients(rescheduleRecipients.filter((_, i) => i !== idx))
                          }
                          className="p-0.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-red-600 transition cursor-pointer border-0 bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Reason field without asterisk */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0d212c]">Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule conflict requested by facility (optional)"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0d212c] font-normal outline-none focus:border-slate-400 focus:bg-slate-50/50 bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#e2e8f0] w-full">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="flex-1 py-3 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] cursor-pointer bg-transparent transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={
                  !rescheduleDate.trim() ||
                  !rescheduleStartTime.trim() ||
                  !rescheduleEndTime.trim() ||
                  rescheduleEndTime <= rescheduleStartTime ||
                  rescheduleRecipients.length === 0
                }
                className="flex-1 py-3 rounded-xl bg-[#36c0c9] text-white font-bold text-xs transition cursor-pointer shadow-2xs border-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0d7280]"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Assessment Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 sm:p-10 shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-150 text-center flex flex-col items-center gap-5 relative">
            <button
              onClick={() => setCancelTarget(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer bg-transparent border-0 outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4 fill-none stroke-current" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <AlertTriangleIcon className="w-7 h-7" />
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
                onClick={() => setCancelTarget(null)}
                className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] cursor-pointer flex-1 bg-transparent transition hover:bg-slate-50"
              >
                Keep Assessment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer flex-1 border-0 transition shadow-2xs hover:bg-red-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

