import { motion } from 'framer-motion';

/**
 * D5.3 - Skeleton Loaders (GitHub Style)
 * Componentes de loading que respeitam o tema dark/light
 */

export function SkeletonCard({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl p-6 ${className}`}
      style={{ 
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 rounded" style={{ backgroundColor: 'var(--color-border)', width: '40%' }}></div>
        <div className="h-8 rounded" style={{ backgroundColor: 'var(--color-border)', width: '60%' }}></div>
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--color-border)', width: '80%' }}></div>
      </div>
    </motion.div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl overflow-hidden"
      style={{ 
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      {/* Header */}
      <div className="p-4 flex gap-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-4 rounded flex-1 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }}></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div 
          key={idx} 
          className="p-4 flex gap-4 animate-pulse"
          style={{ 
            borderBottom: idx < rows - 1 ? '1px solid var(--color-border)' : 'none',
            animationDelay: `${idx * 0.1}s`
          }}
        >
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-3 rounded flex-1" style={{ backgroundColor: 'var(--color-border)' }}></div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}

export function SkeletonRow({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${className}`}
      style={{ 
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="animate-pulse space-y-3">
        <div className="h-4 rounded" style={{ backgroundColor: 'var(--color-border)', width: '30%' }}></div>
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--color-border)', width: '90%' }}></div>
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--color-border)', width: '70%' }}></div>
      </div>
    </motion.div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl p-6 ${className}`}
      style={{ 
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 rounded" style={{ backgroundColor: 'var(--color-border)', width: '40%' }}></div>
        <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--color-border)' }}></div>
      </div>
    </motion.div>
  );
}

export function SkeletonTimeline({ items = 5 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="flex gap-4 animate-pulse" style={{ animationDelay: `${idx * 0.1}s` }}>
          <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-border)' }}></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded" style={{ backgroundColor: 'var(--color-border)', width: '60%' }}></div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--color-border)', width: '40%' }}></div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export function SkeletonList({ items = 6 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {Array.from({ length: items }).map((_, idx) => (
        <div 
          key={idx} 
          className="p-4 rounded-lg animate-pulse"
          style={{ 
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            animationDelay: `${idx * 0.05}s`
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded" style={{ backgroundColor: 'var(--color-border)', width: '70%' }}></div>
              <div className="h-2 rounded" style={{ backgroundColor: 'var(--color-border)', width: '40%' }}></div>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// Skeleton genérico customizável
export function SkeletonBox({ width = '100%', height = '20px', className = '' }) {
  return (
    <div 
      className={`rounded animate-pulse ${className}`}
      style={{ 
        backgroundColor: 'var(--color-border)',
        width,
        height
      }}
    ></div>
  );
}
