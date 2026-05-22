import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getPromoterByCpf } from '../lib/firestore'
import { LogIn, Eye, EyeOff, MessageSquare } from 'lucide-react'
import logo from '../assets/logo.png'

export default function PromoterLogin() {
  const navigate = useNavigate()
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleLogin = async () => {
    setError('')
    const cleaned = cpf.replace(/\D/g, '')
    if (cleaned.length !== 11) {
      setError('Digite um CPF válido.')
      return
    }
    if (!password) {
      setError('Digite sua senha.')
      return
    }

    setLoading(true)
    try {
      const promoter = await getPromoterByCpf(cleaned)
      if (!promoter) {
        setError('CPF não encontrado. Faça seu cadastro primeiro.')
        setLoading(false)
        return
      }
      await signInWithEmailAndPassword(auth, promoter.email, password)
      navigate('/my-qr')
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('CPF ou senha incorretos.')
      } else {
        setError(err.message || 'Erro ao fazer login.')
      }
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    setError('')
    setResetSent(false)
    const cleaned = cpf.replace(/\D/g, '')
    if (cleaned.length !== 11) {
      setError('Digite seu CPF primeiro.')
      return
    }
    setResetting(true)
    try {
      const res = await fetch(`/api/send-reset-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleaned }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro')
      if (data.link) {
        // Redireciona direto pra página de redefinição do Firebase
        window.location.href = data.link
      } else {
        setResetSent(true)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro'
      if (msg.includes('não encontrado')) {
        setError('CPF não encontrado. Faça seu cadastro primeiro.')
      } else {
        setError('Erro ao recuperar senha. Tente novamente.')
      }
    }
    setResetting(false)
  }

  return (
    <div className="min-h-screen bg-[#0f171e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="AccessPromo" className="h-12 mx-auto mb-2" />
          <p className="text-[#8197a4] text-sm font-bold">Login do Promotor</p>
        </div>

        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">CPF</label>
            <input
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
                className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78] pr-10"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
              Link de redefinição enviado por SMS! Verifique seu celular.
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <LogIn size={16} />}
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resetting}
            className="w-full flex items-center justify-center gap-2 text-[#8197a4] hover:text-white text-xs font-bold py-1 transition-colors"
          >
            <MessageSquare size={12} /> {resetting ? 'ENVIANDO SMS...' : 'Esqueceu a senha? Recuperar via SMS'}
          </button>

          <p className="text-center text-[10px] text-[#8197a4] font-bold">
            Não tem cadastro?{' '}
            <Link to="/register" className="text-[#00A8E1] hover:text-white transition-colors">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
