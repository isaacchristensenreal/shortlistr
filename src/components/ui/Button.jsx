export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-electric-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] select-none'

  const variants = {
    primary: 'btn-shimmer btn-pop bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 text-white shadow-md shadow-electric-500/25 hover:shadow-lg hover:shadow-electric-500/35 hover:-translate-y-0.5',
    secondary: 'btn-pop bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-black/20',
    ghost: 'btn-pop text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
