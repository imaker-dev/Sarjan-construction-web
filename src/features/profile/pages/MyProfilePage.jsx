import PageHeaderBanner from '@components/ui/PageHeaderBanner'
import { getProfile } from '@store/slices/profile.slice'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v)

const formatDate = (v) => {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'

// Solid avatar colours, same idea as the Employees list.
// If you already have a util for this, import it and delete this.
const AVATAR_COLORS = [
  'bg-orange-500',
  'bg-lime-500',
  'bg-red-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
]
const avatarColor = (name = '') =>
  AVATAR_COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length]

const humanize = (s = '') =>
  s
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const GROUP_LABELS = {
  ORG: 'Organization',
  PLATFORM: 'Platform',
  DEPARTMENT: 'Departments',
  EMPLOYEE: 'Employees',
  COMPLIANCE: 'Compliance',
  ROLE: 'Role Assignment',
  ACCESS: 'Access Control',
  ATTENDANCE: 'Attendance',
  LEAVE: 'Leave',
  OPERATION: 'Operations',
  FORM: 'Forms',
}

const groupPermissions = (permissions = []) => {
  const map = {}
  permissions.forEach((p) => {
    const [prefix, ...rest] = p.split('_')
    if (!map[prefix]) map[prefix] = []
    map[prefix].push({ key: p, label: humanize(rest.join('_') || prefix) })
  })
  return Object.entries(map).map(([prefix, items]) => ({
    prefix,
    label: GROUP_LABELS[prefix] || humanize(prefix),
    items,
  }))
}

const STATUS_STYLES = {
  ACTIVE:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400',
}

const PASSWORD_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'num', label: 'One number', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

