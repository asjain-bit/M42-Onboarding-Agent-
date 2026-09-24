'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Mic,
  MicOff,
  MonitorUp,
  MessageSquare,
  DoorOpen,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Fingerprint,
  Building2,
  Info,
  X,
  Calendar,
  Clock,
  Check,
  Download,
  Camera,
  FileSpreadsheet,
  ScreenShare,
  Square,
  Copy,
  Send,
  Clipboard,
  Crop,
  Image as ImageIcon,
  AppWindow,
} from 'lucide-react'
import { VendorDispatchData } from './ConfigureVendorCallScreen'

type CallRoomState = 'join' | 'waiting' | 'left' | 'finalised'

interface TranscriptEntry {
  speaker: 'Sam' | 'Facility'
  text: string
  time: string
}

interface CallRoomScreenProps {
  vendor: VendorDispatchData
  onBack: () => void
  onExitToVendors?: () => void
  userName?: string
  timing?: 'now' | 'later'
  scheduleDate?: string
  formattedTimeRange?: string
  initialRole?: 'admin' | 'vendor'
  initialFlowStep?: 'select_role' | 'admin_join' | 'vendor_input' | 'vendor_otp'
  hideChangeRole?: boolean
}

// Sample dataset evaluation transcript
const sampleTranscript: TranscriptEntry[] = [
  {
    speaker: 'Sam',
    time: '11:32 AM',
    text: "Welcome. I'm Sam, your AI assessor. Before we begin, I want to confirm you have consented to this dataset evaluation session being recorded and transcribed.",
  },
  {
    speaker: 'Facility',
    time: '11:32 AM',
    text: 'Yes, we confirm and consent to the recording.',
  },
  {
    speaker: 'Sam',
    time: '11:33 AM',
    text: "Thank you. Let's begin with Dataset 1: ADT-Family History.",
  },
  {
    speaker: 'Sam',
    time: '11:33 AM',
    text: 'Does your facility maintain formal records for patient family medical history including SNOMED codes, age of onset, and confirmed status?',
  },
  {
    speaker: 'Facility',
    time: '11:35 AM',
    text: 'Yes, our EHR system records family medical history with full SNOMED codes, confirmed/ruled-out flags, and onset age. All 24 test cases are validated.',
  },
  {
    speaker: 'Sam',
    time: '11:36 AM',
    text: 'Can you describe how your facility validates laboratory test reports (ORU-Laboratory) and critical value flags?',
  },
]

