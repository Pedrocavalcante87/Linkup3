import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * D5.2 - ButtonWithLoader
 * Botão com estado de loading para feedback imediato
 */
export default function ButtonWithLoader({
  children,
  loading = false,
  loadingText = 'Processando...',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    danger: 'bg-danger hover:bg-danger/90 text-white',
    success: 'bg-success hover:bg-success/90 text-white',
    secondary: 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900',
    ghost: 'hover:bg-neutral-100 text-neutral-700',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 justify-center',
        variants[variant],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      )}
      {loading ? loadingText : children}
    </motion.button>
  );
}
