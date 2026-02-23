'use client'

import React, { useEffect, useRef, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ModalPosition = 'center' | 'bottom'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  /** Dialog title – rendered in the header and used as aria-label */
  title?: string
  /** Optional subtitle shown below the title */
  description?: string
  /** Max-width preset. On mobile, `bottom` position always uses full-width. */
  size?: ModalSize
  /**
   * `center`  – classic centred dialog (desktop), full-screen overlay (mobile).
   * `bottom`  – bottom sheet on all screen sizes.
   */
  position?: ModalPosition
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  /** Footer slot – typically action buttons */
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

// ── Style maps ─────────────────────────────────────────────────────────────────

const sizeClasses: Record<ModalSize, string> = {
  xs:   'max-w-xs',
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  full: 'max-w-full',
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * `ResponsiveModal` – a dialog / bottom-sheet that adapts to the viewport.
 *
 * - **Mobile (`< sm`):** renders as a centred overlay or a bottom sheet depending
 *   on the `position` prop.
 * - **Desktop (`≥ sm`):** always renders as a centred dialog with a backdrop.
 *
 * Accessibility: traps focus, responds to `Escape`, sets `aria-modal` and
 * `aria-labelledby` / `aria-describedby` automatically.
 *
 * @example
 * ```tsx
 * <ResponsiveModal isOpen={open} onClose={() => setOpen(false)}
 *   title="Confirm payment" position="bottom" footer={<ButtonGroup>…</ButtonGroup>}>
 *   <p>Are you sure?</p>
 * </ResponsiveModal>
 * ```
 */
export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  closeOnBackdropClick = true,
  footer,
  className,
  children,
}: ModalProps) {
  const modalRef  = useRef<HTMLDivElement>(null)
  const titleId   = useId()
  const descId    = useId()
  const isBottom  = position === 'bottom'

  // ── ESC key ──────────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // ── Focus trap ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !modalRef.current) return
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }

    // Auto-focus first focusable element
    first?.focus()
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex overflow-hidden',
        isBottom ? 'items-end justify-center' : 'items-center justify-center sm:p-4'
      )}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title  ? titleId : undefined}
        aria-describedby={description ? descId  : undefined}
        className={cn(
          'relative z-10 flex flex-col w-full bg-white dark:bg-neutral-900',
          'shadow-2xl focus:outline-none',
          // Bottom sheet
          isBottom && [
            'rounded-t-2xl sm:rounded-2xl',
            'max-h-[90dvh]',
            'animate-in slide-in-from-bottom duration-300',
            sizeClasses[size],
          ],
          // Centred dialog
          !isBottom && [
            // Full screen on xs; constrained on sm+
            'rounded-none sm:rounded-2xl',
            'h-full sm:h-auto max-h-full sm:max-h-[90dvh]',
            'animate-in fade-in zoom-in-95 duration-200',
            sizeClasses[size],
          ],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-3">
              {title && (
                <h2
                  id={titleId}
                  className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descId}
                  className="mt-1 text-sm text-gray-500 dark:text-neutral-400"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'flex-shrink-0 rounded-lg p-1.5',
                  'text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200',
                  'hover:bg-gray-100 dark:hover:bg-neutral-800',
                  'focus:outline-none focus:ring-2 focus:ring-primary/60',
                  'transition-colors'
                )}
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-100 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// ── ConfirmModal ───────────────────────────────────────────────────────────────

export interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Use the danger (red) variant for destructive actions */
  destructive?: boolean
  isLoading?: boolean
}

/**
 * `ConfirmModal` – a pre-wired confirmation dialog with confirm / cancel
 * buttons; uses `position="bottom"` on mobile for thumb-friendliness.
 */
export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  destructive  = false,
  isLoading    = false,
}: ConfirmModalProps) {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      position="bottom"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center',
              'px-4 py-2 rounded-lg text-sm font-medium',
              'border border-gray-300 dark:border-neutral-600',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-neutral-800',
              'focus:outline-none focus:ring-2 focus:ring-gray-500',
              'transition-colors disabled:opacity-50'
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center',
              'px-4 py-2 rounded-lg text-sm font-medium',
              'focus:outline-none focus:ring-2',
              'transition-colors disabled:opacity-50',
              destructive
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                : 'bg-primary text-white hover:bg-primary/90 focus:ring-primary'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      {/* Children intentionally empty – description handles the body copy */}
      <span />
    </ResponsiveModal>
  )
}
