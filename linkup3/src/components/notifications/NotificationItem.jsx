import { memo } from 'react'
import { AlertTriangle, CheckCircle2, Info, ExternalLink } from 'lucide-react'
import BadgeStatus from '../ui/BadgeStatus'

const iconByStatus = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle
}

function NotificationItem({ n, onMarkRead }) {
  const { title, description, status, timeLabel, read, originLabel, hasDeepLink } = n
  const Icon = iconByStatus[status] || Info

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onMarkRead}
      onKeyDown={(e) => e.key === 'Enter' && onMarkRead?.()}
      className="p-4 rounded-lg transition-all cursor-pointer"
      style={{
        backgroundColor: read ? 'var(--color-card)' : 'var(--color-border-light)',
        border: `1px solid ${read ? 'var(--color-border)' : 'var(--primary)'}`,
        boxShadow: 'var(--shadow-card)'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-elevated)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-current" style={{ color: 'var(--color-text-primary)' }}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h4>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>{timeLabel}</span>
              {hasDeepLink && <ExternalLink className="w-3 h-3" />}
            </div>
          </div>
          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
            {description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <BadgeStatus status={status} label={originLabel} />
            {!read && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(NotificationItem)
