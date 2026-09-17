'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Send,
  Calendar,
  Users,
  PhoneCall,
  CheckCircle2,
  Download,
  Play,
  Pause,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Clock,
  User,
  Bot,
  Mail,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Search,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react'
import { StatusChip } from '@/components/atoms/StatusChip'

export interface AssessmentDetailData {
  id: string
  vendor: string
  questionnaire: string
  round: string
  status: 'awaiting_evidence' | 'completed' | 'scheduled' | 'finalised' | 'ready' | 'cancelled'
  score: string
  passRate?: string
  createdDate: string
}

interface AssessmentDetailScreenProps {
  assessment: AssessmentDetailData
  onBack: () => void
  onStatusChange?: (newStatus: 'ready' | 'finalised' | 'completed') => void
}

interface AuditTrailEvent {
  id: string
  title: string
  category: 'System' | 'Admin' | 'AI Agent' | 'Facility'
  timestamp: string
  actor: string
  details: string
  icon: React.ElementType
}

interface SnapshotFile {
  title: string
  filename: string
  size: string
  tag: 'Before' | 'After'
}

interface TestcaseItem {
  id: number
  code: string
  title: string
  category: string
  type: string
  expectedBehaviour: string
  agentComment: string
  status: 'Pass' | 'Fail' | 'Blocked' | 'Scheduled' | 'Not Applicable' | 'N/A'
  snapshots: SnapshotFile[]
}

