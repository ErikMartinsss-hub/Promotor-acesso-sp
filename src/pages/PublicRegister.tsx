import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getNetworks, getBrands, addPromoter } from '../lib/firestore'
import type { Network, Brand, PromoterType } from '../types'
import { VISIT_DAYS } from '../types'
import { QRCodeCanvas } from 'qrcode.react'
import { UserPlus, CheckCircle } from 'lucide-react'
import logo from '../assets/logo.png'

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
  return result
}

export default function PublicRegister() {
  const navigate = useNavigate()
  const [networks, setNetworks] = useState<Network[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [step, setStep] = useState<'form' | 'qr'>('form')
  const [promoterId, setPromoterId] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'promoter' as PromoterType,
    brandId: '',
    networkId: '',
    supervisorPhone: '',
    visitDays: [] as string[],
  })

  useEffect(() => {
    Promise.all([getNetworks(), getBrands()]).then(([n, b]) => {
      setNetworks(n.filter(x => x.active))
      setBrands(b.filter(x => x.active))
    })
  }, [])

  const toggleDay = (day: string) => {
    setForm(p => ({
      ...p,
      visitDays: p.visitDays.includes(day)
        ? p.visitDays.filter(d => d !== day)
        : [...p.visitDays, day],
    }))
  }

  const handleRegister = async () => {
    setError('')
    if (!form.name.trim() || !form.cpf.trim() || !form.brandId || !form.networkId || !form.phone) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (form.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setSaving(true)
    try {
      const email = form.email || `cpf${form.cpf.replace(/\D/g, '')}@acessopromotor.app`
      const userCred = await createUserWithEmailAndPassword(auth, email, form.password)
      const token = generateToken()
      const brand = brands.find(b => b.id === form.brandId)
      const network = networks.find(n => n.id === form.networkId)

      const docRef = await addPromoter({
        name: form.name.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone,
        email,
        uid: userCred.user.uid,
        type: form.type,
        brandId: form.brandId,
        brandName: brand?.name || '',
        networkId: form.networkId,
        networkName: network?.name || '',
        supervisorPhone: form.type === 'supervisor' ? '' : form.supervisorPhone,
        visitDays: form.type === 'supervisor' ? [] : form.visitDays,
        qrToken: token,
        active: true,
        createdBy: 'self',
      })

      setPromoterId(docRef.id)
      setQrToken(token)
      setStep('qr')
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este CPF/email já possui cadastro. Faça login.')
      } else {
        setError(err.message || 'Erro ao cadastrar.')
      }
    }
    setSaving(false)
  }

  const entryUrl = `${window.location.origin}/entry/${promoterId}?token=${qrToken}`

  if (step === 'qr') {
    return (
      <div className="min-h-screen bg-[#0f171e] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle size={20} className="text-[#10B981]" />
            <h1 className="text-xl font-black">Cadastro Realizado!</h1>
          </div>
          <p className="text-[#8197a4] text-sm font-bold mb-6">
            Mostre este QR code na portaria para registrar sua entrada
          </p>

          <div className="bg-white rounded-2xl p-4 inline-block mb-4 shadow-xl">
            <QRCodeCanvas value={entryUrl} size={240} bgColor="#ffffff" fgColor="#000000" />
          </div>

          <p className="text-[#5a6a78] text-xs font-bold mb-6 break-all px-4">{entryUrl}</p>

          <button
            onClick={() => navigate('/promoter-login')}
            className="block w-full bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold py-3 rounded-lg text-sm transition-all mb-3"
          >
            Acessar Meu QR Code
          </button>
          <Link to="/" className="block text-[#8197a4] hover:text-white text-xs font-bold transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f171e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <img src={logo} alt="AccessPromo" className="h-12 mx-auto mb-2" />
          <p className="text-[#8197a4] text-sm font-bold">Cadastro</p>
        </div>

        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 space-y-3">
          {/* Tipo de cadastro */}
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">TIPO DE CADASTRO</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm(p => ({ ...p, type: 'promoter' }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${form.type === 'promoter' ? 'bg-[#00A8E1] text-white' : 'bg-[#2a3a48] text-[#8197a4] hover:text-white'}`}>
                Promotor
              </button>
              <button type="button" onClick={() => setForm(p => ({ ...p, type: 'supervisor' }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${form.type === 'supervisor' ? 'bg-[#00A8E1] text-white' : 'bg-[#2a3a48] text-[#8197a4] hover:text-white'}`}>
                Supervisor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">NOME *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Seu nome completo" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">CPF *</label>
              <input value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">TELEFONE *</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">EMAIL</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">REDE *</label>
              <select value={form.networkId} onChange={e => setForm(p => ({ ...p, networkId: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white">
                <option value="">Selecione...</option>
                {networks.map(n => (<option key={n.id} value={n.id}>{n.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">MARCA *</label>
              <select value={form.brandId} onChange={e => setForm(p => ({ ...p, brandId: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white">
                <option value="">Selecione...</option>
                {brands.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
            </div>
          </div>

          {/* Supervisor phone - only for promoters */}
          {form.type === 'promoter' && (
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">TELEFONE DO SUPERVISOR</label>
              <input value={form.supervisorPhone} onChange={e => setForm(p => ({ ...p, supervisorPhone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
            </div>
          )}

          {/* Visit days - only for promoters */}
          {form.type === 'promoter' && (
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">DIAS DE VISITA</label>
              <div className="flex flex-wrap gap-2">
                {VISIT_DAYS.map(d => (
                  <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.visitDays.includes(d.value) ? 'bg-[#00A8E1] text-white' : 'bg-[#2a3a48] text-[#8197a4] hover:text-white'}`}>
                    {d.label.split('-')[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">SENHA *</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">CONFIRMAR SENHA *</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repita a senha" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <UserPlus size={16} />}
            {saving ? 'CADASTRANDO...' : 'CRIAR CADASTRO'}
          </button>

          <p className="text-center text-[10px] text-[#8197a4] font-bold">
            Já tem cadastro?{' '}
            <Link to="/promoter-login" className="text-[#00A8E1] hover:text-white transition-colors">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
