import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8197a4] text-sm font-bold">CARREGANDO...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
