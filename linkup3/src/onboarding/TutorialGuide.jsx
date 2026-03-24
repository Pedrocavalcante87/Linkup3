// ============================================================================
// TUTORIAL GUIDE - FASE D3
// Modal com tour guiado de 3 passos para novos usuários
// ============================================================================

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'

const STORAGE_KEY = 'linkup_tutorial_seen'

const TUTORIAL_STEPS = [
  {
    id: 'step-1',
    title: 'Visão Geral do Dashboard',
    text: 'Aqui você encontra os principais indicadores (KPIs), notificações em tempo real e atalhos rápidos para as funcionalidades mais usadas.'
  },
  {
    id: 'step-2',
    title: 'Módulo Financeiro',
    text: 'Acesse faturas, análise de inadimplência, relatórios de pagamento e acompanhe a saúde financeira das suas empresas integradas.'
  },
  {
    id: 'step-3',
    title: 'Sistema de Chamados',
    text: 'Abra tickets de suporte, acompanhe o status das solicitações e mantenha histórico completo de atendimento.'
  }
]

export default function TutorialGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)

  // Verificar se já viu o tutorial
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (seen) {
      setHasSeenTutorial(true)
    }
  }, [])

  function startTour() {
    setIsOpen(true)
    setCurrentStep(0)
    localStorage.setItem(STORAGE_KEY, 'true')
    setHasSeenTutorial(true)
  }

  function closeTour() {
    setIsOpen(false)
    setCurrentStep(0)
  }

  function nextStep() {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      closeTour()
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  function resetTour() {
    localStorage.removeItem(STORAGE_KEY)
    setHasSeenTutorial(false)
    setIsOpen(false)
    setCurrentStep(0)
  }

  const currentStepData = TUTORIAL_STEPS[currentStep]

  return (
    <>
      {/* Botão flutuante para iniciar tour (só aparece se ainda não viu) */}
      {!hasSeenTutorial && !isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <button
            onClick={startTour}
            className="flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Iniciar tutorial guiado"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">Iniciar Tour</span>
          </button>
        </motion.div>
      )}

      {/* Modal do Tutorial */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeTour}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tutorial-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div>
                  <h3 id="tutorial-title" className="text-xl font-semibold text-neutral-900">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Passo {currentStep + 1} de {TUTORIAL_STEPS.length}
                  </p>
                </div>
                <button
                  onClick={closeTour}
                  className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  aria-label="Fechar tutorial"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-neutral-700 leading-relaxed">
                  {currentStepData.text}
                </p>
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center gap-2 px-6 pb-4">
                {TUTORIAL_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary-600'
                        : 'w-2 bg-neutral-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 bg-neutral-50 border-t border-neutral-200">
                <div className="flex gap-2">
                  <button
                    onClick={closeTour}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={resetTour}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  >
                    Reiniciar depois
                  </button>
                </div>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={previousStep}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      Anterior
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    {currentStep < TUTORIAL_STEPS.length - 1 ? (
                      <>
                        Próximo
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    ) : (
                      'Concluir'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
