// ============================================================================
// ASSISTANT WIDGET - FASE D3
// Widget flutuante com sugestões rápidas e atalhos
// ============================================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, X, FileText, AlertTriangle, RefreshCw } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    id: 'action-1',
    label: 'Registrar lançamento',
    description: 'Criar nova movimentação operacional',
    icon: FileText,
    to: '/operacional'
  },
  {
    id: 'action-2',
    label: 'Ver integrações com erro',
    description: 'Verificar status das integrações',
    icon: AlertTriangle,
    to: '/integracoes?filter=error'
  },
  {
    id: 'action-3',
    label: 'Inconsistências do dia',
    description: 'Resolver pendências operacionais',
    icon: RefreshCw,
    to: '/operacional?filter=erros'
  }
]

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  function handleAction(actionPath) {
    navigate(actionPath)
    setIsOpen(false)
    
    // Salvar uso no localStorage
    const usageKey = 'linkup_assistant_usage'
    const currentUsage = JSON.parse(localStorage.getItem(usageKey) || '[]')
    currentUsage.push({
      timestamp: new Date().toISOString(),
      action: actionPath
    })
    localStorage.setItem(usageKey, JSON.stringify(currentUsage.slice(-20))) // Manter últimas 20
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="flex flex-col items-end gap-3">
        {/* Popover com ações rápidas */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-80 overflow-hidden"
              role="dialog"
              aria-label="Assistente rápido"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">Assistente</div>
                    <div className="text-xs text-neutral-600">Atalhos rápidos</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-white/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Fechar assistente"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-3">
                <ul className="space-y-2" role="list">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon
                    return (
                      <li key={action.id}>
                        <button
                          onClick={() => handleAction(action.to)}
                          className="w-full text-left p-3 rounded-lg hover:bg-neutral-50 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-label={action.label}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-primary-100 text-neutral-600 group-hover:text-primary-600 flex items-center justify-center transition-colors">
                              <Icon className="w-5 h-5" aria-hidden="true" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-neutral-900 text-sm">
                                {action.label}
                              </div>
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {action.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 text-center">
                  Dica: Use os atalhos para agilizar seu trabalho
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão flutuante */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl
            transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-300
            ${isOpen
              ? 'bg-neutral-700 text-white rotate-180'
              : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
            }
          `}
          aria-label={isOpen ? 'Fechar assistente' : 'Abrir assistente'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="w-6 h-6" aria-hidden="true" />
          ) : (
            <Lightbulb className="w-6 h-6" aria-hidden="true" />
          )}
        </motion.button>
      </div>
    </div>
  )
}
