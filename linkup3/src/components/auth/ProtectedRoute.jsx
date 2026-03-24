import { Navigate } from 'react-router-dom'

// Verifica se o JWT existe no localStorage.
// A validade real do token é checada pela API — se estiver expirado,
// o api.js intercepta o 401 e redireciona para /login automaticamente.
export default function ProtectedRoute({ children }) {
  const authToken = localStorage.getItem('authToken')

  if (!authToken) {
    return <Navigate to="/login" replace />
  }

  return children
}
