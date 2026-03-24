/**
 * FASE D6.5 - Gerenciamento de Sessões e Segurança
 * Controla expiração, inatividade e sessões simultâneas
 */

class SessionManager {
  constructor() {
    this.SESSION_DURATION = 30 * 60 * 1000 // 30 minutos
    this.WARNING_TIME = 2 * 60 * 1000 // 2 minutos antes
    this.sessionToken = null
    this.sessionId = null
    this.lastActivity = Date.now()
    this.inactivityTimer = null
    this.warningTimer = null
    this.onExpireCallback = null
    this.onWarningCallback = null
    this.loadSession()
  }

  // Carregar sessão do localStorage
  loadSession() {
    try {
      const stored = localStorage.getItem('linkup_session_token')
      if (stored) {
        const session = JSON.parse(stored)
        const now = Date.now()
        
        // Verificar se sessão ainda é válida
        if (session.expiresAt > now) {
          this.sessionToken = session.token
          this.sessionId = session.sessionId
          this.lastActivity = session.lastActivity || now
          return true
        } else {
          // Sessão expirada
          this.clearSession()
          return false
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar sessão:', e)
    }
    return false
  }

  // Criar nova sessão
  createSession(userData) {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const token = `token-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const now = Date.now()
    
    this.sessionId = sessionId
    this.sessionToken = token
    this.lastActivity = now

    const sessionData = {
      sessionId,
      token,
      user: userData,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.SESSION_DURATION
    }

    localStorage.setItem('linkup_session_token', JSON.stringify(sessionData))
    
    // Verificar se há outra sessão ativa
    this.checkSimultaneousSession(sessionId)
    
    // Iniciar monitoramento de inatividade
    this.startInactivityMonitoring()

    return { sessionId, token }
  }

  // Atualizar atividade
  updateActivity() {
    const now = Date.now()
    this.lastActivity = now

    try {
      const stored = localStorage.getItem('linkup_session_token')
      if (stored) {
        const session = JSON.parse(stored)
        session.lastActivity = now
        session.expiresAt = now + this.SESSION_DURATION
        localStorage.setItem('linkup_session_token', JSON.stringify(session))
      }
    } catch (e) {
      console.warn('Erro ao atualizar atividade:', e)
    }

    // Resetar timers
    this.resetInactivityTimers()
  }

  // Iniciar monitoramento de inatividade
  startInactivityMonitoring() {
    // Limpar timers anteriores
    this.resetInactivityTimers()

    // Timer de aviso (30min - 2min = 28min)
    this.warningTimer = setTimeout(() => {
      if (this.onWarningCallback) {
        this.onWarningCallback()
      }
    }, this.SESSION_DURATION - this.WARNING_TIME)

    // Timer de expiração (30min)
    this.inactivityTimer = setTimeout(() => {
      this.expireSession()
    }, this.SESSION_DURATION)

    // Listeners de atividade
    this.attachActivityListeners()
  }

  // Resetar timers
  resetInactivityTimers() {
    if (this.warningTimer) clearTimeout(this.warningTimer)
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer)
  }

  // Anexar listeners de atividade
  attachActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity)
    })
  }

  // Handler de atividade
  handleActivity = () => {
    this.updateActivity()
  }

  // Verificar sessão simultânea
  checkSimultaneousSession(currentSessionId) {
    // Simular detecção de sessão em outro dispositivo
    // Em produção, isso seria verificado no servidor
    
    const STORAGE_KEY = 'linkup_active_session_id'
    const stored = localStorage.getItem(STORAGE_KEY)
    
    if (stored && stored !== currentSessionId) {
      // Outra sessão detectada
      console.warn('Sessão simultânea detectada')
      // Em produção, dispararia callback para notificar usuário
    }
    
    localStorage.setItem(STORAGE_KEY, currentSessionId)
  }

  // Expirar sessão
  expireSession() {
    this.clearSession()
    if (this.onExpireCallback) {
      this.onExpireCallback()
    }
  }

  // Limpar sessão
  clearSession() {
    this.sessionToken = null
    this.sessionId = null
    this.lastActivity = null
    this.resetInactivityTimers()
    localStorage.removeItem('linkup_session_token')
    localStorage.removeItem('linkup_active_session_id')
  }

  // Validar token
  validateToken(token) {
    if (!token || !this.sessionToken) return false
    return token === this.sessionToken
  }

  // Verificar se sessão está ativa
  isSessionActive() {
    if (!this.sessionToken) return false

    try {
      const stored = localStorage.getItem('linkup_session_token')
      if (stored) {
        const session = JSON.parse(stored)
        return session.expiresAt > Date.now()
      }
    } catch (e) {
      console.warn('Erro ao verificar sessão:', e)
    }

    return false
  }

  // Obter dados da sessão
  getSessionData() {
    try {
      const stored = localStorage.getItem('linkup_session_token')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Erro ao obter dados da sessão:', e)
    }
    return null
  }

  // Renovar sessão
  renewSession() {
    const sessionData = this.getSessionData()
    if (sessionData) {
      const now = Date.now()
      sessionData.lastActivity = now
      sessionData.expiresAt = now + this.SESSION_DURATION
      localStorage.setItem('linkup_session_token', JSON.stringify(sessionData))
      this.resetInactivityTimers()
      this.startInactivityMonitoring()
      return true
    }
    return false
  }

  // Callbacks
  onSessionExpire(callback) {
    this.onExpireCallback = callback
  }

  onSessionWarning(callback) {
    this.onWarningCallback = callback
  }

  // Destruir (cleanup)
  destroy() {
    this.resetInactivityTimers()
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity)
    })
  }
}

// Singleton
export const sessionManager = new SessionManager()

export default sessionManager
