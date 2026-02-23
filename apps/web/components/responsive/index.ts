/**
 * @module components/responsive
 *
 * Mobile-first, accessible, Tailwind-based component library.
 * All components follow WCAG 2.1 AA guidelines.
 */

// ── Card ───────────────────────────────────────────────────────────────────────
export {
  ResponsiveCard,
  CardTitle,
  CardDescription,
  CardGrid,
} from './Card'
export type { CardProps, CardVariant, CardSize } from './Card'

// ── Button ─────────────────────────────────────────────────────────────────────
export { ResponsiveButton, ButtonGroup } from './Button'
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonGroupProps,
} from './Button'

// ── Form components ────────────────────────────────────────────────────────────
export {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormGroup,
} from './Form'
export type {
  InputProps,
  TextareaProps,
  SelectProps,
  SelectOption,
  CheckboxProps,
  RadioGroupProps,
  RadioOption,
} from './Form'

// ── Modal ──────────────────────────────────────────────────────────────────────
export { ResponsiveModal, ConfirmModal } from './Modal'
export type {
  ModalProps,
  ModalSize,
  ModalPosition,
  ConfirmModalProps,
} from './Modal'

// ── Navigation drawer ──────────────────────────────────────────────────────────
export { NavigationDrawer } from './NavigationDrawer'
export type {
  NavigationDrawerProps,
  NavItem,
  NavSection,
  DrawerSide,
} from './NavigationDrawer'

// ── Table ──────────────────────────────────────────────────────────────────────
export { ResponsiveTable, TablePagination } from './Table'
export type {
  TableProps,
  ColumnDef,
  SortDirection,
  TablePaginationProps,
} from './Table'
