'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost'
export type CardSize = 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style of the card */
  variant?: CardVariant
  /** Internal padding scale */
  size?: CardSize
  /** Lift + shadow on hover */
  hoverable?: boolean
  /** Show a loading skeleton instead of children */
  loading?: boolean
  /** Optional leading icon rendered in the header area */
  icon?: LucideIcon
  /** Badge element placed in the top-right corner */
  badge?: React.ReactNode
  /** Action buttons / menu placed in the top-right corner */
  actions?: React.ReactNode
  /** Slot rendered above children (below icon row) */
  header?: React.ReactNode
  /** Slot rendered below children */
  footer?: React.ReactNode
  /** Whether child content has image at the top (removes top padding) */
  mediaTop?: boolean
  children: React.ReactNode
}

// ── Style maps ─────────────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, string> = {
  elevated:
    'bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md border border-transparent',
  outlined:
    'bg-transparent border-2 border-gray-200 dark:border-neutral-700 hover:border-primary/40 dark:hover:border-primary/40',
  filled:
    'bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700',
  ghost:
    'bg-transparent border-0 shadow-none',
}

const sizeStyles: Record<CardSize, { padding: string; gap: string }> = {
  sm: { padding: 'p-3 sm:p-4', gap: 'gap-2' },
  md: { padding: 'p-4 sm:p-6', gap: 'gap-3' },
  lg: { padding: 'p-6 sm:p-8', gap: 'gap-4' },
}

// ── Skeleton helper ────────────────────────────────────────────────────────────

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-3 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse',
        className
      )}
    />
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * `ResponsiveCard` – a flexible card that adapts padding and layout across
 * all breakpoints (xs → 2xl). Supports multiple visual variants, an optional
 * loading skeleton, header / footer slots, and icon / action areas.
 *
 * @example
 * ```tsx
 * <ResponsiveCard variant="outlined" size="md" hoverable icon={Star}>
 *   <p>Content</p>
 * </ResponsiveCard>
 * ```
 */
export function ResponsiveCard({
  variant = 'elevated',
  size = 'md',
  hoverable = true,
  loading = false,
  icon: Icon,
  badge,
  actions,
  header,
  footer,
  mediaTop = false,
  children,
  className,
  role = 'article',
  ...props
}: CardProps) {
  const { padding, gap } = sizeStyles[size]

  return (
    <article
      role={role}
      className={cn(
        'rounded-xl transition-all duration-300 overflow-hidden',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        variantStyles[variant],
        hoverable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {/* ── Icon / Badge / Actions row ── */}
      {(Icon || badge || header || actions) && !loading && (
        <div
          className={cn(
            'flex items-start justify-between',
            padding,
            'pb-0'
          )}
        >
          <div className={cn('flex items-start flex-1 min-w-0', gap)}>
            {Icon && (
              <div
                className={cn(
                  'flex-shrink-0 p-2 sm:p-2.5 rounded-lg transition-colors',
                  variant === 'filled'
                    ? 'bg-white dark:bg-neutral-900 text-primary'
                    : 'bg-primary/10 text-primary'
                )}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            {header && <div className="flex-1 min-w-0">{header}</div>}
          </div>

          <div className="flex items-start gap-1 sm:gap-2 flex-shrink-0 ml-2">
            {badge && <div className="flex-shrink-0">{badge}</div>}
            {actions && (
              <div className="flex items-center gap-1">{actions}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div
        className={cn(
          padding,
          (Icon || badge || header || actions) && !loading && 'pt-3 sm:pt-4'
        )}
      >
        {loading ? (
          <div className="space-y-3">
            <SkeletonLine className="w-3/4" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-5/6" />
          </div>
        ) : (
          children
        )}
      </div>

      {/* ── Footer ── */}
      {footer && !loading && (
        <div
          className={cn(
            'border-t border-gray-100 dark:border-neutral-800',
            padding,
            'pt-3 sm:pt-4'
          )}
        >
          {footer}
        </div>
      )}
    </article>
  )
}

// ── Compound sub-components ────────────────────────────────────────────────────

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        'text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate',
        className
      )}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'text-xs sm:text-sm text-gray-500 dark:text-neutral-400 line-clamp-2',
        className
      )}
    >
      {children}
    </p>
  )
}

export function CardGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode
  /** Max columns on large screens */
  columns?: 1 | 2 | 3 | 4
  className?: string
}) {
  const colMap: Record<number, string> = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }
  return (
    <div
      className={cn('grid grid-cols-1 gap-4 sm:gap-6', colMap[columns], className)}
    >
      {children}
    </div>
  )
}
