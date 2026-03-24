import { useState, useEffect } from 'react'
import { Bell, Search, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SearchModal from '../ui/SearchModal'

export default function Navbar() {
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  // Atalho de teclado Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header 
      className="lg:ml-64 h-16 bg-white border-b border-neutral-200 flex items-center px-4 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-30" 
      style={{boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}
    >
      <h2 className="text-sm lg:text-base font-semibold text-neutral-900 truncate">
        Hub Plural — Unidade Recife
      </h2>
      
      <div className="ml-auto flex items-center gap-2 lg:gap-4">
        {/* Search Button */}
        <div className="relative group">
          <button 
            onClick={() => setShowSearch(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Buscar (Ctrl+K)"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>
          {/* Tooltip com atalho */}
          <div className="hidden lg:block absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            <div className="bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Buscar <kbd className="ml-1 px-1.5 py-0.5 bg-neutral-700 rounded text-[10px]">Ctrl K</kbd>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/notificacoes')}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Notificações (há novas)"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" aria-hidden="true"></span>
        </button>
        
        <div className="hidden lg:block h-6 w-px bg-neutral-200" aria-hidden="true"></div>
        
        <button 
          onClick={() => navigate('/perfil')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Acessar perfil"
        >
          <User className="w-5 h-5" aria-hidden="true" />
        </button>
        
        <button 
          onClick={handleLogout}
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-red-50 hover:text-danger transition-colors focus:outline-none focus:ring-2 focus:ring-danger"
          aria-label="Sair do sistema"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
        </button>
        
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div 
            className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm"
            aria-hidden="true"
          >
            P
          </div>
          <span className="text-sm font-medium text-neutral-700">Pedro (Admin)</span>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  )
}