export const AssessmentDetailScreen: React.FC<AssessmentDetailScreenProps> = ({
  assessment,
  onBack,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'audit_trail'>('assessment')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1')
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [expandedSnapshots, setExpandedSnapshots] = useState<Record<number, boolean>>({})
  const [testCasePage, setTestCasePage] = useState(1)

  // Testcase Search & Status Filter (All, Passed, Failed)
  const [testcaseSearchTerm, setTestcaseSearchTerm] = useState('')
  const [testcaseStatusFilter, setTestcaseStatusFilter] = useState<'all' | 'Pass' | 'Fail'>('all')

  const [currentStatus, setCurrentStatus] = useState<
    'awaiting_evidence' | 'completed' | 'scheduled' | 'finalised' | 'ready' | 'cancelled'
  >(assessment.status)

  useEffect(() => {
    setCurrentStatus(assessment.status)
  }, [assessment.status])

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Reschedule & Cancel Assessment Modal States
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-24')
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

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Lock background scroll when modals are open
  useEffect(() => {
    if (showRescheduleModal || showCancelModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showRescheduleModal, showCancelModal])

  const handleConfirmReschedule = () => {
    setShowRescheduleModal(false)
    setToastMessage(
      `Assessment for ${assessment.vendor} rescheduled to ${rescheduleDate} (${rescheduleStartTime} - ${rescheduleEndTime}).`
    )
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleConfirmCancel = () => {
    setShowCancelModal(false)
    setCurrentStatus('cancelled')
    if (onStatusChange) onStatusChange('ready')
    setToastMessage(`Assessment for ${assessment.vendor} has been cancelled.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Sample Meeting URL for Dispatch Call (Facility terminology)
  const meetingUrl = 'https://meet.m42.ae/call/facility-audit-9823'

  const isScheduled = currentStatus === 'scheduled'

  // Exact Assessment Lifecycle Data (9 Steps matching user screenshots, Scoring renamed to Verdict)
  const lifecycleSteps = [
    {
      title: 'Call dispatched',
      actor: 'Admin User',
      time: '1 Sept, 10:30 AM',
      status: 'DONE',
    },
    {
      title: 'Meeting Scheduled',
      actor: 'System Scheduler',
      time: '1 Sept, 01:14 PM',
      status: 'DONE',
      hasMeetingUrl: true,
    },
    {
      title: 'Participants joined',
      actor: 'Presight AI',
      time: isScheduled ? 'Pending' : '1 Sept, 01:15 PM',
      status: isScheduled ? 'AWAITING' : 'DONE',
    },
    {
      title: 'Assessment call',
      actor: 'Voice Agent Sam',
      time: isScheduled ? 'Pending' : '1 Sept, 01:19 PM',
      status: isScheduled ? 'AWAITING' : 'DONE',
    },
    {
      title: 'Call ended',
      actor: 'Voice Agent Sam',
      time: isScheduled ? 'Pending' : '1 Sept, 01:19 PM',
      status: isScheduled ? 'AWAITING' : 'DONE',
    },
    {
      title: 'Transcript composed',
      actor: 'NLP Pipeline',
      time: isScheduled ? 'Pending' : '1 Sept, 01:20 PM',
      status: isScheduled ? 'AWAITING' : 'DONE',
    },
    {
      title: 'Verdict',
      actor: 'Evaluation Subagent',
      time: isScheduled ? 'Pending' : '1 Sept, 01:22 PM',
      status: isScheduled ? 'AWAITING' : 'DONE',
    },
    {
      title: 'Report ready',
      actor: 'Audit Engine',
      time: isScheduled ? 'Pending' : '1 Sept, 01:25 PM',
      status: isScheduled ? 'AWAITING' : 'DONE',
    },
    {
      title: 'Finalized',
      actor: 'Admin User',
      time:
        !isScheduled && (currentStatus === 'completed' || currentStatus === 'finalised')
          ? '1 Sept, 02:05 PM'
          : 'Pending',
      status:
        !isScheduled && currentStatus === 'finalised'
          ? 'DONE'
          : 'AWAITING',
    },
  ]

  // Granular Audit Trail Event Data
  const auditEvents: AuditTrailEvent[] = [
    {
      id: 'aud-14',
      title: 'Assessment finalized & completed',
      category: 'Admin',
      timestamp: '1 Sept 2026, 02:05 PM',
      actor: 'Admin User (M42 Compliance)',
      details: 'Concluded assessment verdict and marked status as completed.',
      icon: ShieldCheck,
    },
    {
      id: 'aud-13',
      title: 'Compliance report generated',
      category: 'AI Agent',
      timestamp: '1 Sept 2026, 01:25 PM',
      actor: 'Audit Engine',
      details: 'Audit report compiled with 5 passed and 2 failed testcases.',
      icon: FileCheck,
    },
    {
      id: 'aud-12',
      title: 'Assessment transcript processed',
      category: 'AI Agent',
      timestamp: '1 Sept 2026, 01:20 PM',
      actor: 'NLP Pipeline',
      details: 'Call transcript processed into structured dataset. Character count: 4,820 chars.',
      icon: MessageSquare,
    },
    {
      id: 'aud-11',
      title: 'Testcase #7 evaluated (Verdict: Pass)',
      category: 'AI Agent',
      timestamp: '1 Sept 2026, 01:19 PM',
      actor: 'AI Verification Agent',
      details: 'Verified UAE data residency lock in me-central-1 datacenter.',
      icon: Bot,
    },
    {
      id: 'aud-10',
      title: 'Screenshot captured (uae_region_locked.png)',
      category: 'System',
      timestamp: '1 Sept 2026, 01:18 PM',
      actor: 'AI Test Runner',
      details: 'Captured snapshot for Testcase #7 (ID: TC-042).',
      icon: ImageIcon,
    },
    {
      id: 'aud-9',
      title: 'Testcase #3 evaluated (Verdict: Fail)',
      category: 'AI Agent',
      timestamp: '1 Sept 2026, 01:17 PM',
      actor: 'AI Verification Agent',
      details: 'Flagged missing Stage 2 ISO 27001 certificate verification.',
      icon: Bot,
    },
    {
      id: 'aud-8',
      title: 'Screenshot captured (iso_stage2_pending.png)',
      category: 'System',
      timestamp: '1 Sept 2026, 01:16 PM',
      actor: 'AI Test Runner',
      details: 'Captured snapshot for Testcase #3 (ID: TC-039).',
      icon: ImageIcon,
    },
    {
      id: 'aud-7',
      title: 'Testcase #1 evaluated (Verdict: Pass)',
      category: 'AI Agent',
      timestamp: '1 Sept 2026, 01:16 PM',
      actor: 'AI Verification Agent',
      details: 'Confirmed public registry match for Abu Dhabi HQ and ticker PRESIGHT.',
      icon: Bot,
    },
    {
      id: 'aud-6',
      title: 'Screenshot captured (adx_registry_verified.png)',
      category: 'System',
      timestamp: '1 Sept 2026, 01:15 PM',
      actor: 'AI Test Runner',
      details: 'Captured snapshot for Testcase #1 (ID: TC-035).',
      icon: ImageIcon,
    },
    {
      id: 'aud-5',
      title: 'Testcases execution started by Facilities Admin',
      category: 'Facility',
      timestamp: '1 Sept 2026, 01:15 PM',
      actor: 'Facilities Admin',
      details: 'Facilities team initiated live testcases run in call room session.',
      icon: User,
    },
    {
      id: 'aud-4',
      title: 'Participants joined call room',
      category: 'System',
      timestamp: '1 Sept 2026, 01:15 PM',
      actor: 'Facilities Admin & Agent Sam',
      details: 'Facilities representative and AI Agent Sam connected to call room.',
      icon: Users,
    },
    {
      id: 'aud-3',
      title: 'Call room session started (#9823)',
      category: 'System',
      timestamp: '1 Sept 2026, 01:14 PM',
      actor: 'M42 System Scheduler',
      details: 'Meeting URL created (https://meet.m42.ae/call/facility-audit-9823).',
      icon: Calendar,
    },
    {
      id: 'aud-2',
      title: 'Call dispatched to facility admin',
      category: 'System',
      timestamp: '1 Sept 2026, 10:30 AM',
      actor: 'M42 Dispatcher',
      details: 'Sent automated call invitation email to facility admin.',
      icon: Mail,
    },
    {
      id: 'aud-[#01]',
      title: 'Dataset selected & assessment initialized',
      category: 'Admin',
      timestamp: '1 Sept 2026, 10:25 AM',
      actor: 'Admin User (M42 Compliance)',
      details: 'Admin selected Clinical EHR Dataset and initialized assessment setup.',
      icon: Send,
    },
  ]

  const handleCopyMeetingUrl = () => {
    navigator.clipboard.writeText(meetingUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleFinalize = () => {
    const nextStatus = currentStatus === 'completed' ? 'finalised' : 'completed'
    setCurrentStatus(nextStatus)
    if (onStatusChange) {
      onStatusChange(nextStatus)
    }
    setToastMessage(
      `Assessment finalized! Status updated to ${nextStatus === 'finalised' ? 'Finalised' : 'Completed'}.`
    )
    setTimeout(() => setToastMessage(null), 3500)
  }

  const toggleExpandSnapshots = (id: number) => {
    setExpandedSnapshots((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const testcases: TestcaseItem[] = [
    {
      id: 1,
      code: 'TC-CR-01',
      category: 'Corporate Registration',
      title: 'Headquarters Location & Stock Exchange Verification',
      type: 'Problems',
      expectedBehaviour:
        'Must return valid HQ city (Abu Dhabi), country (United Arab Emirates), and registered exchange ticker (ADX: PRESIGHT).',
      agentComment:
        'AI evaluation confirmed 100% match with public exchange registry data and HQ corporate address.',
      status: 'Pass',
      snapshots: [
        { title: 'Before Snapshot', filename: 'adx_search_query_init.png', size: '142 KB', tag: 'Before' },
        { title: 'After Snapshot', filename: 'adx_registry_verified.png', size: '185 KB', tag: 'After' },
        { title: 'Snapshot 3', filename: 'company_profile.png', size: '128 KB', tag: 'Before' },
        { title: 'Snapshot 4', filename: 'registry_match.png', size: '210 KB', tag: 'After' },
        { title: 'Snapshot 5', filename: 'hq_address_match.png', size: '165 KB', tag: 'Before' },
        { title: 'Snapshot 6', filename: 'exchange_status_ok.png', size: '190 KB', tag: 'After' },
      ],
    },
    {
      id: 2,
      code: 'TC-DS-02',
      category: 'Data Security',
      title: 'Customer Data Encryption at Rest and in Transit',
      type: 'Sensitive Info',
      expectedBehaviour:
        'AES-256 for data at rest and TLS 1.2 or higher for data in transit must be explicitly configured.',
      agentComment:
        'Cipher suite audit confirmed active AES-256 storage key rotation and TLS 1.3 transport security.',
      status: 'Pass',
      snapshots: [
        { title: 'Before Snapshot', filename: 'tls_handshake_inspection.png', size: '135 KB', tag: 'Before' },
        { title: 'After Snapshot', filename: 'encryption_policy_active.png', size: '198 KB', tag: 'After' },
        { title: 'Snapshot 3', filename: 'key_rotation_config.png', size: '115 KB', tag: 'Before' },
        { title: 'Snapshot 4', filename: 'tls_config.png', size: '176 KB', tag: 'After' },
        { title: 'Snapshot 5', filename: 'storage_volume_encrypt.png', size: '144 KB', tag: 'Before' },
        { title: 'Snapshot 6', filename: 'ssl_certificate_chain.png', size: '205 KB', tag: 'After' },
      ],
    },
    {
      id: 3,
      code: 'TC-CP-03',
      category: 'Compliance',
      title: 'Current ISO/IEC 27001 Certificate Verification',
      type: 'Problems',
      expectedBehaviour:
        'Active, non-expired Stage 2 ISO/IEC 27001 certificate document must be verified.',
      agentComment:
        'Stage 1 readiness document reviewed; Stage 2 certificate verification pending audit completion.',
      status: 'Fail',
      snapshots: [
        { title: 'Before Snapshot', filename: 'iso_stage1_submitted.png', size: '155 KB', tag: 'Before' },
        { title: 'After Snapshot', filename: 'iso_stage2_pending.png', size: '172 KB', tag: 'After' },
        { title: 'Snapshot 3', filename: 'accreditation_body_check.png', size: '130 KB', tag: 'Before' },
        { title: 'Snapshot 4', filename: 'audit_schedule_notice.png', size: '160 KB', tag: 'After' },
        { title: 'Snapshot 5', filename: 'certificate_expiry_flag.png', size: '140 KB', tag: 'Before' },
        { title: 'Snapshot 6', filename: 'compliance_gap_summary.png', size: '188 KB', tag: 'After' },
      ],
    },
    {
      id: 4,
      code: 'TC-AC-04',
      category: 'Access Control',
      title: 'Identity & Access Control (SSO, MFA, Least Privilege)',
      type: 'Sensitive Info',
      expectedBehaviour:
        'Enterprise SSO provider integration, mandatory MFA enforcement, and RBAC least privilege required.',
      agentComment:
        'RBAC permissions verified, but mandatory MFA enforcement flag was found disabled in identity profile.',
      status: 'Fail',
      snapshots: [
        { title: 'Before Snapshot', filename: 'iam_policy_audit_start.png', size: '124 KB', tag: 'Before' },
        { title: 'After Snapshot', filename: 'iam_mfa_missing.png', size: '168 KB', tag: 'After' },
        { title: 'Snapshot 3', filename: 'sso_saml_config.png', size: '150 KB', tag: 'Before' },
        { title: 'Snapshot 4', filename: 'rbac_matrix_view.png', size: '182 KB', tag: 'After' },
        { title: 'Snapshot 5', filename: 'mfa_enforce_toggle.png', size: '138 KB', tag: 'Before' },
        { title: 'Snapshot 6', filename: 'user_permission_log.png', size: '194 KB', tag: 'After' },
      ],
    },
    {
      id: 5,
      code: 'TC-RS-05',
      category: 'Resilience',
      title: 'Incident Response Process & Customer Breach SLA',
      type: 'Meds Dispensing',
      expectedBehaviour:
        'Documented IR playbook with customer breach notification SLA within 72 hours.',
      agentComment:
        'Dedicated 24/7 SecOps playbook and 72-hour breach notification SLA verified.',
      status: 'Pass',
      snapshots: [
        { title: 'Before Snapshot', filename: 'ir_playbook_scan.png', size: '148 KB', tag: 'Before' },
        { title: 'After Snapshot', filename: 'ir_sla_verified.png', size: '190 KB', tag: 'After' },
        { title: 'Snapshot 3', filename: 'secops_escalation_flow.png', size: '136 KB', tag: 'Before' },
        { title: 'Snapshot 4', filename: 'breach_sla_policy.png', size: '175 KB', tag: 'After' },
        { title: 'Snapshot 5', filename: 'incident_ticket_template.png', size: '145 KB', tag: 'Before' },
        { title: 'Snapshot 6', filename: 'customer_notify_trigger.png', size: '202 KB', tag: 'After' },
      ],
    },
    {
      id: 6,
      code: 'TC-AS-06',
      category: 'Assurance',
      title: 'Penetration Test Summary or SOC 2 Type II Report',
      type: 'Problems',
      expectedBehaviour:
        'Recent (< 12 months) SOC 2 Type II report or external penetration test summary required.',
      agentComment:
        'No valid SOC 2 Type II report or external pen-test executive summary attached within 12-month window.',
      status: 'Fail',
      snapshots: [
        { title: 'Before Snapshot', filename: 'audit_vault_lookup.png', size: '130 KB', tag: 'Before' },
        { title: 'After Snapshot', filename: 'audit_report_missing.png', size: '162 KB', tag: 'After' },
        { title: 'Snapshot 3', filename: 'soc2_validity_check.png', size: '142 KB', tag: 'Before' },
        { title: 'Snapshot 4', filename: 'pentest_summary_null.png', size: '169 KB', tag: 'After' },
        { title: 'Snapshot 5', filename: 'third_party_auditor_log.png', size: '152 KB', tag: 'Before' },
        { title: 'Snapshot 6', filename: 'compliance_exception_flag.png', size: '185 KB', tag: 'After' },
      ],
    },
    {
      id: 7,
      code: 'TC-DR-07',
      category: 'Data Residency',
      title: 'Regional Data Storage & Residency Restriction',
      type: 'Sensitive Info',
      expectedBehaviour:
        'Data storage locked to UAE cloud region (me-central-1 / Abu Dhabi & Dubai datacenters).',
      agentComment:
        'Tenant metadata confirmed customer data locked strictly within UAE regional cloud datacenters.',
      status: 'Pass',
      snapshots: [
        { title: 'Before Snapshot', filename: 'tenant_region_check.png', size: '140 KB', tag: 'Before' },
        { title: 'After Snapshot', filename: 'uae_region_locked.png', size: '192 KB', tag: 'After' },
        { title: 'Snapshot 3', filename: 'me_central1_datacenter.png', size: '125 KB', tag: 'Before' },
        { title: 'Snapshot 4', filename: 'residency_isolation_rules.png', size: '180 KB', tag: 'After' },
        { title: 'Snapshot 5', filename: 'doh_compliance_cert.png', size: '155 KB', tag: 'Before' },
        { title: 'Snapshot 6', filename: 'datacenter_geo_pin.png', size: '210 KB', tag: 'After' },
      ],
    },
  ]


  // Filter testcases based on search term and status chips
  const filteredTestcases = useMemo(() => {
    return testcases.filter((q) => {
      const matchesStatus = testcaseStatusFilter === 'all' || q.status === testcaseStatusFilter
      const query = testcaseSearchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        q.title.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query) ||
        q.expectedBehaviour.toLowerCase().includes(query) ||
        q.agentComment.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [testcases, testcaseStatusFilter, testcaseSearchTerm])

  const passedCount = testcases.filter((q) => q.status === 'Pass').length
  const failedCount = testcases.filter((q) => q.status === 'Fail').length
  const blockedCount = testcases.filter((q) => q.status === 'Blocked').length
  const scheduledCount = testcases.filter((q) => q.status === 'Scheduled').length
  const naCount = testcases.filter((q) => q.status === 'N/A' || q.status === 'Not Applicable').length

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d212c] pb-16 font-sans w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#f0fdf4] text-[#15803d] text-xs font-semibold px-4 py-3 rounded-xl shadow-md border border-[#bbf7d0] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Menu */}
      <div className="w-full px-6 lg:px-10 pt-4 pb-1 text-xs font-medium flex items-center gap-1.5 text-[#64748b]">
        <button onClick={onBack} className="hover:text-[#0d7280] cursor-pointer">
          M42 admin
        </button>
        <span>/</span>
        <button onClick={onBack} className="hover:text-[#0d7280] cursor-pointer">
          Dashboard
        </button>
        <span>/</span>
        <span className="text-[#36c0c9] font-bold">Assessment details</span>
      </div>

      {/* Main Header Container Card matching Image 2 Reference */}
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-3">
        <div className="bg-[#f0f9fa]/70 rounded-3xl border border-[#d0f0f4] p-5 sm:p-7 shadow-xs flex flex-col gap-3">
          {/* Title and Subtitle */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0d212c]">
              {assessment.vendor.includes('Presight') ? 'Presight AI | See the Future Today' : assessment.vendor}
            </h1>
            <h2 className="text-xs font-semibold text-[#64748b]">
              {assessment.questionnaire || 'Technical Questionnaire'}
            </h2>
          </div>

          {/* Chips Row matching Image 2 */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            {/* Status Chip */}
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                currentStatus === 'completed'
                  ? 'bg-[#e6f4ea] text-[#137333]'
                  : currentStatus === 'scheduled'
                    ? 'bg-[#e0f2fe] text-[#0369a1]'
                    : currentStatus === 'cancelled'
                      ? 'bg-[#fce8e6] text-[#c5221f]'
                      : currentStatus === 'finalised'
                        ? 'bg-[#e6f4ea] text-[#137333]'
                        : 'bg-[#fef3c7] text-[#92400e]'
              }`}
            >
              {currentStatus === 'scheduled'
                ? 'Scheduled'
                : currentStatus === 'finalised'
                  ? 'Finalised'
                  : currentStatus === 'cancelled'
                    ? 'Cancelled'
                    : currentStatus === 'completed'
                      ? 'Completed'
                      : 'Awaiting evidence'}
            </span>

            <span className="text-[#cbd5e1] font-light">|</span>

            {/* Round Chip */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{assessment.round || 'Round 1'}</span>
            </span>

            <span className="text-[#cbd5e1] font-light">|</span>

            {/* Pass percentage Chip */}
            {currentStatus === 'scheduled' ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-[#64748b]">
                Pass rate: -
              </span>
            ) : (
              (() => {
                const passVal =
                  assessment.passRate && assessment.passRate !== '-'
                    ? parseInt(assessment.passRate.replace('%', ''), 10)
                    : Math.round((passedCount / (testcases.length || 1)) * 100)
                const confStyle =
                  passVal >= 80
                    ? 'bg-[#e6f4ea] text-[#137333]'
                    : passVal >= 60
                      ? 'bg-[#fef3c7] text-[#92400e]'
                      : 'bg-[#fce8e6] text-[#c5221f]'

                return (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${confStyle}`}>
                    Pass rate: {passVal}%
                  </span>
                )
              })()
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-6 lg:px-10 mt-6 flex flex-col gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between pb-0">
          <div className="flex items-center gap-8 border-b border-[#e2e8f0]">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`pb-3.5 text-sm font-bold flex items-center gap-2.5 transition cursor-pointer border-b-2 -mb-px ${
                activeTab === 'assessment'
                  ? 'border-[#36c0c9] text-[#36c0c9]'
                  : 'border-transparent text-[#64748b] hover:text-[#0d212c]'
              }`}
            >
              <FileText
                className={`w-4.5 h-4.5 ${activeTab === 'assessment' ? 'text-[#36c0c9]' : 'text-[#64748b]'}`}
              />
              <span>Assessment</span>
            </button>
            <button
              onClick={() => setActiveTab('audit_trail')}
              className={`pb-3.5 text-sm font-bold flex items-center gap-2.5 transition cursor-pointer border-b-2 -mb-px ${
                activeTab === 'audit_trail'
                  ? 'border-[#36c0c9] text-[#36c0c9]'
                  : 'border-transparent text-[#64748b] hover:text-[#0d212c]'
              }`}
            >
              <Clock
                className={`w-4.5 h-4.5 ${activeTab === 'audit_trail' ? 'text-[#36c0c9]' : 'text-[#64748b]'}`}
              />
              <span>Audit trail</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pb-3">
            {isScheduled ? null : currentStatus === 'completed' ? (
              <>
                <button
                  onClick={() => alert(`Downloading report for ${assessment.vendor}...`)}
                  className="px-4 py-2 rounded-xl border border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-slate-50 text-[#0d212c] bg-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer transition"
                >
                  <Download className="w-4 h-4 text-[#0d212c]" />
                  <span>Download report</span>
                </button>
                <button
                  onClick={handleFinalize}
                  className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer shadow-2xs border-0"
                >
                  Finalize
                </button>
              </>
            ) : currentStatus === 'finalised' ? (
              <button
                onClick={() => alert(`Downloading report for ${assessment.vendor}...`)}
                className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-2xs border-0"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download report</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Audit Trail Tab View */}
        {activeTab === 'audit_trail' ? (
          currentStatus === 'scheduled' ? (
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col items-center justify-center text-center gap-3 min-h-[260px]">
              <div className="w-12 h-12 rounded-2xl bg-[#ddf7f9] flex items-center justify-center text-[#36c0c9]">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h4 className="font-extrabold text-sm text-[#0d212c]">Audit log scheduled</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  The audit trail and call transcript will be generated automatically after the
                  assessment meeting is completed.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#0d212c]">
                    Audit Trail
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-xs">
                <div className="relative pl-2 flex flex-col gap-7">
                  {auditEvents.map((event, idx) => {
                    const EventIcon = event.icon
                    const isLast = idx === auditEvents.length - 1
                    return (
                      <div key={event.id} className="relative pl-8 flex flex-col gap-1">
                        {!isLast && (
                          <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-[#e2e8f0] translate-y-1" />
                        )}

                        <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-[#36c0c9] flex items-center justify-center text-white shadow-2xs z-10">
                          <EventIcon className="w-3.5 h-3.5 text-white" />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-extrabold text-sm text-[#0d212c]">{event.title}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                event.category === 'Admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : event.category === 'AI Agent'
                                    ? 'bg-[#ddf7f9] text-[#0f766e]'
                                    : event.category === 'Facility'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {event.category}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-[#64748b] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {event.timestamp}
                          </span>
                        </div>

                        <p className="text-xs text-[#0d212c] leading-relaxed mt-0.5">
                          {event.details}
                        </p>

                        <div className="text-[11px] text-[#64748b] font-medium flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>
                            Actor:{' '}
                            <strong className="text-[#0d212c] font-semibold">{event.actor}</strong>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            {/* Meeting summary section for Scheduled Assessments */}
            {isScheduled && (
              <div className="flex flex-col gap-2 w-full">
                <h3 className="text-sm font-bold text-[#0d212c]">Meeting summary</h3>
                <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-bold text-[#0d212c]">Scheduled Session Details</span>
                    <span className="text-xs text-[#64748b]">
                      Scheduled Date &amp; Time: <strong className="text-[#0d212c]">{assessment.createdDate}</strong>
                    </span>
                  </div>

                  {/* Cancel meeting button on the left and Reschedule meeting button on the right */}
                  <div className="flex items-center gap-5 shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => setShowCancelModal(true)}
                      title="If the scheduled meeting is already started the cancel and reschedule button should become disabled as the meeting is already in progress"
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-transparent border-0 cursor-pointer p-0 transition"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Cancel meeting</span>
                    </button>
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      title="If the scheduled meeting is already started the cancel and reschedule button should become disabled as the meeting is already in progress"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#36c0c9] hover:text-[#2badb6] bg-transparent border-0 cursor-pointer p-0 transition"
                    >
                      <Calendar className="w-4 h-4 text-[#36c0c9]" />
                      <span>Reschedule meeting</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Section 1: Assessment lifecycle */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[#0d212c]">Assessment lifecycle</h3>
              <div className="w-full overflow-x-auto pb-3.5 pt-1 flex items-center gap-3 subtle-scrollbar group/lifecycle">
                {lifecycleSteps.map((step, idx) => {
                  const isAwaiting = step.status === 'AWAITING'

                  return (
                    <React.Fragment key={step.title}>
                      <div
                        className="p-4 rounded-2xl bg-white shadow-xs border border-[#e2e8f0]/60 flex flex-col justify-start gap-2 h-[145px] w-[210px] shrink-0 min-w-0"
                        title={step.title}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className="font-bold text-[#0d212c] text-sm truncate"
                            title={step.title}
                          >
                            {step.title}
                          </h4>
                          {isAwaiting ? (
                            <Clock className="w-4.5 h-4.5 text-[#b45309] shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4.5 h-4.5 text-white fill-[#137333] shrink-0" />
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <p className="text-[11px] text-[#64748b]" title={step.actor}>
                            {step.actor}
                          </p>
                          <p className="text-[10px] text-[#64748b] font-medium">{step.time}</p>
                        </div>

                        {step.hasMeetingUrl && (
                          <div className="mt-auto pt-1.5 border-t border-[#e2e8f0] flex items-center justify-between gap-1 text-[11px]">
                            <span
                              className="text-[#36c0c9] font-medium truncate"
                              title={meetingUrl}
                            >
                              {meetingUrl.replace('https://', '')}
                            </span>
                            <button
                              onClick={handleCopyMeetingUrl}
                              className="p-1 text-[#64748b] hover:text-[#0d212c] transition cursor-pointer shrink-0 rounded hover:bg-slate-200/60"
                              title="Copy meeting URL"
                            >
                              {copiedUrl ? (
                                <Check className="w-3.5 h-3.5 text-[#137333]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {idx < lifecycleSteps.length - 1 && (
                        <div className="flex items-center justify-center shrink-0 px-1">
                          <ArrowRight className="w-5 h-5 text-[#36c0c9] stroke-[2.5]" />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* Section 2 & 3: Agent Verdict and Assessment audio STACKED FULL WIDTH */}
            <div className="flex flex-col gap-6 w-full">
              {/* Agent Verdict card */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0d212c]">Agent Verdict</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs w-full flex flex-col gap-5">
                  {isScheduled ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0d212c]">Verdict Pending</span>
                        <span className="text-[11px] text-[#64748b]">
                          Test cases evaluation will be generated automatically after the assessment meeting completes.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#e2e8f0] gap-4 sm:gap-0">
                      {/* Column 1: PASSED TESTCASES */}
                      <div className="sm:pr-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider">
                            PASSED
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#137333]">
                            Pass
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-[#0d212c] mt-0.5">
                          {passedCount} / {testcases.length}
                        </div>
                      </div>

                      {/* Column 2: FAILED TESTCASES */}
                      <div className="pt-3 sm:pt-0 sm:px-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider">
                            FAILED
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fce8e6] text-[#c5221f]">
                            Fail
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-[#0d212c] mt-0.5">
                          {failedCount} / {testcases.length}
                        </div>
                      </div>

                      {/* Column 3: BLOCKED TESTCASES */}
                      <div className="pt-3 sm:pt-0 sm:px-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider">
                            BLOCKED
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Blocked
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-[#0d212c] mt-0.5">
                          0 / {testcases.length}
                        </div>
                      </div>

                      {/* Column 4: SCHEDULED FOR LATER */}
                      <div className="pt-3 sm:pt-0 sm:px-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider">
                            SCHEDULED
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#0369a1]">
                            Scheduled for later
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-[#0d212c] mt-0.5">
                          0 / {testcases.length}
                        </div>
                      </div>

                      {/* Column 5: NOT APPLICABLE */}
                      <div className="pt-3 sm:pt-0 sm:pl-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider">
                            NOT APPLICABLE
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            N/A
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-[#0d212c] mt-0.5">
                          0 / {testcases.length}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment audio card */}
              <div className="flex flex-col gap-2 w-full">
                <h3 className="text-sm font-bold text-[#0d212c]">Assessment audio</h3>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs w-full flex items-center gap-4 min-h-[96px]">
                  {isScheduled ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0d212c]">No Audio Recording</span>
                        <span className="text-[11px] text-[#64748b]">
                          Audio recording will be available after the assessment call completes.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="p-2 text-[#0d212c] hover:text-[#36c0c9] hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center"
                        title={isPlayingAudio ? 'Pause' : 'Play'}
                        aria-label={isPlayingAudio ? 'Pause audio' : 'Play audio'}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-5 h-5 fill-current text-[#0d212c]" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5 fill-current text-[#0d212c]" />
                        )}
                      </button>

                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-[#36c0c9] ${isPlayingAudio ? 'w-1/3 transition-all duration-1000' : 'w-0'}`}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#64748b] font-medium">
                          <span>02:14</span>
                          <span>08:45</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(e.target.value)}
                          className="text-xs font-bold bg-slate-100 text-[#0d212c] px-2 py-1 rounded-lg border-0 cursor-pointer outline-none"
                          aria-label="Audio playback speed"
                        >
                          <option value="0.75">0.75x</option>
                          <option value="1">1.0x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Summary */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[#0d212c]">Summary</h3>
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
                <p className="text-xs text-[#64748b] leading-relaxed">
                  {isScheduled
                    ? 'No summary generated yet. The meeting has not been started.'
                    : `Assessment evaluation completed across ${testcases.length} testcases: ${passedCount} passed, ${failedCount} failed, ${blockedCount} blocked, ${scheduledCount} scheduled, ${naCount} not applicable.`}
                </p>
              </div>
            </div>

            {/* Section 5: Testcases (7) with Search Bar & Sorting Chips */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base font-extrabold text-[#0d212c]">
                  Testcases ({filteredTestcases.length})
                </h3>

                {/* Right controls: Pagination & Search */}
                <div className="flex items-center gap-3">
                  <div className="relative w-56">
                    <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search testcases..."
                      value={testcaseSearchTerm}
                      onChange={(e) => setTestcaseSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-medium text-[#0d212c] outline-none focus:border-[#36c0c9] shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTestCasePage((p) => Math.max(1, p - 1))}
                      disabled={testCasePage === 1}
                      className="w-7 h-7 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0d212c] disabled:opacity-40 cursor-pointer flex items-center justify-center transition"
                      title="Previous testcase"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-[#64748b]">
                      {testCasePage} of {filteredTestcases.length || 1}
                    </span>
                    <button
                      onClick={() => setTestCasePage((p) => Math.min(filteredTestcases.length || 1, p + 1))}
                      disabled={testCasePage >= (filteredTestcases.length || 1)}
                      className="w-7 h-7 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0d212c] disabled:opacity-40 cursor-pointer flex items-center justify-center transition"
                      title="Next testcase"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sorting Chips: All, Passed, Failed & Chips Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {[
                    { key: 'all', label: 'All', count: testcases.length },
                    { key: 'Pass', label: 'Passed', count: passedCount },
                    { key: 'Fail', label: 'Failed', count: failedCount },
                  ].map((chip) => {
                    const isSelected = testcaseStatusFilter === chip.key
                    return (
                      <button
                        key={chip.key}
                        onClick={() => setTestcaseStatusFilter(chip.key as 'all' | 'Pass' | 'Fail')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#36c0c9] text-white font-bold shadow-2xs border border-[#36c0c9]'
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

              {/* Testcase List Cards */}
              <div className="flex flex-col gap-6">
                {filteredTestcases.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] text-center text-xs text-[#64748b]">
                    No testcases matching filter criteria.
                  </div>
                ) : (
                  filteredTestcases.map((q) => {
                    const isPass = q.status === 'Pass'
                    const isExpanded = !!expandedSnapshots[q.id]
                    const sortedSnapshots = [...q.snapshots].sort((a, b) => {
                      if (a.tag === 'Before' && b.tag !== 'Before') return -1
                      if (a.tag !== 'Before' && b.tag === 'Before') return 1
                      return 0
                    })
                    const visibleSnapshots = isExpanded ? sortedSnapshots : sortedSnapshots.slice(0, 4)
                    const hiddenCount = sortedSnapshots.length - 4
                    const formattedIndex = String(q.id).padStart(2, '0')

                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs relative pl-16 flex flex-col gap-4 overflow-hidden"
                      >
                        {/* Numbered Step Circle */}
                        <div className="absolute left-5 top-6 w-8 h-8 rounded-full bg-[#ddf7f9] text-[#0d7280] font-extrabold text-xs flex items-center justify-center border border-[#36c0c9]/40 z-10 shadow-2xs">
                          {formattedIndex}
                        </div>

                        {/* Top Header Row: Title & Type Chip + Status Pill */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col min-w-0">
                            {/* Chips ABOVE title: Code chip + Type chip */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs font-extrabold text-[#0d212c] bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                {q.code}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold inline-flex items-center ${
                                  q.type === 'Problems'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : q.type === 'Sensitive Info'
                                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {q.type}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-[#0d212c] text-base leading-snug">
                              {q.title}
                            </h4>
                          </div>

                          {!isScheduled && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center shrink-0 ${
                                isPass
                                  ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceedd5]'
                                  : 'bg-[#fce8e6] text-[#c5221f] border border-[#f8c4b8]'
                              }`}
                            >
                              {isPass ? 'Pass' : 'Fail'}
                            </span>
                          )}
                        </div>

                        {/* EXPECTED BEHAVIOUR */}
                        <div className="flex items-start gap-3 pt-1">
                          <FileText className="w-5 h-5 text-[#36c0c9] shrink-0 stroke-[2.2] mt-0.5" />
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
                              EXPECTED BEHAVIOUR
                            </span>
                            <p className="text-xs text-[#0d212c] font-normal leading-relaxed">
                              {q.expectedBehaviour}
                            </p>
                          </div>
                        </div>

                        {!isScheduled && <div className="border-b border-[#e2e8f0]/60 my-0.5" />}

                        {/* AGENT COMMENT */}
                        {!isScheduled && (
                          <div className="flex items-start gap-3">
                            <Bot className="w-5 h-5 text-[#36c0c9] shrink-0 stroke-[2.2] mt-0.5" />
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
                                AGENT COMMENT
                              </span>
                              <p className="text-xs text-[#0d212c] font-normal leading-relaxed">
                                {q.agentComment}
                              </p>
                            </div>
                          </div>
                        )}

                        {!isScheduled && <div className="border-b border-[#e2e8f0]/60 my-0.5" />}

                        {/* ATTACHED SNAPSHOTS (Using attached Excel image in attachment box per user request) */}
                        {!isScheduled && (
                          <div className="flex flex-col gap-3 pt-1">
                            <div className="flex items-center gap-1.5 font-bold text-[#64748b] text-[11px] uppercase tracking-wider">
                              <Paperclip className="w-3.5 h-3.5 text-[#64748b]" />
                              <span>ATTACHED SNAPSHOTS ({q.snapshots.length})</span>
                            </div>

                            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                              {visibleSnapshots.map((snap, idxSnap) => (
                                <div
                                  key={idxSnap}
                                  className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-[#cbd5e1] transition cursor-pointer shrink-0 min-w-[220px]"
                                  onClick={() => alert(`Viewing snapshot ${snap.filename}...`)}
                                >
                                  {/* Attached Excel Screenshot Thumbnail Image */}
                                  <div className="w-14 h-10 rounded-lg border border-[#cbd5e1] shrink-0 overflow-hidden relative shadow-2xs bg-white">
                                    <img
                                      src="/excel_snapshot.png"
                                      alt={snap.filename}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  <div className="flex flex-col min-w-0">
                                    <span
                                      className="font-bold text-xs text-[#0d212c] truncate max-w-[120px]"
                                      title={snap.filename}
                                    >
                                      {snap.filename}
                                    </span>
                                    {snap.tag && (
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-0.5 ${
                                          snap.tag === 'After'
                                            ? 'bg-[#e6f4ea] text-[#137333]'
                                            : 'bg-slate-100 text-[#64748b]'
                                        }`}
                                      >
                                        {snap.tag}
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      alert(`Downloading ${snap.filename}...`)
                                    }}
                                    className="p-1 rounded-lg text-slate-400 hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer border-0 shrink-0"
                                    title={`Download ${snap.filename}`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}

                              {/* +more button — text-only, no fill or stroke */}
                              {hiddenCount > 0 && !isExpanded && (
                                <button
                                  onClick={() => toggleExpandSnapshots(q.id)}
                                  className="px-3 py-2 text-[#36c0c9] hover:text-[#0d7280] font-extrabold text-xs transition cursor-pointer shrink-0 bg-transparent border-0"
                                >
                                  +{hiddenCount} more
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reschedule Meeting Modal — Centered layout, icon top, title next line, past date disabled, start/end time validation, editable/deletable recipients, optional reason */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-8 sm:p-10 w-full max-w-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer bg-transparent border-0 outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4 fill-none stroke-current" style={{ fill: 'none', stroke: 'currentColor' }} />
            </button>

            {/* Left-aligned Icon and Title */}
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-xl bg-[#ddf7f9] text-[#0d7280] flex items-center justify-center border border-[#36c0c9]/30 shadow-2xs shrink-0">
                <Calendar className="w-4.5 h-4.5 text-[#0d7280]" />
              </div>
              <h3 className="text-lg font-bold text-[#0d212c]">Reschedule meeting</h3>
            </div>

            <div className="flex flex-col gap-4 w-full text-left">
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
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-3 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] cursor-pointer bg-transparent transition"
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
                className="flex-1 py-3 rounded-xl bg-[#36c0c9] text-white font-bold text-xs transition cursor-pointer shadow-2xs border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Assessment Modal — Center-aligned matching delete popup reference, long height reason, subtle grey focus */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
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
                className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] cursor-pointer flex-1 bg-transparent transition"
              >
                Keep Assessment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer flex-1 border-0 transition shadow-2xs"
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
