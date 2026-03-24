// ============================================================================
// THEME SWITCHER - FASE D4
// Botão para alternar entre tema Light/Dark
// ============================================================================

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="
        relative p-2 rounded-lg
        text-neutral-600 hover:text-neutral-900
        hover:bg-neutral-100
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-colors
      "
      style={{
        color: 'var(--color-text-secondary)',
        backgroundColor: 'transparent'
      }}
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Tema atual: ${theme === 'light' ? 'Claro' : 'Escuro'}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Sun className="w-5 h-5" aria-hidden="true" />
        )}
      </motion.div>
    </motion.button>
  )
}
