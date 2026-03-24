import { useState, useCallback, useRef } from 'react'

/**
 * Hook para gerenciar seções de uma página no PageMap
 * Permite que componentes registrem suas seções para navegação rápida
 * 
 * @example
 * const { registerSection, unregisterSection, getSections } = usePageMap()
 * 
 * useEffect(() => {
 *   registerSection({ id: 'kpis', title: 'KPIs', offsetTop: sectionRef.current.offsetTop })
 *   return () => unregisterSection('kpis')
 * }, [])
 */
export default function usePageMap() {
  const [sections, setSections] = useState([])
  const sectionsRef = useRef(new Map())

  const registerSection = useCallback(({ id, title, offsetTop }) => {
    sectionsRef.current.set(id, { id, title, offsetTop })
    setSections(Array.from(sectionsRef.current.values()).sort((a, b) => a.offsetTop - b.offsetTop))
  }, [])

  const unregisterSection = useCallback((id) => {
    sectionsRef.current.delete(id)
    setSections(Array.from(sectionsRef.current.values()).sort((a, b) => a.offsetTop - b.offsetTop))
  }, [])

  const getSections = useCallback(() => {
    return sections
  }, [sections])

  const updateSectionOffsets = useCallback(() => {
    const updated = Array.from(sectionsRef.current.values()).map(section => {
      const element = document.getElementById(section.id)
      if (element) {
        return { ...section, offsetTop: element.offsetTop }
      }
      return section
    })
    sectionsRef.current = new Map(updated.map(s => [s.id, s]))
    setSections(updated.sort((a, b) => a.offsetTop - b.offsetTop))
  }, [])

  return {
    registerSection,
    unregisterSection,
    getSections,
    updateSectionOffsets,
    sections
  }
}
