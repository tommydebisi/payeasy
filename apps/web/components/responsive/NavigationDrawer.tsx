'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronRight, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface NavItem {
  /** Unique key for this item */
  id: string
  label: string
  href?: string
  icon?: LucideIcon
  badge?: string | number
  /** Marks the item as currently active */
  active?: boolean
  disabled?: boolean
  /** Nested children (one level deep) */
  children?: Omit<NavItem, 'children'>[]
  onClick?: () => void
}

export interface NavSection {
  id: string
  title?: string
  items: NavItem[]
}

export type DrawerSide = 'left' | 'right'

export interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
  sections: NavSection[]
  /** Side the drawer slides in from */
  side?: DrawerSide
  /** Header content (logo, user avatar, etc.) */
  header?: React.ReactNode
  /** Footer content (sign-out, settings link, etc.) */
  footer?: React.ReactNode
  /** Width Tailwind class, defaults to `w-72` */
  widthClass?: string
  closeOnNavigation?: boolean
  className?: string
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function NavLink({
  item,
  onClose,
  closeOnNavigation,
}: {
  item: NavItem
  onClose: () => void
  closeOnNavigation: boolean
}) {
  const [expanded, setExpanded] = React.useState(false)
  const hasChildren = (item.children ?? []).length > 0

  const handleClick = () => {
    if (hasChildren) { setExpanded((v) => !v); return }
    item.onClick?.()
    if (closeOnNavigation && item.href) onClose()
  }

  const baseClass = cn(
    'group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-primary/60',
    item.active
      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800',
    item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
  )

  const inner = (
    <>
      {item.icon && (
        <item.icon
          className={cn(
            'h-5 w-5 flex-shrink-0',
            item.active ? 'text-primary' : 'text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:group-hover:text-neutral-300'
          )}
          aria-hidden="true"
        />
      )}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span
          className={cn(
            'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold',
            item.active
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
          )}
        >
          {item.badge}
        </span>
      )}
      {hasChildren && (
        <ChevronRight
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            expanded && 'rotate-90'
          )}
          aria-hidden="true"
        />
      )}
    </>
  )

  return (
    <li>
      {item.href && !hasChildren ? (
        <a
          href={item.disabled ? undefined : item.href}
          className={baseClass}
          aria-current={item.active ? 'page' : undefined}
          tabIndex={item.disabled ? -1 : 0}
          onClick={() => {
            item.onClick?.()
            if (closeOnNavigation) onClose()
          }}
        >
          {inner}
        </a>
      ) : (
        <button type="button" className={baseClass} onClick={handleClick} aria-expanded={hasChildren ? expanded : undefined}>
          {inner}
        </button>
      )}

      {/* Nested children */}
      {hasChildren && expanded && (
        <ul className="mt-1 ml-8 space-y-1">
          {item.children!.map((child) => (
            <NavLink
              key={child.id}
              item={child}
              onClose={onClose}
              closeOnNavigation={closeOnNavigation}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * `NavigationDrawer` – a slide-in side drawer for primary navigation.
 *
 * - Slides from `left` or `right`.
 * - On mobile it covers the full viewport height with a backdrop.
 * - On desktop (≥ lg) you can pair it with a persistent sidebar layout by
 *   keeping `isOpen` always true and omitting the backdrop.
 * - Supports multi-level nav items (one nesting level), badges, and icons.
 * - Fully keyboard navigable; traps focus while open; closes on Escape.
 *
 * @example
 * ```tsx
 * <NavigationDrawer
 *   isOpen={drawerOpen}
 *   onClose={() => setDrawerOpen(false)}
 *   sections={[{ id: 'main', items: navItems }]}
 *   header={<Logo />}
 * />
 * ```
 */
export function NavigationDrawer({
  isOpen,
  onClose,
  sections,
  side = 'left',
  header,
  footer,
  widthClass = 'w-72',
  closeOnNavigation = true,
  className,
}: NavigationDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null)

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

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a,[href],button,[tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    first?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex" role="presentation">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm',
          'animate-in fade-in duration-200'
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <nav
        ref={drawerRef}
        role="navigation"
        aria-label="Primary navigation"
        className={cn(
          'relative z-10 flex flex-col h-full',
          'bg-white dark:bg-neutral-900',
          'shadow-2xl',
          widthClass,
          side === 'left'
            ? 'left-0 animate-in slide-in-from-left duration-300'
            : 'ml-auto right-0 animate-in slide-in-from-right duration-300',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0">
          <div className="flex-1 min-w-0">{header}</div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'ml-2 flex-shrink-0 p-2 rounded-lg',
              'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-white',
              'hover:bg-gray-100 dark:hover:bg-neutral-800',
              'focus:outline-none focus:ring-2 focus:ring-primary/60',
              'transition-colors'
            )}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {sections.map((section, sIdx) => (
            <div key={section.id} className={cn(sIdx > 0 && 'mt-4')}>
              {section.title && (
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5" role="list">
                {section.items.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    onClose={onClose}
                    closeOnNavigation={closeOnNavigation}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </nav>
    </div>,
    document.body
  )
}
