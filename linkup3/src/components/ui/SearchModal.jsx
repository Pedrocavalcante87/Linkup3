import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, Bell, User, TrendingUp, DollarSign, Settings, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Dados de busca (simulando um índice de busca)
  const searchData = [
    // Dashboard
    { id: 1, title: 'Dashboard', description: 'Visão geral e métricas principais', path: '/', icon: TrendingUp, category: 'Página' },
    { id: 2, title: 'Receita Total', description: 'R$ 847.392 este mês', path: '/', icon: DollarSign, category: 'Métrica' },
    
    // Financeiro
    { id: 3, title: 'Financeiro', description: 'Controle financeiro e faturamento', path: '/financeiro', icon: DollarSign, category: 'Página' },
    { id: 4, title: 'Receita Mensal', description: 'Gráfico de evolução financeira', path: '/financeiro', icon: TrendingUp, category: 'Relatório' },
    
    // Operacional
    { id: 5, title: 'Operacional', description: 'Gestão operacional e produtividade', path: '/operacional', icon: Settings, category: 'Página' },
    { id: 6, title: 'Tickets Abertos', description: '23 chamados aguardando resposta', path: '/tickets', icon: FileText, category: 'Métrica' },
    
    // Notificações
    { id: 7, title: 'Notificações', description: 'Central de notificações do sistema', path: '/notificacoes', icon: Bell, category: 'Página' },
    { id: 8, title: 'Notificações Não Lidas', description: '8 novas notificações', path: '/notificacoes', icon: Bell, category: 'Métrica' },
    
    // Tickets
    { id: 9, title: 'Tickets', description: 'Sistema de suporte e chamados', path: '/tickets', icon: FileText, category: 'Página' },
    { id: 10, title: 'Abrir Chamado', description: 'Criar novo ticket de suporte', path: '/tickets', icon: FileText, category: 'Ação' },
    
    // Logs
    { id: 11, title: 'Logs do Sistema', description: 'Auditoria e histórico de ações', path: '/logs', icon: Clock, category: 'Página' },
    
    // Integrações
    { id: 12, title: 'Integrações', description: 'APIs e webhooks conectados', path: '/integracoes', icon: Settings, category: 'Página' },
    
    // Perfil
    { id: 13, title: 'Meu Perfil', description: 'Configurações da conta', path: '/perfil', icon: User, category: 'Página' },
    { id: 14, title: 'Preferências', description: 'Personalizar notificações', path: '/perfil', icon: Settings, category: 'Configuração' },
  ]

  // Filtrar resultados baseado na busca
  const results = query.trim() === '' 
    ? searchData.slice(0, 5) // Mostrar sugestões iniciais
    : searchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )

  // Auto-focus quando abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Resetar índice quando query muda
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (item) => {
    navigate(item.path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-title"
        >
          {/* Header com Input */}
          <div className="flex items-center gap-3 p-4 border-b border-neutral-200">
            <Search className="w-5 h-5 text-neutral-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar páginas, métricas, ações..."
              className="flex-1 text-base outline-none text-neutral-900 placeholder:text-neutral-400"
              aria-label="Campo de busca"
              id="search-title"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
              aria-label="Fechar busca"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resultados */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                {query.trim() === '' && (
                  <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Sugestões
                  </div>
                )}
                {results.map((item, index) => {
                  const Icon = item.icon
                  const isSelected = index === selectedIndex
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-left ${
                        isSelected 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'hover:bg-neutral-50 text-neutral-900'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary-100' : 'bg-neutral-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-neutral-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{item.description}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-primary-600' : 'text-neutral-400'
                      }`} />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-1">Nenhum resultado encontrado</h3>
                <p className="text-sm text-neutral-500">Tente buscar por outro termo</p>
              </div>
            )}
          </div>

          {/* Footer com atalhos */}
          <div className="border-t border-neutral-200 px-4 py-3 bg-neutral-50">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded text-neutral-700 font-medium">↑↓</kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded text-neutral-700 font-medium">Enter</kbd>
                  Abrir
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded text-neutral-700 font-medium">Esc</kbd>
                  Fechar
                </span>
              </div>
              <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
