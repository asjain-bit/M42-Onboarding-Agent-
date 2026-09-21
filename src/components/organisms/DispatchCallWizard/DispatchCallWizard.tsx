/**
 * DispatchCallWizard — Organism
 * Multi-step wizard to configure vendor assessment call, select questionnaire, configure Sam AI voice, and launch.
 * Implements Snapshots 2, 3, 4, and 5 specifications.
 */

'use client'

import React, { useState } from 'react'
import {
  Check,
  ChevronDown,
  Clock,
  ShieldCheck,
  ArrowRight,
  Volume2,
  ExternalLink,
  X,
  Search,
  Eye,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Checkbox } from '@/components/atoms/Checkbox'
import { CountryFlag } from '@/components/atoms/CountryFlag'

export interface VendorDispatchData {
  id: string
  name: string
  sublabel: string
  domain: string
  country: string
  flag: string
  email?: string
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

interface DispatchCallWizardProps {
  vendor: VendorDispatchData
  onClose: () => void
  onComplete: () => void
}

export const DispatchCallWizard: React.FC<DispatchCallWizardProps> = ({
  vendor,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // Step 1 states
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState('Technical Questionnaire')
  const [roundLabel, setRoundLabel] = useState('Round 1')
  const [isDatasetDropdownOpen, setIsDatasetDropdownOpen] = useState(false)
  const [showDatasetPreviewModal, setShowDatasetPreviewModal] = useState(false)
  const [datasetSearchQuery, setDatasetSearchQuery] = useState('')

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

  const toggleTestcaseInclusion = (id: number) => {
    setTestcaseInclusions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const includedCount = Object.values(testcaseInclusions).filter(Boolean).length

  // Step 2 states (Configure Agent)
  const [selectedVoice, setSelectedVoice] = useState('Marin')
  const [showAllVoices, setShowAllVoices] = useState(false)
  const [timing, setTiming] = useState<'now' | 'later'>('now')
  const [timezone, setTimezone] = useState('Asia/Calcutta - GMT+5:30')

  const questionnaireOptions = [
    { title: 'Technical Questionnaire', testcases: 62, duration: '135–205 min' },
    { title: 'Data Protection & Privacy', testcases: 48, duration: '100–160 min' },
    { title: 'Presight Technical & Compliance', testcases: 74, duration: '150–220 min' },
    { title: 'Information Security & Compliance', testcases: 55, duration: '120–180 min' },
  ]

  const voiceOptions = [
    {
      id: 'Marin',
      label: 'Marin',
      recommended: true,
      desc: 'Warm and steady. Keeps vendor teams at ease through long sessions.',
    },
    {
      id: 'Ash',
      label: 'Ash',
      recommended: false,
      desc: 'Crisp and direct. Suits fast-moving technical walkthroughs.',
    },
    {
      id: 'Coral',
      label: 'Coral',
      recommended: false,
      desc: 'Bright and encouraging. A good fit for first onboarding sessions.',
    },
  ]

  const extraVoices = ['Alloy', 'Ballad', 'Cedar', 'Echo', 'Sage', 'Shimmer', 'Verse']

  return (
    <div className="fixed inset-0 z-50 bg-[#0d212c]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] w-full max-w-5xl rounded-3xl border border-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header Bar */}
        <div className="bg-white px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#64748b]">
              Facilities / {vendor.name} / New call
            </span>
            <h1 className="text-xl font-extrabold text-[#0d212c]">Configure Assessment Call</h1>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Wizard Main Container */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: CALL SETUP STEPS (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
              <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                CALL SETUP
              </span>

              <div className="flex flex-col gap-4">
                {/* Step 1 Indicator */}
                <div
                  className={`flex items-start gap-3 cursor-pointer ${
                    currentStep === 1 ? 'opacity-100' : 'opacity-70'
                  }`}
                  onClick={() => setCurrentStep(1)}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      currentStep === 1
                        ? 'bg-[#36c0c9] text-[#0d212c]'
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
                <div
                  className={`flex items-start gap-3 cursor-pointer ${
                    currentStep === 2 ? 'opacity-100' : 'opacity-70'
                  }`}
                  onClick={() => setCurrentStep(2)}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      currentStep === 2
                        ? 'bg-[#36c0c9] text-[#0d212c]'
                        : currentStep > 2
                          ? 'bg-[#137333] text-white'
                          : 'bg-[#e2e8f0] text-[#64748b]'
                    }`}
                  >
                    {currentStep > 2 ? <Check className="w-4 h-4" /> : '02'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0d212c]">02 Configure Sam</span>
                    <span className="text-[11px] text-[#64748b]">Sam&apos;s voice & timing</span>
                  </div>
                </div>

                {/* Step 3 Indicator */}
                <div
                  className={`flex items-start gap-3 cursor-pointer ${
                    currentStep === 3 ? 'opacity-100' : 'opacity-70'
                  }`}
                  onClick={() => setCurrentStep(3)}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      currentStep === 3
                        ? 'bg-[#36c0c9] text-[#0d212c]'
                        : 'bg-[#e2e8f0] text-[#64748b]'
                    }`}
                  >
                    03
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0d212c]">03 Review & launch</span>
                    <span className="text-[11px] text-[#64748b]">Confirm and start</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] text-xs text-[#64748b]">
              <span className="font-bold text-[#0d212c] block mb-1">Need help?</span>
              <a href="#" className="text-[#36c0c9] hover:underline font-semibold">
                View scheduling guide →
              </a>
            </div>
          </div>

          {/* Middle Column: STEP CONTENT (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d212c]">Session setup</h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Choose the session type and source material.
                  </p>
                </div>

                {/* CALL TYPE: Assessment Round Only (Onboarding removed per user instructions) */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                    CALL TYPE
                  </span>
                  <div className="p-4 rounded-2xl border-2 border-[#36c0c9] bg-[#ddf7f9]/20 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#36c0c9] shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#0d212c]">Assessment round</span>
                        <span className="text-[11px] text-[#64748b] mt-0.5">
                          Structured assessment evaluation using an approved dataset.
                        </span>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border-4 border-[#36c0c9] bg-white shrink-0 mt-0.5" />
                  </div>
                </div>

                {/* DATASET SELECT CUSTOM LIGHT DROPDOWN WITH OPEN PREVIEW */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                      DATASET
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDatasetPreviewModal(true)}
                      className="text-xs font-bold text-[#36c0c9] hover:text-[#0d7280] flex items-center gap-1 cursor-pointer bg-transparent border-0 transition"
                    >
                      <span>Open preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDatasetDropdownOpen(!isDatasetDropdownOpen)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white text-xs font-semibold text-[#0d212c] flex items-center justify-between transition cursor-pointer outline-none ${
                        isDatasetDropdownOpen
                          ? 'border-[#cbd5e1] bg-slate-50/50 shadow-xs'
                          : 'border-[#e2e8f0] hover:border-[#cbd5e1] focus:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#64748b] shrink-0" />
                        <span className="truncate">{selectedQuestionnaire}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#64748b] shrink-0 transition-transform duration-200 ${
                          isDatasetDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Custom Dropdown Menu Options Popup in Light Mode */}
                    {isDatasetDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e2e8f0] shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1">
                        {questionnaireOptions.map((opt) => (
                          <div
                            key={opt.title}
                            onClick={() => {
                              setSelectedQuestionnaire(opt.title)
                              setIsDatasetDropdownOpen(false)
                            }}
                            className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${
                              selectedQuestionnaire === opt.title
                                ? 'bg-[#ddf7f9]/40 border border-[#36c0c9]/40 text-[#0d212c]'
                                : 'hover:bg-slate-50 text-[#0d212c]'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{opt.title}</span>
                              <span className="text-[10px] text-[#64748b]">{opt.duration}</span>
                            </div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-[#64748b]">
                              {opt.testcases} testcases
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748b] pl-1">
                    <span>62 testcases in selected dataset</span>
                    <span className="text-[#36c0c9] font-bold">{includedCount} included for assessment</span>
                  </div>
                </div>

                {/* Estimated duration box */}
                <div className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <Clock className="w-4 h-4 text-[#36c0c9]" />
                    <span>Estimated duration</span>
                  </div>
                  <span className="font-extrabold text-[#0d212c]">135–205 min</span>
                </div>

                {/* ROUND LABEL */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                    ROUND LABEL
                  </span>
                  <input
                    type="text"
                    value={roundLabel}
                    onChange={(e) => setRoundLabel(e.target.value)}
                    placeholder="e.g. Round 1"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] outline-none focus:border-[#36c0c9]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
                  <button
                    onClick={onClose}
                    className="text-xs font-semibold text-[#64748b] hover:text-[#0d212c]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#0d212c] font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to configure Sam</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d212c]">Configure Sam</h2>
                </div>

                {/* SAM'S VOICE */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
                    SAM&apos;S VOICE
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {voiceOptions.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVoice(v.id)}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                          selectedVoice === v.id
                            ? 'border-[#36c0c9] bg-[#ddf7f9]/20'
                            : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-full bg-[#ddf7f9] text-[#36c0c9] flex items-center justify-center">
                            <Volume2 className="w-4 h-4" />
                          </div>
                          {v.recommended && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#ddf7f9] text-[#0f766e]">
                              RECOMMENDED
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-[#0d212c]">{v.label}</h4>
                          <p className="text-[10px] text-[#64748b] mt-1 line-clamp-2">{v.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View all 10 voices button (Snapshot 5 feature) */}
                  <button
                    type="button"
                    onClick={() => setShowAllVoices(!showAllVoices)}
                    className="text-xs font-bold text-[#36c0c9] hover:underline text-left cursor-pointer"
                  >
                    {showAllVoices ? 'Hide extra voices' : 'View all 10 voices'}
                  </button>

                  {showAllVoices && (
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                      {extraVoices.map((ev) => (
                        <button
                          key={ev}
                          type="button"
                          onClick={() => setSelectedVoice(ev)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                            selectedVoice === ev
                              ? 'bg-[#e2e8f0] border-[#0d212c] text-[#0d212c]'
                              : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]'
                          }`}
                        >
                          {ev}
                        </button>
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
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col gap-1 ${
                        timing === 'now'
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
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col gap-1 ${
                        timing === 'later'
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
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0d212c] appearance-none outline-none focus:border-[#36c0c9]"
                    >
                      <option value="Asia/Calcutta - GMT+5:30">Asia/Calcutta - GMT+5:30</option>
                      <option value="Asia/Dubai - GMT+4:00">Asia/Dubai - GMT+4:00</option>
                      <option value="UTC - GMT+0:00">UTC - GMT+0:00</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#64748b] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-[#64748b] hover:text-[#0d212c]"
                  >
                    Back to setup
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#0d212c] font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d212c]">Review & launch</h2>
                </div>

                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Target facility:</span>
                    <span className="font-bold text-[#0d212c]">{vendor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Selected dataset:</span>
                    <span className="font-bold text-[#0d212c]">{selectedQuestionnaire}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">AI Voice:</span>
                    <span className="font-bold text-[#0d212c]">{selectedVoice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Round:</span>
                    <span className="font-bold text-[#0d212c]">{roundLabel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-[#64748b] hover:text-[#0d212c]"
                  >
                    Back to voice config
                  </button>
                  <Button
                    onClick={onComplete}
                    className="bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#0d212c] font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Launch assessment call
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: CALL SUMMARY BOX (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 text-xs">
              <span className="font-bold text-[#0d212c]">Call summary</span>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-9 h-9 rounded-xl bg-[#ddf7f9] text-[#36c0c9] font-bold flex items-center justify-center shrink-0">
                  {vendor.name.slice(0, 2).toUpperCase()}
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
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748b]">CALL TYPE</span>
                  <span className="font-bold text-[#0d212c]">Assessment round</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748b]">SOURCE</span>
                  <span className="font-bold text-[#0d212c] truncate max-w-[140px]">
                    {selectedQuestionnaire}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748b]">QUESTIONS</span>
                  <span className="font-bold text-[#0d212c]">62</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748b]">VOICE</span>
                  <span className="font-bold text-[#0d212c]">{selectedVoice}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748b]">TIMING</span>
                  <span className="font-bold text-[#0d212c]">
                    {timing === 'now' ? 'Start now' : 'Scheduled'}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748b]">TIMEZONE</span>
                  <span className="font-bold text-[#0d212c] truncate max-w-[140px]">
                    {timezone}
                  </span>
                </div>
              </div>

              {/* READINESS PROGRESS */}
              <div className="border-t border-[#e2e8f0] pt-3 flex flex-col gap-2">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-[#64748b]">READINESS</span>
                  <span className="font-bold text-[#0d212c]">{currentStep - 1} of 3 complete</span>
                </div>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Setup</span>
                    <span
                      className={currentStep > 1 ? 'text-[#137333] font-bold' : 'text-[#64748b]'}
                    >
                      {currentStep > 1 ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Configure Sam</span>
                    <span
                      className={currentStep > 2 ? 'text-[#137333] font-bold' : 'text-[#64748b]'}
                    >
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
      </div>

      {/* DATASET DETAILS PREVIEW LARGE MODAL OVERLAY */}
      {showDatasetPreviewModal && (
        <div className="fixed inset-0 z-[100] bg-[#0d212c]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#e2e8f0] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="bg-white px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between shrink-0">
              <h2 className="text-xl font-extrabold text-[#0d212c]">
                {selectedQuestionnaire}
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
            <div className="bg-white px-6 py-3.5 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shrink-0">
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

            {/* Testcases List Table with Horizontal Line Separators */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e2e8f0]">
              {sampleDatasetTestcases
                .filter(
                  (tc) =>
                    tc.title.toLowerCase().includes(datasetSearchQuery.toLowerCase()) ||
                    tc.code.toLowerCase().includes(datasetSearchQuery.toLowerCase())
                )
                .map((tc) => {
                  const isIncluded = !!testcaseInclusions[tc.id]

                  return (
                    <div
                      key={tc.id}
                      className={`py-5 px-6 transition flex items-start justify-between gap-6 ${
                        isIncluded ? 'bg-white' : 'bg-slate-50/50 opacity-75'
                      }`}
                    >
                      {/* Left side: Testcase metadata (Read-only / Non-editable) */}
                      <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-extrabold text-[#0d212c] bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {tc.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              tc.type === 'Problems'
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

                      {/* Right side: Inclusion Checkbox (Editable toggle) */}
                      <div className="flex items-center justify-end shrink-0 pl-4 pt-1">
                        <Checkbox
                          label="Include during assessment"
                          checked={isIncluded}
                          onChange={() => toggleTestcaseInclusion(tc.id)}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2.5 text-xs text-[#64748b] flex-wrap">
                <span>
                  Included in Assessment: <strong className="text-[#0d212c] font-bold">{includedCount} / 7 testcases</strong>
                </span>
                <span>|</span>
                <span>
                  Estimated Duration: <strong className="text-[#0d212c] font-bold">135–205 min</strong>
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
                  onClick={() => setShowDatasetPreviewModal(false)}
                  disabled={includedCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#36c0c9] text-white font-bold text-xs hover:bg-[#0d7280] transition cursor-pointer shadow-2xs border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save &amp; Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
