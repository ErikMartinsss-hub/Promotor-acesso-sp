import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNetworks, getBrands, addPromoter } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'
import type { Network, Brand, PromoterType } from '../types'
import { VISIT_DAYS } from '../types'
import { QRCodeCanvas } from 'qrcode.react'
import { ArrowLeft, QrCode } from 'lucide-react'

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
  return result
}

export default function RegisterPromoter() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [networks, setNetworks] = useState<Network[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [step, setStep] = useState<'form' | 'qr'>('form')
  const [promoterId, setPromoterId] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    type: 'promoter' as PromoterType,
    brandId: '',
    networkId: profile?.networkId || '',
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

  const handleSave = async () => {
    if (!form.name.trim() || !form.cpf.trim() || !form.brandId || !form.networkId) return
    setSaving(true)
    try {
      const token = generateToken()
      const brand = brands.find(b => b.id === form.brandId)
      const network = networks.find(n => n.id === form.networkId)
      const docRef = await addPromoter({
        name: form.name.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone,
        email: form.email,
        type: form.type,
        brandId: form.brandId,
        brandName: brand?.name || '',
        networkId: form.networkId,
        networkName: network?.name || '',
        supervisorPhone: form.type === 'supervisor' ? '' : form.supervisorPhone,
        visitDays: form.type === 'supervisor' ? [] : form.visitDays,
        qrToken: token,
        active: true,
        createdBy: profile?.id || '',
      })
      setPromoterId(docRef.id)
      setQrToken(token)
      setStep('qr')
    } catch {}
    setSaving(false)
  }

  const entryUrl = `${window.location.origin}/entry/${promoterId}?token=${qrToken}`

  if (step === 'qr') {
    return (
      <div>
        <button onClick={() => navigate('/promoters')} className="flex items-center gap-2 text-[#8197a4] hover:text-white font-bold text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="max-w-md mx-auto text-center">
          <h1 className="text-xl font-black mb-2">Promotor Cadastrado!</h1>
          <p className="text-[#8197a4] text-sm font-bold mb-6">
            Escaneie o QR code para registrar entrada/saída
          </p>

          <div className="bg-white rounded-2xl p-6 inline-block mb-6">
            <QRCodeCanvas value={entryUrl} size={220} bgColor="#ffffff" fgColor="#000000" />
          </div>

          <p className="text-[#5a6a78] text-xs font-bold mb-4 break-all">{entryUrl}</p>

          <button
            onClick={() => navigate('/promoters')}
            className="bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all"
          >
            Ver Lista de Promotores
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/promoters')} className="flex items-center gap-2 text-[#8197a4] hover:text-white font-bold text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className="text-xl font-black mb-1">Novo Cadastro</h1>
      <p className="text-[#8197a4] text-sm font-bold mb-6">Cadastre um novo promotor ou supervisor para gerar o QR code de acesso</p>

      <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">NOME COMPLETO *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome do promotor" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
          </div>
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">CPF *</label>
            <input value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
          </div>
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">TELEFONE *</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
          </div>
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">EMAIL</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">REDE *</label>
            <select value={form.networkId} onChange={e => setForm(p => ({ ...p, networkId: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white">
              <option value="">Selecione...</option>
              {networks.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">MARCA *</label>
            <select value={form.brandId} onChange={e => setForm(p => ({ ...p, brandId: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white">
              <option value="">Selecione...</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {form.type === 'promoter' && (
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">TELEFONE DO SUPERVISOR/GESTOR</label>
            <input value={form.supervisorPhone} onChange={e => setForm(p => ({ ...p, supervisorPhone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]" />
          </div>
        )}

        {form.type === 'promoter' && (
          <div>
            <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">DIAS DE VISITA</label>
            <div className="flex flex-wrap gap-2">
              {VISIT_DAYS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    form.visitDays.includes(d.value)
                      ? 'bg-[#00A8E1] text-white'
                      : 'bg-[#2a3a48] text-[#8197a4] hover:text-white'
                  }`}
                >
                  {d.label.split('-')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.cpf || !form.brandId || !form.networkId}
          className="w-full flex items-center justify-center gap-2 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 text-sm mt-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <QrCode size={16} />
          )}
          {saving ? 'SALVANDO...' : 'CADASTRAR E GERAR QR CODE'}
        </button>
      </div>
    </div>
  )
}
