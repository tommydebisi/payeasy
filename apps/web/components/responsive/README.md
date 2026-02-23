# Responsive Component Library

> **Phase 16 – UI/Design System & Visual Excellence**
> Mobile-first, accessible, Tailwind-based components. All components pass WCAG 2.1 AA.

---

## Quick start

```tsx
import {
  ResponsiveCard, CardTitle, CardDescription,
  ResponsiveButton, ButtonGroup,
  FormInput, FormSelect, FormCheckbox,
  ResponsiveModal, ConfirmModal,
  NavigationDrawer,
  ResponsiveTable, TablePagination,
} from '@/components/responsive'
```

---

## Components

### `ResponsiveCard`

A flexible content container with multiple visual variants.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'elevated' \| 'outlined' \| 'filled' \| 'ghost'` | `'elevated'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding scale |
| `hoverable` | `boolean` | `true` | Lift + shadow on hover |
| `loading` | `boolean` | `false` | Shows skeleton placeholder |
| `icon` | `LucideIcon` | – | Leading icon in header |
| `badge` | `ReactNode` | – | Chip/status badge |
| `actions` | `ReactNode` | – | Icon buttons in header |
| `header` | `ReactNode` | – | Custom header slot |
| `footer` | `ReactNode` | – | Footer slot |

**Sub-components:** `CardTitle`, `CardDescription`, `CardGrid`

```tsx
<CardGrid columns={3}>
  <ResponsiveCard variant="outlined" icon={Home}
    header={<CardTitle>My Listing</CardTitle>}
    footer={<ResponsiveButton size="sm">View</ResponsiveButton>}>
    <CardDescription>A great place to stay.</CardDescription>
  </ResponsiveCard>
</CardGrid>
```

---

### `ResponsiveButton`

Touch-friendly button with 6 variants and 5 sizes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | Color scheme |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Touch target size |
| `isLoading` | `boolean` | `false` | Spinner + disabled state |
| `loadingText` | `string` | – | Text shown while loading |
| `leftIcon` / `rightIcon` | `LucideIcon` | – | Icons flanking label |
| `iconOnly` | `boolean` | `false` | Square icon-only button |
| `fullWidth` | `boolean` | `false` | Stretch to container width |
| `responsive` | `boolean` | `false` | Upscale at sm breakpoint |

**Sub-component:** `ButtonGroup` – stacks vertically on mobile, row on sm+.

```tsx
<ButtonGroup>
  <ResponsiveButton variant="primary" leftIcon={Plus}>Add</ResponsiveButton>
  <ResponsiveButton variant="tertiary" leftIcon={Trash2} iconOnly aria-label="Delete" />
</ButtonGroup>
```

---

### Form components

All form components auto-generate an `id`, wire `aria-describedby` to hints / errors, and support the `required` attribute.

#### `FormInput`

```tsx
<FormInput label="Email" type="email" placeholder="you@example.com"
  leadingIcon={Mail} error={errors.email} required />
```

#### `FormTextarea`

```tsx
<FormTextarea label="Bio" maxLength={250} value={bio} onChange={…} hint="Tell us about yourself" />
```

#### `FormSelect`

```tsx
<FormSelect label="Country" options={countryOptions} placeholder="Select a country"
  error={errors.country} required />
```

#### `FormCheckbox`

```tsx
<FormCheckbox label="I agree to the terms" description="Read our privacy policy" required />
```

#### `FormRadioGroup`

```tsx
<FormRadioGroup label="Payment method" name="payment"
  options={[{ value: 'card', label: 'Credit card' }, { value: 'stellar', label: 'Stellar (XLM)' }]}
  value={method} onChange={setMethod} />
```

#### `FormGroup`

Responsive 2-column grid layout for form fields.

```tsx
<FormGroup columns={2}>
  <FormInput label="First name" />
  <FormInput label="Last name" />
</FormGroup>
```

---

### `ResponsiveModal`

