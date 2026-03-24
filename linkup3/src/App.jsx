import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import { OnboardingProvider } from './onboarding/OnboardingProvider'
import { ThemeProvider } from './contexts/ThemeContext'
import { SyncProvider } from './contexts/SyncContext'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/topbar/Topbar'
import Breadcrumbs from './components/layout/Breadcrumbs'
import PageMap from './components/layout/PageMap'
import PageContainer from './components/layout/PageContainer'
import PageTransition from './components/layout/PageTransition'
import ProtectedRoute from './components/auth/ProtectedRoute'
import usePageMap from './hooks/usePageMap'
import LoaderPage from './components/ui/LoaderPage'

// Carregar sistema de testes globais (FASE RECOVERY)
import './utils/testActions'
// Inicializar dados fake no localStorage (FASE RECOVERY)
import './utils/fakeData'

// Páginas não lazy-loaded (rotas críticas)
import Login from './pages/Login/Login'
import RecoverPassword from './pages/RecoverPassword/RecoverPassword'

// Lazy loading de páginas pesadas (D5.1)
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Prioridades = lazy(() => import('./pages/Prioridades/Prioridades'))
const Financeiro = lazy(() => import('./pages/Financeiro/Financeiro'))
const Operacional = lazy(() => import('./pages/Operacional/Operacional'))
const Integracoes = lazy(() => import('./pages/Integracoes/Integracoes'))
const Logs = lazy(() => import('./pages/Logs/Logs'))
const Notifications = lazy(() => import('./pages/Notifications/Notifications'))
const Tickets = lazy(() => import('./pages/Tickets/Tickets'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const Automations = lazy(() => import('./pages/Automations/Automations'))
const Lab = lazy(() => import('./pages/Lab/Lab'))

// Usuário logado (lido do JWT)
function parseUserFromToken() {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return { name: 'Usuário', role: 'Viewer' }
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      name: payload.name || payload.email || 'Usuário',
      role: payload.role || 'Viewer'
    }
  } catch {
    return { name: 'Usuário', role: 'Viewer' }
  }
}

const currentUser = parseUserFromToken()

function PageTransitions() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoaderPage />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/recuperar-senha" element={<PageTransition><RecoverPassword /></PageTransition>} />
          <Route path="/" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/prioridades" element={<ProtectedRoute><PageTransition><Prioridades /></PageTransition></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><PageTransition><Financeiro /></PageTransition></ProtectedRoute>} />
          <Route path="/operacional" element={<ProtectedRoute><PageTransition><Operacional /></PageTransition></ProtectedRoute>} />
          <Route path="/integracoes" element={<ProtectedRoute><PageTransition><Integracoes /></PageTransition></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><PageTransition><Logs /></PageTransition></ProtectedRoute>} />
          <Route path="/notificacoes" element={<ProtectedRoute><PageTransition><Notifications /></PageTransition></ProtectedRoute>} />
          <Route path="/chamados" element={<ProtectedRoute><PageTransition><Tickets /></PageTransition></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
          <Route path="/automacoes" element={<ProtectedRoute><PageTransition><Automations /></PageTransition></ProtectedRoute>} />
          <Route path="/lab" element={<ProtectedRoute><PageTransition><Lab /></PageTransition></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sections } = usePageMap()
  const isLoginPage = location.pathname === '/login' || location.pathname === '/recuperar-senha'

  const handleLogout = () => {
    // Limpar autenticação (mock)
    localStorage.removeItem('isAuthenticated')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {!isLoginPage && <Sidebar />}
      {!isLoginPage && <Topbar currentUser={currentUser} onLogout={handleLogout} />}
      {isLoginPage ? (
        <PageTransitions />
      ) : (
        <>
          <PageContainer>
            <Breadcrumbs />
            <PageTransitions />
          </PageContainer>
          <PageMap sections={sections} />
        </>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <SyncProvider>
            <ToastProvider>
              <NotificationsProvider>
                <OnboardingProvider>
                  <AppLayout />
                </OnboardingProvider>
              </NotificationsProvider>
            </ToastProvider>
          </SyncProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