export const CallRoomScreen: React.FC<CallRoomScreenProps> = ({
  vendor,
  onBack,
  onExitToVendors,
  userName = 'Zaid Al Ali',
  timing = 'now',
  scheduleDate,
  formattedTimeRange,
  initialRole = 'admin',
  initialFlowStep = 'admin_join',
  hideChangeRole = false,
}) => {
  const [roomState, setRoomState] = useState<CallRoomState>('join')
  const [yourName, setYourName] = useState(userName)
  const [isMuted, setIsMuted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [pulseActive, setPulseActive] = useState(true)
  const [wavePhase, setWavePhase] = useState(0)

  // Screen Share & Screen Capture states
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)
  const [screenShareSource, setScreenShareSource] = useState<'entire_screen' | 'tab'>('entire_screen')
  const [activeCapturePreview, setActiveCapturePreview] = useState<{ id: string; name: string; time: string } | null>(null)
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [capturedSnapshots, setCapturedSnapshots] = useState<
    { id: string; name: string; time: string }[]
  >([])
  const [showSnapshotPreviews, setShowSnapshotPreviews] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToastNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3500)
  }

  // Assessment lifecycle
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [agentOnHold, setAgentOnHold] = useState(false)

  // AI Disclosure checkboxes
  const [adminChecked, setAdminChecked] = useState(false)
  const [vendorChecked, setVendorChecked] = useState(false)

  // Leave confirmation popup
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  // End & Finalise confirmation popup
  const [showFinaliseConfirm, setShowFinaliseConfirm] = useState(false)

  // Live timer (starts when assessment starts)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Local device file upload state & ref
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const modalFileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; name: string; size: string; type: string; sender?: string; time: string; tag?: string }[]
  >([
    {
      id: 'sample-doc-1',
      name: 'Family_History_Audit.png',
      size: '1.2 MB',
      type: 'PNG',
      time: '11:34 AM',
    },
  ])

  // Admin Upload Image 3-Option Modal States
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadModalTab, setUploadModalTab] = useState<'capture' | 'paste' | 'upload'>('capture')
  const [availableScreens, setAvailableScreens] = useState<
    { id: string; name: string; size: string; sender: string; time: string; url?: string }[]
  >([])
  const [selectedScreenIds, setSelectedScreenIds] = useState<string[]>([])
  const [showCaptureSourceModal, setShowCaptureSourceModal] = useState(false)
  const [captureSourceOption, setCaptureSourceOption] = useState<'tab' | 'window' | 'screen'>('tab')

  const handleConfirmCaptureSource = (source?: 'tab' | 'window' | 'screen') => {
    const chosen = source || captureSourceOption
    const snapNum = String(availableScreens.length + 1).padStart(2, '0')
    const snapPrefix = chosen === 'tab' ? 'Browser_Tab' : chosen === 'window' ? 'Window' : 'Entire_Screen'
    const snapName = `${snapPrefix}_Capture_${snapNum}.png`
    const snapTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const snapId = `screen-${Date.now()}`
    const newScreen = {
      id: snapId,
      name: snapName,
      size: `${Math.floor(Math.random() * 200 + 150)} KB`,
      sender: yourName.trim() || 'M42 Admin',
      time: snapTime,
      url: '/excel_snapshot.png',
    }
    setAvailableScreens((prev) => [newScreen, ...prev])
    setSelectedScreenIds((prev) => [snapId, ...prev])
    setShowCaptureSourceModal(false)
    const sourceLabel = chosen === 'tab' ? 'Tab' : chosen === 'window' ? 'Window' : 'Entire screen'
    showToastNotification(`${sourceLabel} captured and added to screens available to agent`)
  }

  const handleCaptureInModal = () => {
    setShowCaptureSourceModal(true)
  }

  const handlePasteImage = (e?: React.ClipboardEvent) => {
    let fileFound = false
    if (e && e.clipboardData) {
      const items = e.clipboardData.items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            if (file.size > 2 * 1024 * 1024) {
              showToastNotification('File size exceeds maximum limit of 2 MB')
              return
            }
            fileFound = true
            const snapNum = String(availableScreens.length + 1).padStart(2, '0')
            const snapName = file.name && file.name !== 'image.png' ? file.name : `Pasted_Screenshot_${snapNum}.png`
            const snapTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const snapId = `screen-${Date.now()}`
            const fileSizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`
            const objectUrl = URL.createObjectURL(file)
            const newScreen = {
              id: snapId,
              name: snapName,
              size: fileSizeStr || '210 KB',
              sender: yourName.trim() || 'M42 Admin',
              time: snapTime,
              url: objectUrl,
            }
            setAvailableScreens((prev) => [newScreen, ...prev])
            setSelectedScreenIds((prev) => [snapId, ...prev])
            showToastNotification('Screenshot pasted and added to screens available to agent')
          }
        }
      }
    }
    if (!fileFound && !e) {
      const snapNum = String(availableScreens.length + 1).padStart(2, '0')
      const snapName = `Pasted_Screenshot_${snapNum}.png`
      const snapTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const snapId = `screen-${Date.now()}`
      const newScreen = {
        id: snapId,
        name: snapName,
        size: `${Math.floor(Math.random() * 180 + 140)} KB`,
        sender: yourName.trim() || 'M42 Admin',
        time: snapTime,
        url: '/excel_snapshot.png',
      }
      setAvailableScreens((prev) => [newScreen, ...prev])
      setSelectedScreenIds((prev) => [snapId, ...prev])
      showToastNotification('Screenshot pasted and added to screens available to agent')
    }
  }

  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToastNotification('File size exceeds maximum limit of 2 MB')
      e.target.value = ''
      return
    }
    const snapTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const snapId = `screen-${Date.now()}`
    const fileSizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`
    const objectUrl = URL.createObjectURL(file)
    const newScreen = {
      id: snapId,
      name: file.name,
      size: fileSizeStr,
      sender: yourName.trim() || 'M42 Admin',
      time: snapTime,
      url: objectUrl,
    }
    setAvailableScreens((prev) => [newScreen, ...prev])
    setSelectedScreenIds((prev) => [snapId, ...prev])
    showToastNotification(`Uploaded ${file.name} to screens available to agent`)
    e.target.value = ''
  }

  const handleModalFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToastNotification('File size exceeds maximum limit of 2 MB')
      return
    }
    const snapTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const snapId = `screen-${Date.now()}`
    const fileSizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`
    const objectUrl = URL.createObjectURL(file)
    const newScreen = {
      id: snapId,
      name: file.name,
      size: fileSizeStr,
      sender: yourName.trim() || 'M42 Admin',
      time: snapTime,
      url: objectUrl,
    }
    setAvailableScreens((prev) => [newScreen, ...prev])
    setSelectedScreenIds((prev) => [snapId, ...prev])
    showToastNotification(`Uploaded ${file.name} to screens available to agent`)
  }

  const handleSendScreensToAgent = () => {
    if (selectedScreenIds.length === 0) return
    const selectedScreens = availableScreens.filter((s) => selectedScreenIds.includes(s.id))
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newUploads = selectedScreens.map((s) => ({
      id: `doc-${Date.now()}-${s.id}`,
      name: s.name,
      size: s.size,
      type: 'PNG',
      tag: 'Comparison',
      sender: s.sender,
      time: nowStr,
    }))

    setUploadedFiles((prev) => [...prev, ...newUploads])
    setShowUploadModal(false)
    setShowTranscript(true)
    showToastNotification(`Sent ${selectedScreens.length} screenshot(s) to agent for comparison`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileSizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newDoc = {
      id: `uploaded-${file.name.replace(/[^a-zA-Z0-9]/g, '')}-${file.size}`,
      name: file.name,
      size: fileSizeStr,
      type: file.name.split('.').pop()?.toUpperCase() || 'PNG',
      tag: 'Uploaded',
      sender:
        userRole === 'admin'
          ? yourName.trim() || 'M42 Admin'
          : vendorNameInput.trim() || vendor.name,
      time: nowStr,
    }

    setUploadedFiles((prev) => [...prev, newDoc])
    setShowTranscript(true)
    // reset input value so re-uploading same file works
    e.target.value = ''
  }

  // Toggle Screen Share
  const handleToggleScreenShare = () => {
    if (!assessmentStarted) {
      showToastNotification('Start assessment first to share screen')
      return
    }
    if (isScreenSharing) {
      setIsScreenSharing(false)
      showToastNotification('Screen sharing stopped')
    } else {
      setShowScreenShareModal(true)
    }
  }

  const handleConfirmScreenShare = () => {
    setShowScreenShareModal(false)
    setIsScreenSharing(true)
    setShowTranscript(false)
    showToastNotification('Screen sharing started')
  }

  // Screen Capture action — persistent previews on left side, stacked newest on top
  const handleCaptureScreen = () => {
    if (!assessmentStarted) {
      showToastNotification('Start assessment first to capture screen')
      return
    }
    const snapNum = String(capturedSnapshots.length + 1).padStart(2, '0')
    const snapName = `snapshot_${snapNum}.png`
    const snapTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const snapId = `snap-${Date.now()}`

    setCapturedSnapshots((prev) => [...prev, { id: snapId, name: snapName, time: snapTime }])
    setShowSnapshotPreviews(true)
  }

  // Download Results Excel/CSV Spreadsheet handler
  const handleDownloadExcelResults = () => {
    const csvHeaders = [
      'Dataset Name',
      'Test Case ID',
      'Test Case Description',
      'Expected Behaviour',
      'Agent Verdict',
      'Confidence Score',
      'Agent Evaluation Notes',
    ]
    const csvRows = [
      [
        'ADT-Family History',
        'TC-FH-01',
        'Records a patient\'s family medical history - who the condition belongs to, SNOMED code, age recorded',
        'System accurately logs family history with SNOMED code and age of onset',
        'PASS',
        '98%',
        'All 24 testcases passed. Verified SNOMED codes and relationship mapping.',
      ],
      [
        'ORU-Laboratory',
        'TC-LAB-01',
        'Holds laboratory test reports organized by category, normal ranges, abnormal/critical flags',
        'System validates blood work, chemistry panels, normal ranges, and flags',
        'PASS',
        '96%',
        'All 46 testcases verified with exact flags for abnormal laboratory findings.',
      ],
      [
        'ORU-Radiology',
        'TC-RAD-01',
        'Holds imaging reports such as Chest X-Ray, MRI, and CT Scan',
        'System processes radiology reports and preserves final/correction status',
        'PASS',
        '99%',
        '13 testcases passed. DICOM and radiology report metadata correctly formatted.',
      ],
      [
        'ORU-Clinical Documents',
        'TC-CD-01',
        'Holds ECG reports, description, performing organization, confidentiality level',
        'System logs performing organization and confidentiality levels',
        'PASS',
        '94%',
        '9 testcases passed. High-confidentiality documents secured.',
      ],
      [
        'ORU-Vitals',
        'TC-VIT-01',
        'Captures patient\'s vital sign readings (BP, heart rate, temp, height, weight, SpO2)',
        'System captures blood pressure, heart rate, temp, height, weight, and SpO2',
        'PASS',
        '100%',
        '18 testcases passed. Continuous telemetry stream parsed.',
      ],
      [
        'PPR- Problems',
        'TC-PR-01',
        'Holds patient\'s active problem/diagnosis list (Active, Inactive, Resolved)',
        'System categorizes Active, Inactive, and Sensitive diagnosis flags',
        'PASS',
        '97%',
        '12 testcases passed. ICD/SNOMED coding verified.',
      ],
      [
        'RDS - Pharmacy Dispense',
        'TC-PD-01',
        'Records when pharmacy dispenses medication - brand, dispensing notes, links',
        'System tracks medication brand, dosage, dispensing notes, and links to order',
        'PASS',
        '95%',
        '8 testcases passed. RxNorm and prescription IDs confirmed.',
      ],
    ]

    const csvContent = [
      csvHeaders.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${vendor?.name || 'Facility'}_Evaluation_Results.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToastNotification('Downloaded evaluation results spreadsheet (CSV/Excel)')
  }

  // Meeting started state (defaults to true if timing === 'now')
  const [isMeetingStarted, setIsMeetingStarted] = useState<boolean>(timing !== 'later')

  useEffect(() => {
    if (!assessmentStarted) return
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [assessmentStarted])

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0')
    const ss = (s % 60).toString().padStart(2, '0')
    return `${m}:${ss}`
  }

  // Waveform animation
  useEffect(() => {
    if (roomState !== 'waiting') return
    const interval = setInterval(() => {
      setPulseActive((p) => !p)
      setWavePhase((prev) => (prev + 1) % 5)
    }, 700)
    return () => clearInterval(interval)
  }, [roomState])

  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const waveBars = [2, 4, 7, 10, 7, 4, 2]

  // Admin initials (current user = admin = M42)
  const adminInitial = yourName.trim() ? yourName.trim()[0].toUpperCase() : 'A'
  // Facility display name
  const facilityShortName = vendor.name.split(' ').slice(0, 2).join(' ')

  const handleStartAssessment = () => {
    setAssessmentStarted(true)
    setShowTranscript(true)
  }

  const handleHoldToggle = () => {
    if (!assessmentStarted) return
    setAgentOnHold((prev) => !prev)
  }

  const [userRole, setUserRole] = useState<'admin' | 'vendor'>(initialRole)
  const [vendorFlowStep, setVendorFlowStep] = useState<
    'select_role' | 'admin_join' | 'vendor_input' | 'vendor_otp'
  >(initialFlowStep)
  const [vendorNameInput, setVendorNameInput] = useState('')
  const [vendorEmailInput, setVendorEmailInput] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend OTP 60-second countdown state
  const [resendTimer, setResendTimer] = useState<number>(60)

  // Countdown timer for Resend OTP (60s)
  useEffect(() => {
    if (vendorFlowStep !== 'vendor_otp') return
    if (resendTimer <= 0) return

    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [vendorFlowStep, resendTimer])

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)
    if (otpError) setOtpError('')
    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // ─── JOIN SCREEN ──────────────────────────────────────────────────────────────
  if (roomState === 'join') {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* M42 Logo positioned on top left side */}
        <div className="absolute top-8 left-8 sm:top-10 sm:left-12 z-20">
          <Image src="/dark-logo.png" alt="M42" width={84} height={32} className="object-contain" />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[#ddf7f9]/25 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#e0f2fe]/20 blur-3xl" />
        </div>

        {/* STEP 1: SELECT LOGIN ROLE (SSO vs FACILITY) */}
        {vendorFlowStep === 'select_role' && (
          <div className="relative w-full max-w-[440px]">
            <div className="mb-6 text-center flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#64748b] uppercase">
                Assessment Call Access
              </span>
              <h1 className="text-2xl font-bold text-[#0d212c] leading-tight">
                {vendor.name}
              </h1>
              <p className="text-xs text-[#64748b] font-normal">
                Select your role to enter the call room
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-7 flex flex-col gap-4">
              {/* Meeting Details Section */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase">
                    Meeting Details
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      isMeetingStarted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isMeetingStarted ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {isMeetingStarted ? 'Meeting Started' : 'Scheduled / Not Started'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-[#0d212c] pt-1 border-t border-[#e2e8f0]/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                    <span className="font-semibold text-[#0d212c]">
                      {scheduleDate || formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                    <span className="font-semibold text-[#0d212c]">
                      {formattedTimeRange || `${formattedTime} (GST)`}
                    </span>
                  </div>
                </div>

                {!isMeetingStarted && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2.5 rounded-xl flex items-center justify-between gap-2 mt-1 leading-normal">
                    <span>
                      Meeting has not started yet. Sign in options will unlock once the meeting time
                      begins.
                    </span>
                    <div className="relative group shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsMeetingStarted(true)}
                        className="text-[10px] font-semibold text-amber-900 underline hover:text-amber-950 cursor-pointer bg-transparent border-0"
                      >
                        Start Now
                      </button>
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-0 bottom-full mb-2 z-50 w-64 bg-[#0d212c] text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-white/10 text-center leading-tight font-normal">
                        This is added for prototype navigation purposes, do not include in final
                        designs.
                      </div>
                    </div>
                  </div>
                )}
                {isMeetingStarted && (
                  <div className="relative group flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsMeetingStarted(false)}
                      className="text-[10px] text-[#64748b] hover:text-[#0d212c] underline cursor-pointer bg-transparent border-0"
                    >
                      Reset to Not Started
                    </button>
                    <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-0 bottom-full mb-2 z-50 w-64 bg-[#0d212c] text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-white/10 text-center leading-tight font-normal">
                      This is added for prototype navigation purposes, do not include in final
                      designs.
                    </div>
                  </div>
                )}
              </div>

              <span className="text-xs font-semibold text-[#0d212c] mt-1">
                How would you like to sign in?
              </span>

              {/* Login via SSO Button — disabled if meeting is not started */}
              <button
                disabled={!isMeetingStarted}
                onClick={() => {
                  if (!isMeetingStarted) return
                  setUserRole('admin')
                  setYourName(userName || 'Zaid Al Ali')
                  setVendorFlowStep('admin_join')
                }}
                className={`w-full flex items-start gap-3 bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3.5 text-left shadow-2xs transition-all group ${
                  !isMeetingStarted
                    ? 'opacity-40 cursor-not-allowed grayscale-[20%]'
                    : 'hover:shadow-md hover:border-[#36c0c9]/50 cursor-pointer'
                }`}
              >
                <div className="mt-0.5 bg-gray-50 p-2 rounded-xl group-hover:bg-[#36c0c9]/10 transition-colors">
                  <Fingerprint className="w-5 h-5 text-gray-500 group-hover:text-[#36c0c9] transition-colors" />
                </div>
                <div className="mt-0.5">
                  <div className="font-semibold text-sm text-[#0d212c] group-hover:text-[#36c0c9] transition-colors">
                    Sign in with SSO
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Authenticate via your enterprise network
                  </div>
                </div>
              </button>

              {/* Login as a Facility Button — disabled if meeting is not started */}
              <button
                disabled={!isMeetingStarted}
                onClick={() => {
                  if (!isMeetingStarted) return
                  setUserRole('vendor')
                  setVendorNameInput('')
                  setVendorEmailInput('')
                  setVendorFlowStep('vendor_input')
                }}
                className={`w-full flex items-start gap-3 bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3.5 text-left shadow-2xs transition-all group ${
                  !isMeetingStarted
                    ? 'opacity-40 cursor-not-allowed grayscale-[20%]'
                    : 'hover:shadow-md hover:border-[#36c0c9]/50 cursor-pointer'
                }`}
              >
                <div className="mt-0.5 bg-gray-50 p-2 rounded-xl group-hover:bg-[#36c0c9]/10 transition-colors">
                  <Building2 className="w-5 h-5 text-gray-500 group-hover:text-[#36c0c9] transition-colors" />
                </div>
                <div className="mt-0.5">
                  <div className="font-semibold text-sm text-[#0d212c] group-hover:text-[#36c0c9] transition-colors">
                    Join as a Facility
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Verify via email OTP to join assessment call
                  </div>
                </div>
              </button>

              <div className="relative group flex justify-center w-full mt-2">
                <button
                  onClick={onBack}
                  className="text-xs text-center text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer bg-transparent border-0"
                >
                  ← Back to call details
                </button>
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 bg-[#0d212c] text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-white/10 text-center leading-tight font-normal">
                  This is added for prototype navigation purposes, do not include in final designs.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2A: ADMIN JOIN SCREEN */}
        {vendorFlowStep === 'admin_join' && (
          <div className="relative w-full max-w-[420px]">
            <div className="mb-6 text-center flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#64748b] uppercase">
                Assessment Call · Admin Mode
              </span>
              <h1 className="text-2xl font-bold text-[#0d212c] leading-tight">
                {vendor.name}
              </h1>
              <p className="text-xs text-[#64748b] font-normal">{vendor.sublabel}</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-7 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#36c0c9] animate-pulse inline-block" />
                <span className="text-xs font-semibold text-[#0d212c]">
                  {formattedDate}, <span className="text-[#36c0c9]">{formattedTime}</span>{' '}
                  <span className="text-[#94a3b8] font-normal">(your local time)</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0d212c]">Your name</label>
                <input
                  id="callroom-name-input"
                  type="text"
                  placeholder="e.g. Zaid Al Ali"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && yourName.trim()) setRoomState('waiting')
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-xs text-[#0d212c] outline-none focus:border-[#36c0c9] transition"
                />
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-wider text-[#0d212c] uppercase">
                  AI DISCLOSURE
                </span>
                <p className="text-[11px] text-[#64748b] leading-relaxed">
                  I am an AI agent — not a human. I am conducting this structured assessment on behalf of M42/Malaffi across the relevant domain teams. This call is recorded and transcribed for assessment purposes. By joining you consent to recording.
                </p>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    id="ai-disclosure-admin"
                    checked={adminChecked}
                    onChange={(e) => setAdminChecked(e.target.checked)}
                    className="absolute opacity-0 w-full h-full cursor-pointer z-10 m-0"
                  />
                  <div
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                      adminChecked
                        ? 'bg-[#36c0c9] border-[#36c0c9]'
                        : 'bg-white border-[#cbd5e1] hover:border-[#94a3b8]'
                    }`}
                  >
                    {adminChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </div>
                <label htmlFor="ai-disclosure-admin" className="text-xs text-[#0d212c] leading-relaxed cursor-pointer select-none">
                  I acknowledge I am speaking with an AI agent conducting this assessment on behalf of M42/Malaffi
                </label>
              </div>

              <button
                id="callroom-join-btn"
                disabled={!yourName.trim() || !adminChecked}
                onClick={() => setRoomState('waiting')}
                className="w-full bg-[#36c0c9] hover:bg-[#2badb6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer border-0 shadow-md"
              >
                Open Call Room
              </button>

              {hideChangeRole ? (
                <button
                  onClick={onBack}
                  className="text-xs text-center text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer bg-transparent border-0 mt-1"
                >
                  ← Back to call details
                </button>
              ) : (
                <button
                  onClick={() => setVendorFlowStep('select_role')}
                  className="text-xs text-center text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer bg-transparent border-0 mt-1"
                >
                  ← Change login role
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2B: FACILITY DETAILS SCREEN (Name & Email mandatory) */}
        {vendorFlowStep === 'vendor_input' &&
          (() => {
            const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorEmailInput.trim())
            const isFormValid = vendorNameInput.trim() !== '' && isEmailValid

            return (
              <div className="relative w-full max-w-[420px]">
                <div className="mb-6 text-center flex flex-col items-center gap-1">
                  <h1 className="text-2xl font-bold text-[#0d212c] leading-tight">
                    {vendor.name}
                  </h1>
                  <p className="text-xs text-[#64748b] font-normal">Facility Identity Verification</p>
                </div>

                <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-7 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#0d212c]">
                      Facility Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter facility name..."
                      value={vendorNameInput}
                      onChange={(e) => setVendorNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-xs text-[#0d212c] outline-none focus:border-[#36c0c9] transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-semibold text-[#0d212c]">
                        Facility Email ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group cursor-pointer">
                        <Info className="w-3.5 h-3.5 text-[#64748b] hover:text-[#0d212c] transition" />
                        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 bottom-6 z-50 w-64 bg-[#0d212c] text-white text-xs p-3 rounded-xl shadow-xl border border-white/10 text-left leading-relaxed font-normal">
                          A 4-digit OTP will be sent to your email for verification.
                        </div>
                      </div>
                    </div>

                    <input
                      type="email"
                      placeholder="e.g. contact@facility.com"
                      value={vendorEmailInput}
                      onChange={(e) => setVendorEmailInput(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#f8fafc] text-xs text-[#0d212c] outline-none transition ${
                        vendorEmailInput.trim() !== '' && !isEmailValid
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#e2e8f0] focus:border-[#36c0c9]'
                      }`}
                    />
                    {vendorEmailInput.trim() !== '' && !isEmailValid && (
                      <p className="text-[11px] text-red-500 font-normal animate-in fade-in duration-150">
                        Please enter a valid email address.
                      </p>
                    )}
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex flex-col gap-2 mt-2">
                    <span className="text-[10px] font-bold tracking-wider text-[#0d212c] uppercase">
                      AI DISCLOSURE
                    </span>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      I am an AI agent — not a human. I am conducting this structured assessment on behalf of M42/Malaffi across the relevant domain teams. This call is recorded and transcribed for assessment purposes. By joining you consent to recording.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 relative">
                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        id="ai-disclosure-vendor"
                        checked={vendorChecked}
                        onChange={(e) => setVendorChecked(e.target.checked)}
                        className="absolute opacity-0 w-full h-full cursor-pointer z-10 m-0"
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                          vendorChecked
                            ? 'bg-[#36c0c9] border-[#36c0c9]'
                            : 'bg-white border-[#cbd5e1] hover:border-[#94a3b8]'
                        }`}
                      >
                        {vendorChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <label htmlFor="ai-disclosure-vendor" className="text-xs text-[#0d212c] leading-relaxed cursor-pointer select-none">
                      I acknowledge I am speaking with an AI agent conducting this assessment on behalf of M42/Malaffi
                    </label>
                  </div>

                  <button
                    id="vendor-send-otp-btn"
                    disabled={!isFormValid || !vendorChecked}
                    onClick={() => {
                      setOtpDigits(['', '', '', ''])
                      setOtpError('')
                      setResendTimer(60)
                      setVendorFlowStep('vendor_otp')
                    }}
                    className="w-full bg-[#36c0c9] hover:bg-[#2badb6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer border-0 shadow-md mt-1"
                  >
                    Send OTP
                  </button>

                  <button
                    onClick={() => setVendorFlowStep('select_role')}
                    className="text-xs text-center text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer bg-transparent border-0"
                  >
                    ← Back to Login Options
                  </button>
                </div>
              </div>
            )
          })()}

        {/* STEP 2C: 4-BLOCK OTP VERIFICATION SCREEN */}
        {vendorFlowStep === 'vendor_otp' && (
          <div className="relative w-full max-w-[420px]">
            <div className="mb-6 text-center flex flex-col items-center gap-1">
              <h1 className="text-2xl font-bold text-[#0d212c] leading-tight">
                Enter OTP Code
              </h1>
              <p className="text-xs text-[#64748b] font-normal">
                OTP sent to <span className="font-semibold text-[#0d212c]">{vendorEmailInput}</span>
                <span className="inline-block mx-1.5 text-gray-300">•</span>
                <span className="text-[#0d7280] font-semibold">Valid for 5 minutes</span>
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0d212c]">
                  4-Digit Verification Code
                </label>
                <span className="text-[10px] text-[#0d7280] font-bold bg-[#ddf7f9] px-2 py-0.5 rounded-md border border-[#36c0c9]/30">
                  Demo OTP: 1234
                </span>
              </div>

              {/* 4 Separate Digit Input Blocks */}
              <div className="flex items-center justify-center gap-3 my-2">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el
                    }}
                    type="text"
                    maxLength={1}
                    value={otpDigits[index] || ''}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-12 h-14 rounded-xl border text-center text-xl font-bold text-[#0d212c] outline-none transition ${
                      otpError
                        ? 'border-red-500 bg-red-50/50 focus:border-red-600'
                        : 'border-[#e2e8f0] bg-[#f8fafc] focus:border-[#36c0c9]'
                    }`}
                  />
                ))}
              </div>

              {/* Error Message display */}
              {otpError && (
                <p className="text-xs text-red-600 font-semibold text-center animate-in fade-in duration-150">
                  {otpError}
                </p>
              )}

              {/* Resend OTP */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#64748b] my-0.5">
                <span>Don&apos;t get the code?</span>
                {resendTimer > 0 ? (
                  <span className="font-semibold text-[#94a3b8] cursor-not-allowed">
                    Resend OTP ({resendTimer}s)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDigits(['', '', '', ''])
                      setOtpError('')
                      setResendTimer(60)
                    }}
                    className="font-semibold text-[#36c0c9] hover:text-[#2badb6] transition cursor-pointer bg-transparent border-0 p-0 underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#64748b] leading-relaxed text-center">
                Enter the 4-digit code to complete verification and enter the assessment call room.{' '}
                <span className="font-semibold text-[#0d212c]">
                  Note: This OTP is valid for 5 minutes only.
                </span>
              </p>

              <button
                id="vendor-verify-otp-btn"
                onClick={() => {
                  const code = otpDigits.join('')
                  if (code.length < 4 || code !== '1234') {
                    setOtpError('Invalid OTP entered. Please try again.')
                    return
                  }
                  setYourName(vendorNameInput.trim() || vendor.name)
                  setUserRole('vendor')
                  setRoomState('waiting')
                }}
                className="w-full bg-[#36c0c9] hover:bg-[#2badb6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer border-0 shadow-md"
              >
                Verify &amp; Enter Call Room
              </button>

              <button
                onClick={() => setVendorFlowStep('vendor_input')}
                className="text-xs text-center text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer bg-transparent border-0 mt-1"
              >
                ← Back to call details
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── FINALISED SCREEN ─────────────────────────────────────────────────────────
  if (roomState === 'finalised') {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* M42 Logo positioned on top left side outside the modal */}
        <div className="absolute top-8 left-8 sm:top-10 sm:left-12 z-20">
          <Image src="/dark-logo.png" alt="M42" width={84} height={32} className="object-contain" />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[#ddf7f9]/20 blur-3xl" />
        </div>

        <div className="relative bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-8 max-w-md w-full flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ddf7f9] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#0d7280]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-[#0d212c]">Assessment finalised</h2>
              <p className="text-xs text-[#64748b] leading-relaxed">
                The call has ended for all participants. The transcript, audit log, and evaluation results have been
                saved.
              </p>
            </div>
          </div>

          {/* Transcript preview */}
          <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-4 flex flex-col gap-3 max-h-[240px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
                Call Transcript
              </span>
              {userRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    const fullText = sampleTranscript.map((t) => `${t.speaker} (${t.time}): ${t.text}`).join('\n')
                    navigator.clipboard.writeText(fullText)
                    showToastNotification('Transcript copied to clipboard')
                  }}
                  className="text-[10px] font-semibold text-[#0d7280] hover:text-[#09515b] flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 transition"
                  title="Copy transcript"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              )}
            </div>
            {sampleTranscript.map((entry, idx) => (
              <div key={idx} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold ${entry.speaker === 'Sam' ? 'text-[#0d7280]' : 'text-[#0d212c]'}`}
                  >
                    {entry.speaker}
                  </span>
                  <span className="text-[9px] text-[#94a3b8]">{entry.time}</span>
                </div>
                <p className="text-xs text-[#0d212c] leading-relaxed">{entry.text}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 w-full">
            {userRole === 'admin' ? (
              <>
                <div className="flex items-center gap-2.5 w-full">
                  {/* Download transcript on the left side (Secondary) */}
                  <button
                    id="callroom-download-transcript-btn"
                    onClick={() => {
                      const fullText = sampleTranscript.map((t) => `${t.speaker} (${t.time}): ${t.text}`).join('\n')
                      const element = document.createElement('a')
                      const file = new Blob([fullText], { type: 'text/plain' })
                      element.href = URL.createObjectURL(file)
                      element.download = 'call_transcript.txt'
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                      showToastNotification('Downloaded call transcript')
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 text-[#0d212c] font-semibold text-xs py-3 rounded-xl border border-[#cbd5e1] transition cursor-pointer flex items-center justify-center shadow-2xs"
                  >
                    Download transcript
                  </button>

                  {/* Download Results on the right side (Primary) */}
                  <button
                    id="callroom-download-results-excel-btn"
                    onClick={handleDownloadExcelResults}
                    className="flex-1 bg-[#36c0c9] hover:bg-[#2badb6] text-white font-semibold text-xs py-3 rounded-xl transition cursor-pointer border-0 flex items-center justify-center shadow-xs"
                  >
                    Download Results
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (onExitToVendors) onExitToVendors()
                    else onBack()
                  }}
                  className="w-full bg-transparent text-[#64748b] hover:text-[#0d212c] font-semibold text-xs py-2.5 rounded-xl cursor-pointer border-0"
                >
                  Back to facilities
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  if (onExitToVendors) onExitToVendors()
                  else onBack()
                }}
                className="w-full bg-[#36c0c9] hover:bg-[#2badb6] text-white font-semibold text-xs py-3 rounded-xl transition cursor-pointer border-0 flex items-center justify-center gap-2 shadow-xs"
              >
                Back to facilities
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── LEFT CALL SCREEN ─────────────────────────────────────────────────────────
  if (roomState === 'left') {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[#ddf7f9]/20 blur-3xl" />
        </div>

        <div className="relative bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-8 max-w-md w-full flex flex-col items-center gap-6 text-center">
          <Image src="/dark-logo.png" alt="M42" width={72} height={28} className="object-contain" />
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0d212c]">You have left the meeting</h2>
            <p className="text-xs text-[#64748b] leading-relaxed">
              {userRole === 'admin'
                ? 'Do you want to rejoin the assessment session or download evaluation results?'
                : 'Do you want to rejoin the assessment session?'}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-2">
            {userRole === 'admin' ? (
              <div className="flex items-center gap-2.5 w-full">
                <button
                  onClick={handleDownloadExcelResults}
                  className="flex-1 bg-white hover:bg-slate-50 text-[#0d212c] border border-[#cbd5e1] font-semibold text-xs py-3 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  Download Results
                </button>

                <button
                  id="callroom-rejoin-btn"
                  onClick={() => {
                    setShowLeaveConfirm(false)
                    setRoomState('waiting')
                  }}
                  className="flex-1 bg-[#36c0c9] hover:bg-[#2badb6] text-white border-0 font-semibold text-xs py-3 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Rejoin call
                </button>
              </div>
            ) : (
              <button
                id="callroom-rejoin-btn"
                onClick={() => {
                  setShowLeaveConfirm(false)
                  setVendorNameInput('')
                  setVendorEmailInput('')
                  setOtpDigits(['', '', '', ''])
                  setOtpError('')
                  setVendorFlowStep('vendor_input')
                  setRoomState('join')
                }}
                className="w-full bg-[#36c0c9] hover:bg-[#2badb6] text-white border-0 font-semibold text-xs py-3 rounded-xl transition cursor-pointer shadow-xs"
              >
                Rejoin call
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => {
                  if (onExitToVendors) {
                    onExitToVendors()
                  } else {
                    onBack()
                  }
                }}
                className="w-full bg-transparent text-[#64748b] hover:text-[#0d212c] font-semibold text-xs py-2.5 rounded-xl cursor-pointer border-0 mt-1"
              >
                Back to facilities
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── IN-CALL ROOM ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Dynamic Toast Notification in Light Theme */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[10000] bg-white text-[#0d212c] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-[#e2e8f0] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#36c0c9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Leave Confirmation Popup */}
      {showLeaveConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0d212c]/40 backdrop-blur-xs"
            onClick={() => setShowLeaveConfirm(false)}
          />
          <div className="relative bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-8 sm:p-10 max-w-lg w-full flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150 min-h-[220px] justify-center z-10">
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#0d212c]">Leave the call?</h3>
              <p className="text-xs text-[#64748b] leading-relaxed max-w-md">
                You will leave the active audio room session. You can rejoin with the same link
                while the call is live.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0d212c] font-semibold text-xs py-3 rounded-xl transition cursor-pointer border-0"
              >
                Stay in call
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false)
                  setRoomState('left')
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-3 rounded-xl transition cursor-pointer border-0 shadow-2xs"
              >
                Leave call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End & Finalise Confirmation Popup */}
      {showFinaliseConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0d212c]/40 backdrop-blur-xs"
            onClick={() => setShowFinaliseConfirm(false)}
          />
          <div className="relative bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-8 sm:p-10 max-w-lg w-full flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150 min-h-[240px] justify-center z-10">
            <button
              type="button"
              onClick={() => setShowFinaliseConfirm(false)}
              className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#0d212c] transition cursor-pointer border-0 bg-transparent p-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-[#ddf7f9] text-[#0d7280] flex items-center justify-center border border-[#b2ecf2] shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#0d212c]">End & Finalise Assessment?</h3>
              <p className="text-xs text-[#64748b] leading-relaxed max-w-md">
                This will end the live call for all participants and mark the assessment as
                complete. The audit log, evaluation results Excel file, and transcript will be saved.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => setShowFinaliseConfirm(false)}
                className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0d212c] font-semibold text-xs py-3 rounded-xl transition cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFinaliseConfirm(false)
                  setRoomState('finalised')
                }}
                className="flex-1 bg-[#0d212c] hover:bg-[#122e3d] text-white font-semibold text-xs py-3 rounded-xl transition cursor-pointer border-0 shadow-2xs"
              >
                End & Finalise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Share Source Selection Modal (Light Theme) */}
      {showScreenShareModal && (
        <div className="fixed inset-0 z-[10000] bg-[#0d212c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 w-full max-w-md flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#0d212c]">Share your screen</h3>
              <p className="text-xs text-[#64748b]">
                Select what you would like to share with Sam AI and session participants.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div
                onClick={() => setScreenShareSource('entire_screen')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3.5 ${
                  screenShareSource === 'entire_screen'
                    ? 'border-[#36c0c9] bg-[#ddf7f9]/30'
                    : 'border-[#e2e8f0] bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    screenShareSource === 'entire_screen'
                      ? 'bg-[#36c0c9] text-white'
                      : 'bg-slate-100 text-[#64748b]'
                  }`}
                >
                  <ScreenShare className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">Entire Screen</span>
                  <span className="text-[11px] text-[#64748b]">Share your full desktop screen and all windows</span>
                </div>
              </div>

              <div
                onClick={() => setScreenShareSource('tab')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3.5 ${
                  screenShareSource === 'tab'
                    ? 'border-[#36c0c9] bg-[#ddf7f9]/30'
                    : 'border-[#e2e8f0] bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    screenShareSource === 'tab'
                      ? 'bg-[#36c0c9] text-white'
                      : 'bg-slate-100 text-[#64748b]'
                  }`}
                >
                  <MonitorUp className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">Tab or Window</span>
                  <span className="text-[11px] text-[#64748b]">Share a single browser tab or application window</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowScreenShareModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-slate-100 cursor-pointer border-0 bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmScreenShare}
                className="px-5 py-2 rounded-xl bg-[#36c0c9] text-white font-semibold text-xs hover:bg-[#0d7280] transition cursor-pointer shadow-2xs border-0"
              >
                Share Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to choose Tab, Window, or Entire Screen for Capture */}
      {showCaptureSourceModal && (
        <div className="fixed inset-0 z-[10010] bg-[#0d212c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 w-full max-w-md flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-[#0d212c] shrink-0" />
                <h3 className="text-base font-bold text-[#0d212c]">Choose what to share</h3>
              </div>
              <button
                onClick={() => setShowCaptureSourceModal(false)}
                className="p-1.5 rounded-xl text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748b]">
              Select whether you want to capture a single browser tab, an application window, or your entire screen.
            </p>

            <div className="flex flex-col gap-2.5">
              <div
                onClick={() => setCaptureSourceOption('tab')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                  captureSourceOption === 'tab'
                    ? 'border-[#36c0c9] bg-[#ddf7f9]/30'
                    : 'border-[#e2e8f0] bg-white hover:bg-slate-50'
                }`}
              >
                <MonitorUp className="w-5 h-5 text-[#0d212c] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">Browser Tab</span>
                  <span className="text-[11px] text-[#64748b]">Share a single browser tab (e.g. portal, EMR)</span>
                </div>
              </div>

              <div
                onClick={() => setCaptureSourceOption('window')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                  captureSourceOption === 'window'
                    ? 'border-[#36c0c9] bg-[#ddf7f9]/30'
                    : 'border-[#e2e8f0] bg-white hover:bg-slate-50'
                }`}
              >
                <AppWindow className="w-5 h-5 text-[#0d212c] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">Window</span>
                  <span className="text-[11px] text-[#64748b]">Share a specific application or EMR window</span>
                </div>
              </div>

              <div
                onClick={() => setCaptureSourceOption('screen')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                  captureSourceOption === 'screen'
                    ? 'border-[#36c0c9] bg-[#ddf7f9]/30'
                    : 'border-[#e2e8f0] bg-white hover:bg-slate-50'
                }`}
              >
                <ScreenShare className="w-5 h-5 text-[#0d212c] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0d212c]">Entire Screen</span>
                  <span className="text-[11px] text-[#64748b]">Share your full desktop screen and all windows</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setShowCaptureSourceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-slate-100 cursor-pointer border-0 bg-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCaptureSource()}
                className="px-5 py-2.5 rounded-xl bg-[#36c0c9] text-white font-semibold text-xs hover:bg-[#2badb6] transition cursor-pointer shadow-xs border-0 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Capture &amp; Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Image 3-Option Modal (Light Theme Design) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[10000] bg-[#0d212c]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 w-full max-w-lg flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <MonitorUp className="w-5 h-5 text-[#0d212c] shrink-0" />
                <h3 className="text-base font-bold text-[#0d212c]">Upload Image</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs matching Assessment Detail / Dashboard design language without icons */}
            <div className="flex items-center gap-6 sm:gap-8 border-b border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setUploadModalTab('capture')}
                className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
                  uploadModalTab === 'capture'
                    ? 'border-[#36c0c9] text-[#36c0c9]'
                    : 'border-transparent text-[#64748b]'
                }`}
              >
                <span>Capture screen</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadModalTab('paste')}
                className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
                  uploadModalTab === 'paste'
                    ? 'border-[#36c0c9] text-[#36c0c9]'
                    : 'border-transparent text-[#64748b]'
                }`}
              >
                <span>Paste image</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadModalTab('upload')}
                className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
                  uploadModalTab === 'upload'
                    ? 'border-[#36c0c9] text-[#36c0c9]'
                    : 'border-transparent text-[#64748b]'
                }`}
              >
                <span>Upload file</span>
              </button>
            </div>

            {/* Strictly Fixed Height Tab Content Panels to keep modal height identical when switching tabs */}
            <div className="h-[165px] flex flex-col justify-between overflow-hidden">
              {/* Tab 1: Capture Screen */}
              {uploadModalTab === 'capture' && (
                <div className="flex flex-col justify-between h-full gap-2.5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-sm font-semibold text-[#0d212c]">Capture your portal screen</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Open the portal/window/tab you want to share. Capture one frame and send it to the agent.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCaptureInModal}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#36c0c9] hover:bg-[#2badb6] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-xs shrink-0"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture screen</span>
                  </button>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#64748b] leading-relaxed shrink-0">
                    <strong>Tip:</strong> Use this to capture your portal/EMR screen — either with the browser capture flow or your OS snipping tool.
                  </div>
                </div>
              )}

              {/* Tab 2: Paste Image */}
              {uploadModalTab === 'paste' && (
                <div className="flex flex-col justify-between h-full gap-2.5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-sm font-semibold text-[#0d212c]">Paste a screenshot</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Take a screenshot with your OS tool, copy it to your clipboard, then paste it here.
                    </p>
                  </div>

                  <div
                    tabIndex={0}
                    onClick={() => handlePasteImage()}
                    onPaste={handlePasteImage}
                    className="flex-1 border-2 border-dashed border-[#cbd5e1] hover:border-[#36c0c9] bg-[#f8fafc] rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition outline-none focus:border-[#36c0c9] group"
                  >
                    <Clipboard className="w-5 h-5 text-[#64748b] group-hover:text-[#36c0c9] transition" />
                    <p className="text-xs text-[#64748b]">
                      Click here, then paste <strong className="text-[#0d212c]">Ctrl + V</strong> or press <strong className="text-[#0d212c]">⌘ + V</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Upload File */}
              {uploadModalTab === 'upload' && (
                <div className="flex flex-col justify-between h-full gap-2.5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-sm font-semibold text-[#0d212c]">Upload an image file</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Select or drop an image from your local device storage.
                    </p>
                  </div>

                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleModalFileUpload}
                  />

                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDrop={handleModalFileDrop}
                    className="flex-1 border-2 border-dashed border-[#cbd5e1] hover:border-[#36c0c9] bg-[#f8fafc] rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition group"
                  >
                    <MonitorUp className="w-5 h-5 text-[#64748b] group-hover:text-[#36c0c9] transition" />
                    <p className="text-xs text-[#64748b]">
                      <strong className="text-[#0d212c]">Drag &amp; drop an image here</strong> or click to browse files
                    </p>
                    <span className="text-[10px] text-[#94a3b8]">
                      Supported formats: PNG, JPG, JPEG · Maximum file size: 2 MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Divider: RECENT UPLOADS */}
            <div className="relative flex py-1.5 items-center">
              <div className="flex-grow border-t border-[#e2e8f0]" />
              <span className="flex-shrink mx-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">
                RECENT UPLOADS
              </span>
              <div className="flex-grow border-t border-[#e2e8f0]" />
            </div>

            {/* Screens available to agent */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0d212c]">Screens available to agent</span>
                {availableScreens.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvailableScreens([])
                      setSelectedScreenIds([])
                    }}
                    className="text-xs font-semibold text-[#36c0c9] hover:text-[#0d7280] bg-transparent border-0 cursor-pointer p-0"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {availableScreens.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-7 px-4 rounded-2xl bg-[#f8fafc] border border-dashed border-[#e2e8f0] gap-2.5">
                  <ImageIcon className="w-7 h-7 text-[#94a3b8]" />
                  <div className="flex flex-col gap-0.5">
                    <h5 className="text-xs font-semibold text-[#0d212c]">No uploads yet</h5>
                    <p className="text-[11px] text-[#64748b] max-w-xs leading-relaxed">
                      Upload file or capture a screenshot and send it to the agent for comparison.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-44 overflow-y-auto subtle-scrollbar p-0.5">
                  {availableScreens.map((screen) => {
                    const isSelected = selectedScreenIds.includes(screen.id)
                    return (
                      <div
                        key={screen.id}
                        onClick={() => {
                          setSelectedScreenIds((prev) =>
                            prev.includes(screen.id)
                              ? prev.filter((id) => id !== screen.id)
                              : [...prev, screen.id]
                          )
                        }}
                        className="rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#cbd5e1] transition cursor-pointer p-2 flex flex-col gap-1.5 relative shadow-xs"
                      >
                        <div className="relative rounded-xl overflow-hidden border border-[#e2e8f0] bg-slate-100 h-20">
                          <img
                            src={screen.url || '/excel_snapshot.png'}
                            alt={screen.name}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold ${
                              isSelected ? 'bg-[#36c0c9] shadow-xs' : 'bg-black/30'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex flex-col px-0.5">
                          <span className="text-xs font-semibold text-[#0d212c] truncate" title={screen.name}>
                            {screen.name}
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            {screen.size} · {screen.sender}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions - only rendered when availableScreens > 0 */}
            {availableScreens.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  disabled={selectedScreenIds.length === 0}
                  onClick={handleSendScreensToAgent}
                  className="w-full py-3 px-4 rounded-2xl bg-[#36c0c9] hover:bg-[#2badb6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to agent for comparison</span>
                </button>

                <p className="text-xs text-[#64748b] text-left leading-relaxed">
                  Agent will receive the selected {selectedScreenIds.length > 1 ? `${selectedScreenIds.length} images` : 'image'} and compare it against the captured EMR frame.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Snapshot Previews — Left side of screen, stacked with newest on top */}
      {capturedSnapshots.length > 0 && (
        <div className="fixed left-4 bottom-20 z-50 flex flex-col gap-1.5 items-start">
          <button
            onClick={() => setShowSnapshotPreviews(!showSnapshotPreviews)}
            className="text-[10px] font-semibold text-[#64748b] hover:text-[#0d212c] bg-transparent border-0 cursor-pointer p-0 mb-1 transition"
          >
            {showSnapshotPreviews ? 'Hide snapshots' : 'Show snapshots'}
          </button>
          {showSnapshotPreviews && (
            <div className="flex flex-col-reverse gap-1.5 max-h-[50vh] overflow-y-auto">
              {capturedSnapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="bg-white border border-[#cbd5e1] rounded-xl shadow-lg p-1.5 flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-200 w-[140px]"
                >
                  <div className="relative rounded-md overflow-hidden border border-[#e2e8f0] bg-slate-50">
                    <img
                      src="/excel_snapshot.png"
                      alt={snap.name}
                      className="w-full h-16 object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-[#64748b] font-normal px-0.5">
                    <span className="truncate">{snap.name}</span>
                    <span>{snap.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TOP BAR ──────────────────────────────────────────────────────────────── */}
      <div className="h-[52px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-5 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Image src="/dark-logo.png" alt="M42" width={56} height={22} className="object-contain" />
          <div className="w-px h-5 bg-[#e2e8f0]" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-[#0d212c] truncate max-w-[220px]">
              {vendor.name}
            </span>
            <span className="text-[10px] text-[#64748b] truncate max-w-[220px]">
              {vendor.sublabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'admin' && assessmentStarted && (
            <button
              id="callroom-top-download-results-btn"
              onClick={handleDownloadExcelResults}
              className="px-3.5 py-1.5 rounded-xl bg-[#36c0c9] hover:bg-[#2badb6] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border-0 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Results</span>
            </button>
          )}

          {assessmentStarted ? (
            <span className="inline-flex items-center gap-2 bg-[#dcfce7] text-[#15803d] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-[#bbf7d0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse inline-block" />
              Live · {formatElapsed(elapsedSeconds)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-[#fde68a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse inline-block" />
              Waiting to start
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative">
        {/* ── STAGE ──────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 relative bg-[#f8fafc]">
          {/* Background blob */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-[#ddf7f9]/20 blur-3xl" />
          </div>

          {/* Floating Presentation Bar at Top Center (Light Theme) */}
          {isScreenSharing && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-white text-[#0d212c] px-4 py-2 rounded-full shadow-lg border border-[#e2e8f0] flex items-center gap-3.5 animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
                <span className="text-xs font-semibold text-[#0d212c]">Screen share active</span>
              </div>
              <div className="w-px h-4 bg-[#e2e8f0]" />
              <button
                type="button"
                onClick={handleToggleScreenShare}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer border-0 shadow-xs"
                title="Stop presenting"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop presenting</span>
              </button>
            </div>
          )}

          {/* ── CENTER STAGE ─────────────────────────────────────────────────────── */}
          {isScreenSharing ? (
            /* Active Screen Presentation Stage (uses available width on the left and leaves space on right) */
            <div className="flex-1 flex flex-col items-start min-h-0 p-4 sm:p-6 relative z-0">
              <div className="w-full max-w-[calc(100%-280px)] flex-1 bg-white rounded-2xl border border-[#cbd5e1] shadow-xl overflow-hidden flex flex-col">
                {/* Screen Share Window Bar */}
                <div className="bg-[#0d212c] px-4 py-2.5 flex items-center justify-between text-white shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 ml-2 truncate">
                      Malaffi EHR Live Portal — Clinical Records &amp; Diagnostic Sync [Shared Screen]
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      1080p · 60fps
                    </span>
                  </div>
                </div>

                {/* Shared Screen Content Mockup */}
                <div className="flex-1 bg-[#f8fafc] p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-[#0d212c]">Patient Record: Fatima Al Mansoori (ID: #M42-9921)</h4>
                      <p className="text-[11px] text-[#64748b]">Dataset: ADT-Family History &amp; Clinical Diagnostics</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333]">
                      Verified HL7 v2.5 / FHIR R4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col gap-2">
                      <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                        Family Medical History Codes
                      </span>
                      <div className="space-y-2 text-xs text-[#0d212c]">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span>Hypertension (Maternal)</span>
                          <span className="font-mono font-semibold text-[#36c0c9]">SNOMED: 38341003</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span>Type 2 Diabetes (Paternal)</span>
                          <span className="font-mono font-semibold text-[#36c0c9]">SNOMED: 44054006</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span>Coronary Artery Disease</span>
                          <span className="font-mono font-semibold text-[#36c0c9]">SNOMED: 53741008</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col gap-2 justify-between">
                      <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                        AI Assessment Real-Time Validation
                      </span>
                      <div className="p-3 rounded-lg bg-[#ddf7f9]/40 border border-[#36c0c9]/40 text-xs text-[#0d212c] flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#36c0c9] animate-ping shrink-0" />
                        <span className="font-normal">Sam AI is actively analyzing the shared screen EHR stream and evaluating TC-FH-01 testcase parameters...</span>
                      </div>
                      <div className="text-[11px] text-[#64748b] flex items-center justify-between pt-1">
                        <span>Screen Stream Latency: <strong>14ms</strong></span>
                        <span className="text-[#137333] font-semibold">Sync Optimal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-4 relative z-0">
              {/* AI Assessor Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-[#36c0c9]/25 transition-all duration-700 ${pulseActive ? 'scale-[1.18] opacity-100' : 'scale-100 opacity-0'}`}
                  />
                  <div
                    className={`absolute inset-0 rounded-full border border-[#36c0c9]/15 transition-all duration-700 delay-200 ${pulseActive ? 'scale-[1.35] opacity-100' : 'scale-105 opacity-0'}`}
                  />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ddf7f9] to-[#b2eff4] border-2 border-[#36c0c9]/40 flex flex-col items-center justify-center gap-1.5 relative z-10 shadow-md">
                    <div className="flex items-end gap-[2.5px] h-5">
                      {waveBars.map((baseH, i) => (
                        <div
                          key={i}
                          className="w-[3px] rounded-full bg-[#36c0c9] transition-all duration-300"
                          style={{
                            height: `${(baseH + ((wavePhase + i) % 5) * 1.5) * (agentOnHold ? 0.6 : 1.5)}px`,
                            transitionDelay: `${i * 60}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[8px] font-bold text-[#0ea5e9] tracking-widest uppercase">
                      AI Assessor
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-bold text-[#0d212c]">Sam</span>
                  <span className="text-xs text-[#64748b]">
                    {agentOnHold
                      ? 'Sam is on hold'
                      : assessmentStarted
                        ? 'Sam is listening'
                        : 'Sam is here, waiting for M42 to start the assessment'}
                  </span>
                </div>
              </div>

              {/* START ASSESSMENT CTA — only before assessment starts */}
              {!assessmentStarted && (
                <button
                  id="callroom-start-assessment-btn"
                  onClick={handleStartAssessment}
                  className="bg-[#36c0c9] hover:bg-[#2badb6] text-white font-semibold text-sm px-8 py-3 rounded-xl transition cursor-pointer border-0 shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <PlayCircle className="w-4 h-4" />
                  Start Assessment
                </button>
              )}
            </div>
          )}

          {/* ── 2 PARTICIPANT TILES (LIGHT THEME) — at bottom right ────────────────────── */}
          <div className="absolute bottom-4 right-4 flex items-end gap-2.5 z-10 transition-all duration-300">
            {/* Facility tile */}
            <div className="w-32 h-22 rounded-2xl bg-white border border-[#e2e8f0] shadow-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden p-2">
              <div className="w-9 h-9 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] flex items-center justify-center text-[#0d212c] font-semibold text-sm shadow-2xs">
                {facilityShortName ? facilityShortName[0].toUpperCase() : 'F'}
              </div>
              <span className="text-[10px] font-semibold text-[#0d212c] truncate max-w-[110px] px-1 text-center">
                {facilityShortName}
              </span>
              <div className="absolute bottom-1 left-1.5 flex items-center gap-1 bg-[#f1f5f9] border border-[#e2e8f0] rounded-md px-1.5 py-0.5">
                <Mic className="w-2.5 h-2.5 text-[#64748b]" />
                <span className="text-[8px] font-semibold text-[#64748b]">Facility</span>
              </div>
            </div>

            {/* Admin (current user = M42) tile */}
            <div className="w-32 h-22 rounded-2xl bg-white border border-[#36c0c9]/40 shadow-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden p-2">
              <div className="w-9 h-9 rounded-full bg-[#36c0c9] text-white flex items-center justify-center font-semibold text-sm shadow-2xs">
                {adminInitial}
              </div>
              <span className="text-[10px] font-semibold text-[#0d212c] truncate max-w-[110px] px-1 text-center">
                {yourName.trim() || 'Admin'}{' '}
                <span className="text-[#36c0c9] font-bold">(you)</span>
              </span>
              <div
                className={`absolute bottom-1 left-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 border ${
                  isMuted
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b]'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-2.5 h-2.5 text-red-600" />
                ) : (
                  <Mic className="w-2.5 h-2.5 text-[#64748b]" />
                )}
                <span className="text-[8px] font-semibold">M42</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── LIVE TRANSCRIPT PANEL (DRAWER OVERLAYING PARTICIPANTS) ─────────── */}
        {assessmentStarted && showTranscript && (
          <div className="absolute right-0 top-0 bottom-0 z-30 w-[320px] border-l border-[#e2e8f0] bg-white flex flex-col shrink-0 min-h-0 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d212c]">
                Live Transcript
              </span>
              <div className="flex items-center gap-2">
                <button className="text-[10px] font-semibold text-[#64748b] hover:text-[#0d212c] transition cursor-pointer bg-transparent border-0">
                  Copy
                </button>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="text-[10px] font-semibold text-[#64748b] hover:text-[#0d212c] transition cursor-pointer bg-transparent border-0"
                >
                  Hide
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
              {sampleTranscript.map((entry, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold ${entry.speaker === 'Sam' ? 'text-[#36c0c9]' : 'text-[#0d212c]'}`}
                    >
                      {entry.speaker === 'Sam' ? 'Sam (AI)' : yourName.trim() || 'Facility'}
                    </span>
                    <span className="text-[9px] text-[#94a3b8]">{entry.time}</span>
                  </div>
                  <p className="text-[11px] text-[#475569] leading-relaxed">{entry.text}</p>
                </div>
              ))}

              {/* Uploaded Documents List in Chat Room */}
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-2xl bg-[#ddf7f9]/20 border border-[#36c0c9]/40 flex flex-col gap-2 shadow-2xs animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Attachment Card matching Dashboard Assessment Details */}
                  <div className="px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-[#cbd5e1] transition">
                    {/* Attached Screenshot Thumbnail Image */}
                    <div className="w-12 h-9 rounded-lg border border-[#cbd5e1] shrink-0 overflow-hidden relative shadow-2xs bg-white">
                      <img
                        src="/excel_snapshot.png"
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className="font-semibold text-xs text-[#0d212c] truncate max-w-[150px]"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      {file.tag && file.tag !== 'After' && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full w-fit mt-0.5 bg-slate-100 text-[#64748b]">
                          {file.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const element = document.createElement('a')
                          const fileBlob = new Blob([`Sample content for ${file.name}`], {
                            type: 'text/plain',
                          })
                          element.href = URL.createObjectURL(fileBlob)
                          element.download = file.name
                          document.body.appendChild(element)
                          element.click()
                          document.body.removeChild(element)
                        }}
                        title={`Download ${file.name}`}
                        className="p-1 rounded text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0 outline-none focus:outline-none"
                      >
                        <Download className="w-3.5 h-3.5 fill-none stroke-current" />
                      </button>
                    </div>
                  </div>

                  {/* Time written on bottom */}
                  <div className="flex justify-end items-center px-1">
                    <span className="text-[9px] text-[#94a3b8]">{file.time}</span>
                  </div>
                </div>
              ))}

              {/* Live typing dots */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#36c0c9]">Sam (AI)</span>
                  <span className="text-[9px] text-[#94a3b8]">now</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#36c0c9] animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM TOOLBAR ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-[#e2e8f0] flex items-center justify-center gap-3 shrink-0 shadow-sm px-6 py-3 relative">
        {/* Mute — always active */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            id="callroom-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border-0 shadow-sm ${isMuted ? 'bg-[#ddf7f9] text-[#36c0c9] hover:bg-[#b2eff4]' : 'bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0]'}`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <span className="text-[9px] text-[#94a3b8] font-normal">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </div>

        {/* Upload — disabled until assessment starts */}
        <div className="flex flex-col items-center gap-0.5 relative group">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          <button
            id="callroom-upload-btn"
            disabled={!assessmentStarted}
            onClick={() => {
              if (!assessmentStarted) return
              if (userRole === 'admin') {
                setShowUploadModal(true)
              } else {
                fileInputRef.current?.click()
              }
            }}
            title={assessmentStarted ? (userRole === 'admin' ? 'Upload image' : 'Upload document') : 'Available after assessment starts'}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-0 shadow-sm transition ${
              assessmentStarted
                ? 'bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0] cursor-pointer'
                : 'bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed opacity-50'
            }`}
          >
            <MonitorUp className="w-4 h-4" />
          </button>
          <span className="text-[9px] text-[#94a3b8] font-normal">Upload</span>
          {!assessmentStarted && (
            <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0d212c] text-white text-[10px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
              Start assessment to upload
            </div>
          )}
        </div>

        {/* Screen Share button */}
        <div className="flex flex-col items-center gap-0.5 relative group">
          <button
            id="callroom-screenshare-btn"
            onClick={handleToggleScreenShare}
            disabled={!assessmentStarted}
            title={
              !assessmentStarted
                ? 'Available after assessment starts'
                : isScreenSharing
                  ? 'Stop screen share'
                  : 'Start screen share'
            }
            className={`w-10 h-10 rounded-full flex items-center justify-center border-0 shadow-sm transition ${
              !assessmentStarted
                ? 'bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed opacity-50'
                : isScreenSharing
                  ? 'bg-[#36c0c9] text-white hover:bg-[#2badb6] cursor-pointer ring-2 ring-[#36c0c9]/30'
                  : 'bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0] cursor-pointer'
            }`}
          >
            <ScreenShare className="w-4 h-4" />
          </button>
          <span className="text-[9px] text-[#94a3b8] font-normal">
            {isScreenSharing ? 'Sharing' : 'Share Screen'}
          </span>
          {!assessmentStarted && (
            <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0d212c] text-white text-[10px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
              Start assessment first
            </div>
          )}
        </div>

        {/* Screen Capture button */}
        <div className="flex flex-col items-center gap-0.5 relative group">
          <button
            id="callroom-screencapture-btn"
            onClick={handleCaptureScreen}
            disabled={!assessmentStarted}
            title={assessmentStarted ? 'Capture screen snapshot' : 'Available after assessment starts'}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-0 shadow-sm transition ${!assessmentStarted ? 'bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed opacity-50' : 'bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0] cursor-pointer'}`}
          >
            <Camera className="w-4 h-4" />
          </button>
          <span className="text-[9px] text-[#94a3b8] font-normal">Capture</span>
          {!assessmentStarted && (
            <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0d212c] text-white text-[10px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
              Start assessment first
            </div>
          )}
        </div>

        {/* Transcript toggle — disabled until assessment starts */}
        <div className="flex flex-col items-center gap-0.5 relative group">
          <button
            id="callroom-transcript-btn"
            onClick={() => assessmentStarted && setShowTranscript(!showTranscript)}
            disabled={!assessmentStarted}
            title={assessmentStarted ? 'Toggle transcript' : 'Available after assessment starts'}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-0 shadow-sm transition ${!assessmentStarted ? 'bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed opacity-50' : showTranscript ? 'bg-[#36c0c9] text-white hover:bg-[#2badb6] cursor-pointer' : 'bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0] cursor-pointer'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <span className="text-[9px] text-[#94a3b8] font-normal">Transcript</span>
          {!assessmentStarted && (
            <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0d212c] text-white text-[10px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
              Start assessment first
            </div>
          )}
        </div>

        {/* Hold Agent — disabled until assessment starts */}
        <div className="flex flex-col items-center gap-0.5 relative group/hold">
          <div className="relative">
            <button
              id="callroom-hold-btn"
              onClick={handleHoldToggle}
              disabled={!assessmentStarted}
              title={agentOnHold ? 'Resume Agent' : 'Hold Agent'}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-0 shadow-sm transition ${!assessmentStarted ? 'bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed opacity-50' : agentOnHold ? 'bg-[#ddf7f9] text-[#36c0c9] hover:bg-[#b2eff4] cursor-pointer' : 'bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0] cursor-pointer'}`}
            >
              {agentOnHold ? (
                <PlayCircle className="w-4 h-4" />
              ) : (
                <PauseCircle className="w-4 h-4" />
              )}
            </button>

            {/* Hold active — persistent white tooltip above button */}
            {agentOnHold && (
              <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 bg-white border border-[#e2e8f0] shadow-xl rounded-xl px-3.5 py-2.5 w-56 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse inline-block" />
                  <p className="text-xs font-bold text-[#0d212c]">Resume Agent</p>
                </div>
                <p className="text-[10px] text-[#64748b] leading-relaxed">
                  Agent is paused and stopped from speaking. Press to resume.
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-[#e2e8f0] rotate-45" />
              </div>
            )}

            {!assessmentStarted && (
              <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0d212c] text-white text-[10px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/hold:opacity-100 transition-opacity duration-150 z-50">
                Start assessment first
              </div>
            )}
          </div>
          <span className="text-[9px] text-[#94a3b8] font-normal">
            {agentOnHold ? 'Resume Agent' : 'Hold Agent'}
          </span>
        </div>

        {/* End & Finalise — only visible for admin role */}
        {userRole === 'admin' && (
          <>
            <div className="w-px h-8 bg-[#e2e8f0] mx-1" />

            <div className="flex flex-col items-center gap-0.5 relative">
              <button
                id="callroom-finalise-btn"
                onClick={() => assessmentStarted && setShowFinaliseConfirm(true)}
                disabled={!assessmentStarted}
                title={
                  assessmentStarted
                    ? 'End and finalise assessment'
                    : 'Available after assessment starts'
                }
                className={`h-10 px-4 rounded-full flex items-center justify-center gap-1.5 transition border-0 font-semibold text-xs shadow-sm focus:outline-none outline-none ${
                  assessmentStarted
                    ? 'bg-[#ddf7f9] hover:bg-[#b2eff4] text-[#0d7280] border border-[#36c0c9]/30 cursor-pointer'
                    : 'bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed opacity-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>End &amp; Finalise</span>
              </button>
              <span className="text-[9px] text-[#94a3b8] font-normal">Finalise</span>
            </div>
          </>
        )}

        {/* Leave */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            id="callroom-leave-btn"
            onClick={() => setShowLeaveConfirm(true)}
            title="Leave call"
            className="h-10 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-1.5 transition cursor-pointer border-0 shadow-md font-semibold text-xs"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
          <span className="text-[9px] text-[#94a3b8] font-normal">Leave</span>
        </div>
      </div>

      {/* Recording notice */}
      {assessmentStarted && (
        <div className="bg-white border-t border-[#e2e8f0] flex items-center justify-center py-1 shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
            Recording and transcription in progress
          </span>
        </div>
      )}
    </div>
  )
}
