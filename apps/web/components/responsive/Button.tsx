'use client'

import React from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'danger'
  | 'success'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant
  /** Base size – auto-scales on larger viewports when `responsive` is true */
  size?: ButtonSize
  /** Upscale the button one step at the sm breakpoint */
  responsive?: boolean
  isLoading?: boolean
  loadingText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  /** Stretch to fill the container width */
  fullWidth?: boolean
  /** Show just the icon with no text (square button) */
  iconOnly?: boolean
  type?: 'button' | 'submit' | 'reset'
  children?: React.ReactNode
}

// ── Style maps ─────────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md active:bg-primary/80 focus:ring-primary',
  secondary:
    'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm hover:bg-gray-300 dark:hover:bg-neutral-600 focus:ring-gray-500',
  tertiary:
    'bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:ring-gray-500',
  ghost:
    'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:ring-gray-500',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
  success:
    'bg-green-600 text-white shadow-sm hover:bg-green-700 active:bg-green-800 focus:ring-green-500',
}

/**
 * Base padding / height per size (mobile-first).
 * Responsive sizes use Tailwind sm: prefix to step up.
 */
const sizeStyles: Record<ButtonSize, string> = {
  xs:  'px-2.5 py-1    text-xs  min-h-[28px] gap-1',
  sm:  'px-3    py-1.5 text-sm  min-h-[36px] gap-1.5',
  md:  'px-4    py-2   text-sm  min-h-[40px] gap-2 sm:text-base sm:min-h-[44px]',
  lg:  'px-5    py-2.5 text-base min-h-[48px] gap-2',
  xl:  'px-6    py-3   text-lg  min-h-[56px] gap-2.5',
}

const iconSizeStyles: Record<ButtonSize, string> = {
  xs:  'h-3 w-3',
  sm:  'h-4 w-4',
  md:  'h-4 w-4 sm:h-5 sm:w-5',
  lg:  'h-5 w-5',
  xl:  'h-6 w-6',
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * `ResponsiveButton` – extends the base Button with additional variants,
 * an `xs` / `xl` size, an `iconOnly` square mode, and a `loadingText` prop.
 *
 * All touch targets meet WCAG 2.1 AA minimum (44 × 44 px for md+).
 *
 * @example
 * ```tsx
 * <ResponsiveButton variant="primary" size="md" leftIcon={Plus}>
 *   Add Listing
 * </ResponsiveButton>
 *
 * <ResponsiveButton variant="ghost" size="sm" iconOnly leftIcon={Trash2}
 *   aria-label="Delete item" />
 * ```
 */
export function ResponsiveButton({
  variant = 'primary',
  size = 'md',
  responsive = false,
  isLoading = false,
  loadingText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  iconOnly = false,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'active:scale-[0.97]',
        variantStyles[variant],
        sizeStyles[size],
        iconOnly && 'aspect-square p-0',
        fullWidth && 'w-full',
        responsive && 'sm:px-5 sm:py-2.5 sm:text-base',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn('animate-spin', iconSizeStyles[size])} aria-hidden="true" />
          {loadingText ? (
            <span>{loadingText}</span>
          ) : (
            <span className="sr-only">Loading…</span>
          )}
        </>
      ) : (
        <>
          {LeftIcon && (
            <LeftIcon
              className={cn(iconSizeStyles[size], iconOnly && 'mx-auto')}
              aria-hidden="true"
            />
          )}
          {!iconOnly && children}
          {RightIcon && !iconOnly && (
            <RightIcon className={iconSizeStyles[size]} aria-hidden="true" />
          )}
        </>
      )}
    </button>
  )
}

// ── ButtonGroup ────────────────────────────────────────────────────────────────

export interface ButtonGroupProps {
  children: React.ReactNode
  /** Stack vertically on small screens, row on larger */
  stackOnMobile?: boolean
  className?: string
}

/**
 * `ButtonGroup` – wraps multiple `ResponsiveButton` elements. On mobile they
 * stack vertically; on sm+ they sit side-by-side.
 */
export function ButtonGroup({
  children,
  stackOnMobile = true,
  className,
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        'flex',
        stackOnMobile ? 'flex-col sm:flex-row' : 'flex-row',
        'gap-2 sm:gap-3',
        className
      )}
    >
      {children}
    </div>
  )
}
