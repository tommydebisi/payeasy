'use client'

import React, { useId } from 'react'
import { LucideIcon, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Shared helpers ─────────────────────────────────────────────────────────────

function FormLabel({
  htmlFor,
  required,
  children,
  className,
}: {
  htmlFor?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        className
      )}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

function FormHint({
  id,
  error,
  hint,
}: {
  id: string
  error?: string
  hint?: string
}) {
  if (error) {
    return (
      <p id={id} role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={id} className="mt-1.5 text-xs text-gray-500 dark:text-neutral-400">
        {hint}
      </p>
    )
  }
  return null
}

const baseInput = [
  'w-full rounded-lg border bg-white dark:bg-neutral-900',
  'text-sm sm:text-base text-gray-900 dark:text-white',
  'placeholder:text-gray-400 dark:placeholder:text-neutral-500',
  'transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-neutral-800',
].join(' ')

const errorBorder = 'border-red-400 dark:border-red-500 focus:ring-red-400/60 focus:border-red-400'
const normalBorder = 'border-gray-300 dark:border-neutral-600'

// ── Input ──────────────────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  /** Show a green checkmark when field is valid */
  success?: boolean
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  containerClassName?: string
}

/**
 * `FormInput` – text / email / number / etc. input with label, hint, error
 * states and optional leading / trailing icons. Fully accessible.
 *
 * @example
 * ```tsx
 * <FormInput label="Email" type="email" placeholder="you@example.com"
 *   error={errors.email} required />
 * ```
 */
export function FormInput({
  label,
  hint,
  error,
  success,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  containerClassName,
  className,
  id: externalId,
  type = 'text',
  required,
  disabled,
  ...props
}: InputProps) {
  const autoId = useId()
  const id = externalId ?? autoId
  const hintId = `${id}-hint`
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}

      <div className="relative flex items-center">
        {LeadingIcon && (
          <LeadingIcon
            className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 dark:text-neutral-500"
            aria-hidden="true"
          />
        )}

        <input
          id={id}
          type={resolvedType}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={(hint || error) ? hintId : undefined}
          className={cn(
            baseInput,
            'py-2 sm:py-2.5',
            LeadingIcon ? 'pl-9' : 'pl-3',
            isPassword || TrailingIcon || success || error ? 'pr-9' : 'pr-3',
            error ? errorBorder : normalBorder,
            className
          )}
          {...props}
        />

        {/* Trailing area: password toggle, success, error, or custom icon */}
        <div className="absolute right-3 flex items-center">
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : error ? (
            <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          ) : success ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
          ) : TrailingIcon ? (
            <TrailingIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          ) : null}
        </div>
      </div>

      <FormHint id={hintId} error={error} hint={hint} />
    </div>
  )
}

// ── Textarea ───────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  /** Show live character count */
  maxLength?: number
  containerClassName?: string
}

/**
 * `FormTextarea` – multi-line text area with label, error, and optional
 * live character count.
 */
export function FormTextarea({
  label,
  hint,
  error,
  maxLength,
  containerClassName,
  className,
  id: externalId,
  required,
  value,
  ...props
}: TextareaProps) {
  const autoId = useId()
  const id = externalId ?? autoId
  const hintId = `${id}-hint`
  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <FormLabel htmlFor={id} required={required}>
            {label}
          </FormLabel>
          {maxLength !== undefined && (
            <span
              className={cn(
                'text-xs tabular-nums',
                charCount > maxLength * 0.9
                  ? 'text-red-500'
                  : 'text-gray-400 dark:text-neutral-500'
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        id={id}
        required={required}
        maxLength={maxLength}
        value={value}
        aria-invalid={!!error}
        aria-describedby={(hint || error) ? hintId : undefined}
        className={cn(
          baseInput,
          'p-3 sm:p-3.5 min-h-[80px] sm:min-h-[100px] resize-y',
          error ? errorBorder : normalBorder,
          className
        )}
        {...props}
      />

      <FormHint id={hintId} error={error} hint={hint} />
    </div>
  )
}

// ── Select ─────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  containerClassName?: string
}

/**
 * `FormSelect` – native `<select>` styled to match the design system.
 * Uses a native select for maximum mobile compatibility.
 */
export function FormSelect({
  label,
  hint,
  error,
  options,
  placeholder,
  containerClassName,
  className,
  id: externalId,
  required,
  ...props
}: SelectProps) {
  const autoId = useId()
  const id = externalId ?? autoId
  const hintId = `${id}-hint`

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}

      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={(hint || error) ? hintId : undefined}
          className={cn(
            baseInput,
            'appearance-none cursor-pointer',
            'py-2 sm:py-2.5 pl-3 pr-9',
            error ? errorBorder : normalBorder,
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </div>

      <FormHint id={hintId} error={error} hint={hint} />
    </div>
  )
}

// ── Checkbox ───────────────────────────────────────────────────────────────────

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: string
  description?: string
  error?: string
  containerClassName?: string
}

/**
 * `FormCheckbox` – accessible checkbox with optional description and error.
 */
export function FormCheckbox({
  label,
  description,
  error,
  containerClassName,
  className,
  id: externalId,
  ...props
}: CheckboxProps) {
  const autoId = useId()
  const id = externalId ?? autoId

  return (
    <div className={cn('flex items-start gap-3', containerClassName)}>
      <input
        type="checkbox"
        id={id}
        aria-invalid={!!error}
        className={cn(
          'mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-neutral-600',
          'text-primary focus:ring-2 focus:ring-primary/60',
          'disabled:opacity-50',
          className
        )}
        {...props}
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
            {description}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

// ── RadioGroup ─────────────────────────────────────────────────────────────────

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  label?: string
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  hint?: string
  /** Stack options vertically (default) or horizontally */
  orientation?: 'vertical' | 'horizontal'
  containerClassName?: string
}

/**
 * `FormRadioGroup` – accessible radio group with optional descriptions.
 */
export function FormRadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  hint,
  orientation = 'vertical',
  containerClassName,
}: RadioGroupProps) {
  const groupId = useId()
  const hintId = `${groupId}-hint`

  return (
    <fieldset className={cn('w-full', containerClassName)}>
      {label && (
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </legend>
      )}

      <div
        role="radiogroup"
        aria-describedby={(hint || error) ? hintId : undefined}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-3 sm:gap-4'
        )}
      >
        {options.map((opt) => {
          const optId = `${groupId}-${opt.value}`
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={cn(
                'flex items-start gap-2.5 cursor-pointer',
                opt.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <input
                type="radio"
                id={optId}
                name={name}
                value={opt.value}
                checked={value === opt.value}
                disabled={opt.disabled}
                onChange={() => onChange?.(opt.value)}
                className="mt-0.5 h-4 w-4 border-gray-300 dark:border-neutral-600 text-primary focus:ring-2 focus:ring-primary/60"
              />
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="block text-xs text-gray-500 dark:text-neutral-400">
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          )
        })}
      </div>

      {(hint || error) && (
        <div className="mt-2">
          <FormHint id={hintId} error={error} hint={hint} />
        </div>
      )}
    </fieldset>
  )
}

// ── FormGroup ──────────────────────────────────────────────────────────────────

/**
 * `FormGroup` – responsive form layout that stacks fields vertically on mobile
 * and arranges them in a 2-column grid on `sm`+.
 */
export function FormGroup({
  children,
  columns = 1,
  className,
}: {
  children: React.ReactNode
  columns?: 1 | 2
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        columns === 2 && 'sm:grid sm:grid-cols-2 sm:gap-x-6',
        className
      )}
    >
      {children}
    </div>
  )
}