A dialog that renders as a **centered overlay** on desktop and as a **bottom sheet** on mobile.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | – | Controls visibility |
| `onClose` | `() => void` | – | Dismiss callback |
| `title` | `string` | – | Dialog title |
| `description` | `string` | – | Subtitle below title |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Max-width |
| `position` | `'center' \| 'bottom'` | `'center'` | Slide origin |
| `footer` | `ReactNode` | – | Action buttons slot |
| `closeOnBackdropClick` | `boolean` | `true` | Click-away to close |

**Sub-component:** `ConfirmModal` – pre-wired confirm/cancel dialog.

```tsx
<ConfirmModal isOpen={open} onConfirm={handleDelete} onCancel={() => setOpen(false)}
  title="Delete listing?" confirmLabel="Delete" destructive />
```

---

### `NavigationDrawer`

A slide-in side navigation panel with section grouping, nested items, badges, and icons.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | – | Controls visibility |
| `onClose` | `() => void` | – | Dismiss callback |
| `sections` | `NavSection[]` | – | Navigation data |
| `side` | `'left' \| 'right'` | `'left'` | Slide direction |
| `header` | `ReactNode` | – | Logo / user header |
| `footer` | `ReactNode` | – | Sign-out / settings |
| `widthClass` | `string` | `'w-72'` | Tailwind width |
| `closeOnNavigation` | `boolean` | `true` | Auto-close on link click |

```tsx
const sections: NavSection[] = [
  {
    id: 'main',
    title: 'Menu',
    items: [
      { id: 'home',     label: 'Home',     href: '/',          icon: Home,   active: true },
      { id: 'listings', label: 'Listings', href: '/listings',  icon: Search, badge: 3 },
    ],
  },
]

<NavigationDrawer isOpen={open} onClose={close} sections={sections}
  header={<Logo />} footer={<SignOutButton />} />
```

---

### `ResponsiveTable`

A horizontally-scrollable data table with sorting, row selection, loading skeleton, and empty state.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<T>[]` | – | Column configuration |
| `data` | `T[]` | – | Row data |
| `rowKey` | `keyof T` | – | Unique row identifier |
| `sortBy` / `sortDir` | `string \| null` / `SortDirection` | – | Controlled sort state |
| `onSort` | `(id: string) => void` | – | Sort callback |
| `loading` | `boolean` | `false` | Skeleton mode |
| `emptyState` | `ReactNode` | – | Custom empty state |
| `selectable` | `boolean` | `false` | Checkbox selection |
| `onRowClick` | `(row: T) => void` | – | Row click handler |

**Sub-component:** `TablePagination`

```tsx
const columns: ColumnDef<Payment>[] = [
  { id: 'id',     header: '#',      cell: (r) => r.id,     sortable: true },
  { id: 'amount', header: 'Amount', cell: (r) => r.amount, sortable: true, align: 'right' },
  { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} />, hideBelow: 'md' },
]

<ResponsiveTable columns={columns} data={payments} rowKey="id"
  sortBy={sort} sortDir={dir} onSort={handleSort} loading={isLoading} />
<TablePagination page={page} pageSize={20} total={total} onPageChange={setPage} />
```

---

## Design tokens

All components use CSS custom properties via Tailwind:

| Token | Usage |
|-------|-------|
| `primary` | Brand color (Stellar Violet `#7D00FF`) |
| `accent` | Tech Blue `#3178C6` |
| `success` / `warning` / `danger` | Semantic states |
| `xs` → `2xl` | Responsive breakpoints |

## Accessibility

- All interactive elements have visible focus rings (`focus:ring-2 focus:ring-primary/60`)
- Modals and drawers trap focus and respond to `Escape`
- `aria-*` attributes wired automatically
- Color contrast ≥ 4.5:1 for normal text
- Touch targets ≥ 44 × 44 px for interactive elements (md+ size)

## File structure

```
components/responsive/
├── index.ts              ← barrel export
├── Card.tsx
├── Button.tsx
├── Form.tsx
├── Modal.tsx
├── NavigationDrawer.tsx
└── Table.tsx
```
