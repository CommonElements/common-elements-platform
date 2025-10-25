interface NotificationBadgeProps {
  count: number
  className?: string
}

export function NotificationBadge({
  count,
  className = '',
}: NotificationBadgeProps) {
  if (count === 0) return null

  const displayCount = count > 99 ? '99+' : count.toString()

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ${className}`}
    >
      {displayCount}
    </span>
  )
}
