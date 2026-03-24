// ============================================================================
// THEME CONTEXT - FASE D4
// Gerencia tema global (dark/light) com persistência em localStorage
// ============================================================================

import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'linkup_theme_v1'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light')

  // Inicializar tema ao montar
  useEffect(() => {
    // Tentar carregar do localStorage
    const savedTheme = localStorage.getItem(STORAGE_KEY)
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      setThemeState(initialTheme)
      document.documentElement.setAttribute('data-theme', initialTheme)
      localStorage.setItem(STORAGE_KEY, initialTheme)
    }
  }, [])

  // Função para alterar tema
  function setTheme(newTheme) {
    if (newTheme !== 'light' && newTheme !== 'dark') return
    
    setThemeState(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }

  // Função para alternar tema
  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
