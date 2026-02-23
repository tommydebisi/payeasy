'use client'

import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null

export interface ColumnDef<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique key – should match a field on the row data for built-in sorting */
  id: string
  header: React.ReactNode
  /** Render cell content. Receives the full row object. */
  cell: (row: T) => React.ReactNode
  /** If true, clicking the column header cycles asc → desc → null */
  sortable?: boolean
  /** Tailwind width class, e.g. `w-32` or `w-1/4` */
  width?: string
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Hide the column below this breakpoint */
  hideBelow?: 'sm' | 'md' | 'lg'
}

export interface TableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[]
  data: T[]
  /** Unique row identifier – used as the React key */
  rowKey: keyof T
  /** Sort state – controlled from outside */
  sortBy?: string | null
  sortDir?: SortDirection
  onSort?: (columnId: string) => void
  loading?: boolean
  /** Shown when `data` is empty and `loading` is false */
  emptyState?: React.ReactNode
  /** Highlight the row on hover */
  hoverable?: boolean
  /** Allow rows to be selected */
  selectable?: boolean
  selectedRows?: Set<string | number>
  onRowSelect?: (rowKey: string | number, checked: boolean) => void
  onSelectAll?: (checked: boolean) => void
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void
  caption?: string
  className?: string
}

// ── Sort icon helper ───────────────────────────────────────────────────────────

function SortIcon({
  column,
  sortBy,
  sortDir,
}: {
  column: string
  sortBy?: string | null
  sortDir?: SortDirection
}) {
  if (sortBy !== column) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
  if (sortDir === 'asc')  return <ChevronUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
  return <ChevronDown className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
}

// ── Skeleton rows ──────────────────────────────────────────────────────────────

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3 rounded-full bg-gray-200 dark:bg-neutral-700 w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * `ResponsiveTable` – a data table that:
 * - Scrolls horizontally on mobile (instead of breaking layout).
 * - Supports controlled sorting with visual sort icons.
 * - Supports row selection with "select all" checkbox.
 * - Shows a loading skeleton and empty state.
 * - Columns can be hidden below configurable breakpoints.
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   { id: 'name', header: 'Name', cell: (r) => r.name, sortable: true },
 *   { id: 'email', header: 'Email', cell: (r) => r.email, hideBelow: 'md' },
 * ]
 *
 * <ResponsiveTable columns={columns} data={users} rowKey="id"
 *   sortBy={sort} sortDir={dir} onSort={handleSort} />
 * ```
 */
export function ResponsiveTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  sortBy,
  sortDir,
  onSort,
  loading = false,
  emptyState,
  hoverable = true,
  selectable = false,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onRowClick,
  caption,
  className,
}: TableProps<T>) {
  const allSelected =
    selectable && data.length > 0 && data.every((r) => selectedRows?.has(r[rowKey] as string | number))
  const someSelected =
    selectable && !allSelected && data.some((r) => selectedRows?.has(r[rowKey] as string | number))

  const hideClass: Record<NonNullable<ColumnDef['hideBelow']>, string> = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell',
  }

  const alignClass: Record<NonNullable<ColumnDef['align']>, string> = {
    left:   'text-left',
    center: 'text-center',
    right:  'text-right',
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-700', className)}>
      <table
        className="w-full min-w-full border-collapse text-sm"
        aria-busy={loading}
        aria-live="polite"
      >
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}

        {/* ── Head ── */}
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            {/* Checkbox column */}
            {selectable && (
              <th
                scope="col"
                className="w-10 px-4 py-3 text-left"
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-2 focus:ring-primary/60"
                  aria-label="Select all rows"
                />
              </th>
            )}

            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={cn(
                  'px-4 py-3 font-semibold text-gray-700 dark:text-gray-300',
                  'whitespace-nowrap text-xs uppercase tracking-wide',
                  col.align ? alignClass[col.align] : 'text-left',
                  col.width,
                  col.hideBelow && hideClass[col.hideBelow],
                  col.sortable && 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-white'
                )}
                onClick={col.sortable ? () => onSort?.(col.id) : undefined}
                aria-sort={
                  sortBy === col.id
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <SortIcon column={col.id} sortBy={sortBy} sortDir={sortDir} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
          {loading ? (
            <SkeletonRows cols={columns.length + (selectable ? 1 : 0)} />
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-sm text-gray-500 dark:text-neutral-400"
              >
                {emptyState ?? (
                  <span className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 opacity-30" aria-hidden="true" />
                    No data available
                  </span>
                )}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const key = row[rowKey] as string | number
              const isSelected = selectedRows?.has(key)

              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors',
                    hoverable && 'hover:bg-gray-50 dark:hover:bg-neutral-800/60',
                    isSelected && 'bg-primary/5 dark:bg-primary/10',
                    onRowClick && 'cursor-pointer'
                  )}
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {/* Checkbox cell */}
                  {selectable && (
                    <td
                      className="w-10 px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={(e) => onRowSelect?.(key, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-2 focus:ring-primary/60"
                        aria-label={`Select row ${key}`}
                      />
                    </td>
                  )}

                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        'px-4 py-3 text-gray-700 dark:text-gray-300',
                        col.align ? alignClass[col.align] : 'text-left',
                        col.hideBelow && hideClass[col.hideBelow]
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Pagination helper ──────────────────────────────────────────────────────────

export interface TablePaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  className?: string
}

/**
 * `TablePagination` – pairs with `ResponsiveTable` to provide
 * prev / next controls and an optional page-size selector.
 */
export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to   = Math.min(page * pageSize, total)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        'py-3 px-4 border-t border-gray-200 dark:border-neutral-700',
        className
      )}
    >
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              'text-sm rounded-lg border border-gray-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300',
              'px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/60'
            )}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              'border border-gray-300 dark:border-neutral-600',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-neutral-800',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-primary/60',
              'transition-colors'
            )}
            aria-label="Previous page"
          >
            ← Prev
          </button>

          <span className="px-2 text-sm text-gray-600 dark:text-neutral-400 tabular-nums">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              'border border-gray-300 dark:border-neutral-600',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-neutral-800',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-primary/60',
              'transition-colors'
            )}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