const STRENGTH = [
  { label: 'Too weak', bar: 'bg-red-500', text: 'text-red-600' },
  { label: 'Weak', bar: 'bg-red-500', text: 'text-red-600' },
  { label: 'Fair', bar: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Good', bar: 'bg-lime-500', text: 'text-lime-600' },
  { label: 'Strong', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  { label: 'Excellent', bar: 'bg-emerald-500', text: 'text-emerald-600' },
]

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

const Card = ({ title, subtitle, icon: Icon, action, children, className = '' }) => (
  <section
    className={`rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
  >
    {title && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Icon size={18} />
            </span>
          )}
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
    )}
    <div className="px-5 py-5 sm:px-6">{children}</div>
  </section>
)

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Icon size={16} />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  </div>
)

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800 ${className}`} />
)

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-44 w-full rounded-xl" />
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-96 rounded-xl lg:col-span-1" />
      <Skeleton className="h-96 rounded-xl lg:col-span-2" />
    </div>
  </div>
)

/* -------------------------------------------------------------------------- */
/*  Change password modal                                                     */
/* -------------------------------------------------------------------------- */

const PasswordField = ({ id, label, value, onChange, error, autoFocus, autoComplete }) => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          className={`block w-full rounded-lg border bg-white py-2.5 pl-3.5 pr-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-white ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
              : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/15 dark:border-slate-700'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const ChangePasswordModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && !loading && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, loading, onClose])

  useEffect(() => {
    if (!open) {
      setForm({ current: '', next: '', confirm: '' })
      setErrors({})
      setDone(false)
      setLoading(false)
    }
  }, [open])

  const passed = useMemo(() => PASSWORD_RULES.filter((r) => r.test(form.next)).length, [form.next])
  const strength = STRENGTH[form.next ? passed : 0]

  if (!open) return null

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined, form: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.current) next.current = 'Enter your current password.'
    if (passed < PASSWORD_RULES.length) next.next = 'Password does not meet all requirements.'
    else if (form.next === form.current) next.next = 'New password must differ from the current one.'
    if (form.confirm !== form.next) next.confirm = 'Passwords do not match.'
    if (Object.keys(next).length) return setErrors(next)

    try {
      setLoading(true)
      await onSubmit({ currentPassword: form.current, newPassword: form.next })
      setDone(true)
      setTimeout(onClose, 1400)
    } catch (err) {
      setErrors({ form: err?.message || 'Could not change password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:max-w-md sm:rounded-xl"
      >
        {done ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
              <Check size={28} />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Password updated</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Use your new password the next time you sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <KeyRound size={19} />
                </span>
                <div>
                  <h3 id="change-password-title" className="text-base font-semibold text-slate-900 dark:text-white">
                    Change password
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose a strong password you don&apos;t use elsewhere.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <PasswordField
                id="current-password"
                label="Current password"
                value={form.current}
                onChange={set('current')}
                error={errors.current}
                autoFocus
                autoComplete="current-password"
              />
              <PasswordField
                id="new-password"
                label="New password"
                value={form.next}
                onChange={set('next')}
                error={errors.next}
                autoComplete="new-password"
              />

              {form.next && (
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Password strength</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="mt-1.5 flex gap-1.5">
                    {PASSWORD_RULES.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < passed ? strength.bar : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <ul className="grid grid-cols-1 gap-1.5 rounded-xl bg-slate-50 p-3.5 text-xs dark:bg-slate-800/60 sm:grid-cols-2">
                {PASSWORD_RULES.map((r) => {
                  const ok = r.test(form.next)
                  return (
                    <li
                      key={r.id}
                      className={`flex items-center gap-2 ${
                        ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                          ok ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        {ok && <Check size={10} strokeWidth={3} />}
                      </span>
                      {r.label}
                    </li>
                  )
                })}
              </ul>

              <PasswordField
                id="confirm-password"
                label="Confirm new password"
                value={form.confirm}
                onChange={set('confirm')}
                error={errors.confirm}
                autoComplete="new-password"
              />

              {errors.form && (
                <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  {errors.form}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const MyProfilePage = () => {
  const dispatch = useDispatch()
  const { isGettingProfile, profileData } = useSelector((state) => state.profile)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [permQuery, setPermQuery] = useState('')

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  const groups = useMemo(() => groupPermissions(profileData?.permissions), [profileData])

  const filteredGroups = useMemo(() => {
    const q = permQuery.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) => i.label.toLowerCase().includes(q) || g.label.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length)
  }, [groups, permQuery])

  /**
   * TODO: wire this to your API / redux thunk, e.g.
   *   await dispatch(changePassword({ currentPassword, newPassword })).unwrap()
   * Throw an Error with a readable message on failure; the modal will show it.
   */
  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    // eslint-disable-next-line no-unused-vars
    const _payload = { currentPassword, newPassword }
    await new Promise((resolve) => setTimeout(resolve, 900)) // placeholder
  }

  if (isGettingProfile && !profileData) {
    return (
      <div>
        <PageHeaderBanner title={'My Profile'} />
        <div className="mt-6">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div>
        <PageHeaderBanner title={'My Profile'} />
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">
          We couldn&apos;t load your profile. Refresh the page to try again.
        </div>
      </div>
    )
  }

  const p = profileData
  const assignments = p.assignments || []
  const departments = p.departments || []
  const status = (p.status || '').toUpperCase()

  const scopeLabel = (a) =>
    a.siteName || a.projectName || a.headOfficeName || p.company?.name || '—'
  const scopeType = (a) => humanize(a.scopeType || '')

  return (
    <div>
      <PageHeaderBanner title={'My Profile'} />

      <div className="mt-6 space-y-6">
        {/* ------------------------------ Header card ------------------------------ */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-medium text-white sm:h-20 sm:w-20 sm:text-2xl ${avatarColor(
                  p.displayName
                )}`}
              >
                {initials(p.displayName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                    {dash(p.displayName)}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      STATUS_STYLES[status] || STATUS_STYLES.INACTIVE
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {humanize(status)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                  {dash(p.employeeCode)} · {dash(p.loginId)}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                    <BadgeCheck size={13} />
                    {humanize(p.role)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Building2 size={13} />
                    {dash(p.company?.name)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 sm:w-auto"
            >
              <KeyRound size={16} />
              Change Password
            </button>
          </div>

          <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-4 sm:divide-y-0">
            {[
              ['Roles', (p.roles || []).length],
              ['Permissions', (p.permissions || []).length],
              ['Assignments', assignments.length],
              ['Departments', departments.length],
            ].map(([label, value]) => (
              <div key={label} className="px-5 py-3.5 sm:px-6">
                <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ------------------------------ Body ------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-1">
            <Card title="Account details" subtitle="Your personal and work information" icon={Fingerprint}>
              <div className="-my-3 divide-y divide-slate-100 dark:divide-slate-800">
                <InfoRow icon={Fingerprint} label="Employee code" value={dash(p.employeeCode)} />
                <InfoRow icon={Mail} label="Login ID" value={dash(p.loginId)} />
                <InfoRow icon={Mail} label="Contact email" value={dash(p.contactEmail)} />
                <InfoRow icon={Phone} label="Contact phone" value={dash(p.contactPhone)} />
                <InfoRow icon={Briefcase} label="Designation" value={dash(p.designation)} />
                <InfoRow icon={Wrench} label="Trade category" value={dash(p.tradeCategory)} />
                <InfoRow icon={CalendarDays} label="Joining date" value={formatDate(p.joiningDate)} />
              </div>
            </Card>

            <Card title="Security" subtitle="Keep your account protected" icon={ShieldCheck}>
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary-500 shadow-sm dark:bg-slate-900">
                  <KeyRound size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Password</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Update your password regularly to keep your account secure.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300"
              >
                <KeyRound size={16} />
                Change Password
              </button>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-2">
            <Card
              title="Role assignments"
              subtitle="Where your roles apply"
              icon={Layers}
              action={
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {assignments.length}
                </span>
              }
            >
              {assignments.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {assignments.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-primary-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-primary-500/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {dash(a.roleName)}
                        </p>
                        <span className="shrink-0 rounded-md bg-secondary-50 px-2 py-0.5 text-[11px] font-medium text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-300">
                          {scopeType(a)}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={13} />
                        <span className="truncate">{scopeLabel(a)}</span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <CalendarDays size={13} />
                        {a.effectiveFrom || a.effectiveTo
                          ? `${formatDate(a.effectiveFrom)} – ${a.effectiveTo ? formatDate(a.effectiveTo) : 'Present'}`
                          : 'No expiry'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No role assignments yet.</p>
              )}
            </Card>

            <Card
              title="Permissions"
              subtitle="What you can access across the platform"
              icon={ShieldCheck}
              action={
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                  {(p.permissions || []).length} granted
                </span>
              }
            >
              {groups.length > 0 && (
                <div className="relative mb-5">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={permQuery}
                    onChange={(e) => setPermQuery(e.target.value)}
                    placeholder="Search permissions"
                    className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              )}

              {filteredGroups.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredGroups.map((g) => (
                    <div
                      key={g.prefix}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{g.label}</h3>
                        <span className="text-xs text-slate-400">{g.items.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map((i) => (
                          <span
                            key={i.key}
                            title={i.key}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <Check size={11} className="text-primary-500" strokeWidth={3} />
                            {i.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {groups.length ? 'No permissions match your search.' : 'No permissions granted.'}
                </p>
              )}
            </Card>

            <Card title="Departments" subtitle="Teams you belong to" icon={Users}>
              {departments.length ? (
                <div className="flex flex-wrap gap-2">
                  {departments.map((d, idx) => (
                    <span
                      key={d.id || idx}
                      className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                    >
                      {typeof d === 'string' ? d : d.name || d.departmentName || '—'}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <Users size={18} />
                  </span>
                  <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Not part of any department
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Department memberships will appear here.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  )
}

export default MyProfilePage