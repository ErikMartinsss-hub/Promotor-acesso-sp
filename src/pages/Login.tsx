import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, Eye, EyeOff, KeyRound } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f171e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-1">
            ACESSO<span className="text-[#00A8E1]">PROMOTOR</span>
          </h1>
          <p className="text-[#8197a4] text-sm font-bold">Controle de Acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 transition-all placeholder:text-[#5a6a78]"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">SENHA</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 transition-all placeholder:text-[#5a6a78] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a6a78] hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {resetSent && (
            <p className="text-[#10B981] text-xs font-bold bg-[#10B981]/10 rounded-lg px-3 py-2">
              Email de redefinição enviado! Verifique sua caixa de entrada e spam.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!email) { setError('Digite seu email primeiro.'); return }
              try {
                await sendPasswordResetEmail(auth, email)
                setResetSent(true)
                setError('')
              } catch { setError('Erro ao enviar email de redefinição.') }
            }}
            className="w-full flex items-center justify-center gap-2 text-[#8197a4] hover:text-white text-xs font-bold py-2 transition-colors"
          >
            <KeyRound size={12} /> Esqueceu a senha?
          </button>
        </form>

        <p className="text-center mt-6 text-[10px] text-[#3a4a58] font-black tracking-widest">
          ACESSO PROMOTOR © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
