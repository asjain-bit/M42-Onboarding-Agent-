'use client'

import React, { useState } from 'react'
import { GripVertical, Trash2, ArrowLeft, Check, Pencil, Plus, X, AlertTriangle } from 'lucide-react'
import { Checkbox } from '@/components/atoms/Checkbox'

export interface QuestionItem {
  id: number
  question: string
  responseCue: string
  researchNeeded: boolean
  attachmentRequired: boolean
  includedInAssessment?: boolean
  messageType?: string
  categoryType?: string
}

export interface QuestionnaireDetailData {
  id: string
  title: string
  description?: string
  status: 'Ready' | 'Draft' | 'Processing'
  questionsCount: number
  initialEditMode?: boolean
}

interface QuestionnaireDetailScreenProps {
  questionnaire: QuestionnaireDetailData
  onBack: () => void
}

export const QuestionnaireDetailScreen: React.FC<QuestionnaireDetailScreenProps> = ({
  questionnaire,
  onBack,
}) => {
  const [status, setStatus] = useState<string>(questionnaire.status || 'Ready')
  const [isEditing, setIsEditing] = useState<boolean>(
    questionnaire.initialEditMode ?? questionnaire.status === 'Draft'
  )
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Drag and drop state for Google Forms style reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Requirement 4: State for Add New Question Modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newResponseCue, setNewResponseCue] = useState('')
  const [newMessageType, setNewMessageType] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('')
  const [newResearchNeeded, setNewResearchNeeded] = useState(false)
  const [newAttachmentRequired, setNewAttachmentRequired] = useState(false)

  // Questions list
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 1,
      question:
        'Describe the primary clinical or operational use cases supported by your solution.',
      responseCue:
        'Specify whether workflows are clinical, decision-support, operational, or administrative. State whether outputs influence patient care directly or indirectly.',
      researchNeeded: true,
      attachmentRequired: true,
      includedInAssessment: true,
    },
    {
      id: 2,
      question:
        'Has your organization performed a patient safety or clinical risk assessment for this product?',
      responseCue:
        'Provide documentation or summary of hazard analysis, risk register, or failure-mode analysis related to patient harm.',
      researchNeeded: false,
      attachmentRequired: true,
      includedInAssessment: true,
    },
    {
      id: 3,
      question:
        'Describe how customer data is encrypted in transit and at rest across cloud tenants.',
      responseCue:
        'Specify encryption algorithms (e.g. AES-256, TLS 1.3), key rotation policies, and HSM backing.',
      researchNeeded: true,
      attachmentRequired: true,
      includedInAssessment: true,
    },
    {
      id: 4,
      question: 'Provide proof of SOC 2 Type II or ISO/IEC 27001 certification compliance.',
      responseCue:
        'Attach executive summary or auditor attestation statement covering the last 12 months.',
      researchNeeded: false,
      attachmentRequired: true,
      includedInAssessment: true,
    },
    {
      id: 5,
      question: 'Can customer data be strictly isolated within United Arab Emirates cloud regions?',
      responseCue:
        'Detail tenant deployment architecture, backup locations, and compliance with UAE Health Data Law.',
      researchNeeded: true,
      attachmentRequired: false,
      includedInAssessment: true,
    },
    {
      id: 6,
      question:
        'Outline your incident response SLA for reporting data breaches to affected healthcare entities.',
      responseCue:
        'Provide notification timeline (e.g., within 24 hours), triage workflows, and root cause analysis format.',
      researchNeeded: true,
      attachmentRequired: true,
      includedInAssessment: true,
    },
  ])

  // Handle Question field edits
  const handleQuestionChange = (id: number, field: keyof QuestionItem, value: string | boolean) => {
    if (!isEditing) return
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  // Delete Question after confirmation popup
  const confirmDeleteQuestion = () => {
    if (deletingQuestionId !== null) {
      setQuestions(questions.filter((q) => q.id !== deletingQuestionId))
      setDeletingQuestionId(null)
      showToast('Testcase deleted successfully.')
    }
  }

  // Select All Testcases state & handler
  const allIncluded =
    questions.length > 0 && questions.every((q) => q.includedInAssessment !== false)

  const handleToggleSelectAll = () => {
    const nextVal = !allIncluded
    setQuestions(questions.map((q) => ({ ...q, includedInAssessment: nextVal })))
  }

  // Requirement 4: Add New Question Handler
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestionText.trim() || !newResponseCue.trim() || !newMessageType.trim() || !newCategoryType.trim()) return

    const maxId = questions.reduce(
      (max, q) => (typeof q.id === 'number' && q.id > max ? q.id : max),
      0
    )
    const newQuestionObj: QuestionItem = {
      id: maxId + 1,
      question: newQuestionText.trim(),
      responseCue:
        newResponseCue.trim() ||
        'Provide explicit operational proof and supporting compliance evidence.',
      researchNeeded: newResearchNeeded,
      attachmentRequired: newAttachmentRequired,
      includedInAssessment: true,
      messageType: newMessageType.trim(),
      categoryType: newCategoryType.trim(),
    }

    setQuestions([...questions, newQuestionObj])
    setNewQuestionText('')
    setNewResponseCue('')
    setNewMessageType('')
    setNewCategoryType('')
    setNewResearchNeeded(false)
    setNewAttachmentRequired(false)
    setShowAddQuestionModal(false)
    showToast('New testcase added successfully!')
  }

  // Google Forms style drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditing) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (!isEditing) return

    // Auto-scroll window when dragging near top or bottom edges of viewport
    const viewportHeight = window.innerHeight
    const edgeThreshold = 140
    if (e.clientY < edgeThreshold) {
      window.scrollBy({ top: -20, behavior: 'smooth' })
    } else if (e.clientY > viewportHeight - edgeThreshold) {
      window.scrollBy({ top: 20, behavior: 'smooth' })
    }

    if (draggedIndex === null || draggedIndex === index) return

    const updatedQuestions = [...questions]
    const itemToMove = updatedQuestions[draggedIndex]
    updatedQuestions.splice(draggedIndex, 1)
    updatedQuestions.splice(index, 0, itemToMove)

    setDraggedIndex(index)
    setQuestions(updatedQuestions)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSaveOrEdit = () => {
    if (isEditing) {
      setIsEditing(false)
      showToast('Dataset changes saved successfully.')
    } else {
      setIsEditing(true)
    }
  }

  const handlePublish = () => {
    setStatus('Ready')
    setIsEditing(false)
    showToast('Dataset published successfully!')
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d212c] pb-16 font-sans w-full">
      {/* Toast Notification — subtle light semantic styling */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#f0fdf4] text-[#15803d] px-4 py-3 rounded-xl shadow-md border border-[#bbf7d0] flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <Check className="w-4 h-4 text-[#16a34a]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="w-full px-6 lg:px-10 pt-4 pb-2 text-xs font-semibold flex items-center gap-1.5 text-[#64748b]">
        <button
          onClick={onBack}
          className="hover:text-[#36c0c9] cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Datasets</span>
        </button>
        <span>/</span>
        <span className="text-[#36c0c9] font-bold">{questionnaire.title}</span>
      </div>

      {/* Header Bar */}
      <div className="w-full px-6 lg:px-10 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-[#0d212c]">
              {questionnaire.title}
            </h1>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-[#e6f4ea] text-[#137333]'
              }`}
            >
              {status === 'Draft' ? 'Draft' : 'Ready'}
            </span>
          </div>
          {questionnaire.description && (
            <p className="text-xs text-[#64748b] font-medium mt-0.5 max-w-3xl">
              {questionnaire.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {status === 'Draft' ? (
            isEditing ? (
              <>
                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="px-4 py-2 rounded-xl border border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-slate-50 text-[#0d212c] bg-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                >
                  <Plus className="w-4 h-4 text-[#0d212c]" />
                  <span>Add testcase</span>
                </button>
                <button
                  onClick={handlePublish}
                  className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold px-6 py-2 rounded-xl text-xs shadow-xs cursor-pointer transition border-0"
                >
                  Publish dataset
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[#36c0c9] hover:text-[#2cb0b9] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer bg-transparent border-0 p-0"
                >
                  <Pencil className="w-4 h-4 text-[#36c0c9]" />
                  <span>Edit dataset</span>
                </button>
                <button
                  onClick={handlePublish}
                  className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold px-6 py-2 rounded-xl text-xs shadow-xs cursor-pointer transition border-0"
                >
                  Publish dataset
                </button>
              </>
            )
          ) : isEditing ? (
            <>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="px-4 py-2 rounded-xl border border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-slate-50 text-[#0d212c] bg-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
              >
                <Plus className="w-4 h-4 text-[#0d212c]" />
                <span>Add testcase</span>
              </button>
              <button
                onClick={handleSaveOrEdit}
                className="bg-[#36c0c9] hover:bg-[#2eb0b9] text-white font-bold px-6 py-2 rounded-xl text-xs cursor-pointer shadow-xs border-0 transition"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={handleSaveOrEdit}
              className="text-[#36c0c9] hover:text-[#2cb0b9] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer bg-transparent border-0 p-0"
            >
              <Pencil className="w-4 h-4 text-[#36c0c9]" />
              <span>Edit dataset</span>
            </button>
          )}
        </div>
      </div>

      {/* Testcases List */}
      <div className="w-full px-6 lg:px-10 mt-6 flex flex-col gap-5">
        {/* Top Controls: Select All Action & Chips Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            disabled={!isEditing}
            className="bg-transparent border-0 p-0 shadow-none outline-none flex items-center gap-2.5 text-xs font-bold text-[#0d212c] hover:text-[#0d7280] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 select-none"
          >
            <div
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                allIncluded
                  ? 'border-[#36c0c9] bg-[#36c0c9] text-white'
                  : 'border-[#cbd5e1] bg-white'
              }`}
            >
              {allIncluded && <Check className="w-3 h-3 text-white stroke-[3]" />}
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
              <span>Type</span>
            </div>
          </div>
        </div>

        {questions.map((q, idx) => (
          <div
            key={q.id}
            draggable={isEditing}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`bg-white p-6 rounded-2xl border transition flex flex-col gap-4 ${
              draggedIndex === idx
                ? 'border-[#cbd5e1] shadow-md opacity-70 bg-slate-50'
                : isEditing
                  ? 'border-[#e2e8f0] hover:border-[#cbd5e1] shadow-xs'
                  : 'border-[#e2e8f0]'
            }`}
          >
            {/* Testcase Card Top Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-[#e2e8f0]/80 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                {isEditing && (
                  <div className="relative group/drag shrink-0">
                    <div
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0d212c] hover:bg-slate-100 cursor-grab active:cursor-grabbing transition"
                      title="Drag and drop to change testcase position"
                    >
                      <GripVertical className="w-4 h-4 text-[#64748b]" />
                    </div>
                  </div>
                )}

                {/* Checkbox on LEFT side of Testcase #1 text */}
                <div
                  className="flex items-center shrink-0"
                  title="Include testcase during assessment"
                >
                  <Checkbox
                    checked={q.includedInAssessment ?? true}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleQuestionChange(q.id, 'includedInAssessment', e.target.checked)
                    }
                  />
                </div>

                {(() => {
                  const prefix = questionnaire.title.includes('Family History')
                    ? 'TC-FH'
                    : questionnaire.title.includes('Laboratory')
                      ? 'TC-LAB'
                      : questionnaire.title.includes('Radiology')
                        ? 'TC-RAD'
                        : questionnaire.title.includes('Clinical')
                          ? 'TC-DOC'
                          : questionnaire.title.includes('Vitals')
                            ? 'TC-VIT'
                            : 'TC'
                  const codeStr = q.messageType
                    ? `${q.messageType}-${String(idx + 1).padStart(2, '0')}`
                    : `${prefix}-${String(idx + 1).padStart(2, '0')}`
                  const typeStr = q.categoryType || (idx % 3 === 0 ? 'Problems' : idx % 3 === 1 ? 'Sensitive Info' : 'Meds Dispensing')

                  return (
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-extrabold text-[#0d212c] tracking-tight">
                        Testcase #{idx + 1}
                      </span>
                      <span className="text-xs font-extrabold text-[#0d212c] bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {codeStr}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          typeStr === 'Problems'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : typeStr === 'Sensitive Info'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {typeStr}
                      </span>
                    </div>
                  )
                })()}
              </div>

              {/* Right action: Delete button when editing */}
              {isEditing && (
                <button
                  onClick={() => setDeletingQuestionId(q.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer shrink-0"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Testcase Title/Prompt */}
            {isEditing ? (
              <div>
                <label className="block text-xs font-bold text-[#0d212c] mb-1.5">
                  Testcase name
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                  className="w-full text-xs font-medium text-[#0d212c] bg-white border border-[#cbd5e1] rounded-xl px-4 py-2.5 outline-none focus:border-[#36c0c9] transition"
                  placeholder="Enter testcase description..."
                />
              </div>
            ) : (
              <p className="text-xs font-medium text-[#0d212c] leading-relaxed">
                {q.question}
              </p>
            )}

            {/* Evaluation Criteria / Cues Block */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748b]">
                Evaluation Criteria / Required Evidence
              </span>
              {isEditing ? (
                <textarea
                  value={q.responseCue}
                  onChange={(e) => handleQuestionChange(q.id, 'responseCue', e.target.value)}
                  rows={2}
                  className="w-full text-xs text-[#0d212c] bg-white border border-[#cbd5e1] rounded-lg p-2.5 outline-none focus:border-[#36c0c9] transition resize-y font-normal"
                  placeholder="Describe the expected criteria or proof points..."
                />
              ) : (
                <p className="text-xs text-[#64748b] leading-relaxed">
                  {q.responseCue}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Testcase Modal Popup */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0d212c]">Add new testcase</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#0d212c] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0d212c] mb-1.5">
                  Message type <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ADT, ORU, SIU..."
                  value={newMessageType}
                  onChange={(e) => setNewMessageType(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-medium text-[#0d212c] outline-none bg-white focus:border-[#36c0c9] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d212c] mb-1.5">
                  Category type <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Problems, Sensitive Info..."
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-medium text-[#0d212c] outline-none bg-white focus:border-[#36c0c9] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d212c] mb-1.5">
                  Testcase name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Describe your identity & access management policies..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-medium text-[#0d212c] outline-none bg-white focus:border-[#36c0c9] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d212c] mb-1.5">
                  Evaluation criteria <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  placeholder="Instructions or cues for the facility to answer effectively..."
                  value={newResponseCue}
                  onChange={(e) => setNewResponseCue(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-medium text-[#0d212c] outline-none bg-white resize-y focus:border-[#36c0c9] transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newQuestionText.trim() || !newResponseCue.trim() || !newMessageType.trim() || !newCategoryType.trim()}
                  className="bg-[#0d212c] hover:bg-[#122e3d] text-white font-bold py-2 px-6 rounded-xl text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition border-0"
                >
                  Add Testcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Testcase Confirmation Modal Popup (Center Aligned matching Delete Dataset) */}
      {deletingQuestionId !== null && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 sm:p-10 shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-150 text-center flex flex-col items-center gap-4 min-h-[240px] justify-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#0d212c] mb-1.5">Delete Testcase</h3>
              <p className="text-xs text-[#64748b] leading-relaxed max-w-md">
                Are you sure you want to remove this testcase from the dataset?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 w-full mt-2">
              <button
                onClick={() => setDeletingQuestionId(null)}
                className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] hover:bg-slate-50 cursor-pointer flex-1 bg-transparent transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuestion}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer flex-1 border-0 transition shadow-2xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
