import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List } from 'lucide-react'

/**
 * Componente de mini-índice lateral para navegação rápida em páginas longas
 * Mostra seções registradas via usePageMap e permite scroll suave
 * 
 * @param {Array} sections - Array de seções { id, title, offsetTop }
 */
export default function PageMap({ sections = [] }) {
  const [activeSection, setActiveSection] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  // Detectar seção ativa baseado no scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      const active = sections.reduce((acc, section) => {
        if (scrollPosition >= section.offsetTop) {
          return section.id
        }
        return acc
      }, sections[0]?.id)

      setActiveSection(active)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  // Mostrar/esconder em telas pequenas
  useEffect(() => {
    const checkVisibility = () => {
      setIsVisible(window.innerWidth >= 1280) // xl breakpoint
    }

    checkVisibility()
    window.addEventListener('resize', checkVisibility)
    return () => window.removeEventListener('resize', checkVisibility)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for topbar
      const targetPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  }

  const hasContent = useMemo(() => sections.length > 0, [sections.length])

  if (!hasContent || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed right-6 top-32 w-48 hidden xl:block"
        role="navigation"
        aria-label="Índice da página"
      >
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
            <List className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
              Nesta página
            </h3>
          </div>

          <nav>
            <ul className="space-y-1.5">
              {sections.map((section) => {
                const isActive = activeSection === section.id

                return (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`
                        w-full text-left text-sm py-1.5 px-2 rounded transition-all
                        ${isActive 
                          ? 'bg-primary-50 text-primary-700 font-medium border-l-2 border-primary-600 pl-2' 
                          : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 border-l-2 border-transparent'
                        }
                      `}
                      aria-current={isActive ? 'location' : undefined}
                    >
                      {section.title}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
