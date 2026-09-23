'use client'

import React, { useEffect, useState, useRef } from 'react'

interface TooltipState {
  visible: boolean
  text: string
  x: number
  y: number
  position: 'top' | 'bottom'
}

export const GlobalTooltip: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    position: 'top',
  })

  const currentTargetRef = useRef<HTMLElement | null>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // Find nearest element with tooltip info or truncation
      const tooltipEl = target.closest<HTMLElement>(
        '[data-tooltip], [title], [data-title], .truncate, .overflow-hidden'
      )

      if (!tooltipEl) {
        if (tooltip.visible) {
          setTooltip((prev) => ({ ...prev, visible: false }))
        }
        currentTargetRef.current = null
        return
      }

      currentTargetRef.current = tooltipEl

      // Check if text is specified directly or if it's a truncated element
      let tooltipText =
        tooltipEl.getAttribute('data-tooltip') ||
        tooltipEl.getAttribute('data-title') ||
        ''

      if (!tooltipText && tooltipEl.hasAttribute('title')) {
        const titleVal = tooltipEl.getAttribute('title') || ''
        if (titleVal.trim()) {
          tooltipText = titleVal
          // Cache and remove native title to prevent slow OS tooltip collision
          tooltipEl.setAttribute('data-cached-title', titleVal)
          tooltipEl.removeAttribute('title')
        }
      } else if (!tooltipText && tooltipEl.hasAttribute('data-cached-title')) {
        tooltipText = tooltipEl.getAttribute('data-cached-title') || ''
      }

      // If no explicit tooltip text, check if element is visually truncated
      if (!tooltipText) {
        const isTruncated =
          tooltipEl.classList.contains('truncate') ||
          getComputedStyle(tooltipEl).textOverflow === 'ellipsis'
        if (isTruncated && tooltipEl.scrollWidth > tooltipEl.clientWidth + 2) {
          tooltipText = tooltipEl.textContent?.trim() || ''
        }
      }

      if (!tooltipText) {
        setTooltip((prev) => ({ ...prev, visible: false }))
        return
      }

      const rect = tooltipEl.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const isNearTop = rect.top < 45

      const targetX = Math.max(16, Math.min(window.innerWidth - 16, centerX))
      const targetY = isNearTop ? rect.bottom + 8 : rect.top - 8
      const pos = isNearTop ? 'bottom' : 'top'

      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)

      // Instant / Ultra-fast appearance (0ms delay)
      setTooltip({
        visible: true,
        text: tooltipText,
        x: targetX,
        y: targetY,
        position: pos,
      })
    }

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (currentTargetRef.current && (!related || !currentTargetRef.current.contains(related))) {
        // Restore title if cached
        if (currentTargetRef.current.hasAttribute('data-cached-title')) {
          const cached = currentTargetRef.current.getAttribute('data-cached-title')
          if (cached) currentTargetRef.current.setAttribute('title', cached)
        }
        currentTargetRef.current = null
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        setTooltip((prev) => ({ ...prev, visible: false }))
      }
    }

    const handleScroll = () => {
      if (tooltip.visible) {
        setTooltip((prev) => ({ ...prev, visible: false }))
      }
    }

    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    window.addEventListener('mouseout', handleMouseOut, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mouseout', handleMouseOut)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [tooltip.visible])

  if (!tooltip.visible || !tooltip.text) return null

  return (
    <div
      className="fixed z-[99999] pointer-events-none transition-opacity duration-100 ease-out"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform:
          tooltip.position === 'top'
            ? 'translate(-50%, -100%)'
            : 'translate(-50%, 0%)',
      }}
    >
      <div className="bg-[#0d212c] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 max-w-xs sm:max-w-sm text-center leading-snug whitespace-normal break-words animate-in fade-in zoom-in-95 duration-100">
        {tooltip.text}
      </div>
    </div>
  )
}
