import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * LoaderPage - Loader minimalista para lazy loading de páginas
 */
export default function LoaderPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-12 h-12" style={{ color: 'var(--primary)' }} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-sm font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Carregando...
      </motion.p>
    </motion.div>
  );
}
