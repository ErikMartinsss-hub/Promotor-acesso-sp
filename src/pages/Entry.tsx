import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getPromoterById, getPromoterByCpf, getActiveVisit, registerEntry, registerExit } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'
import { Scanner } from '@yudiel/react-qr-scanner'
import type { Promoter } from '../types'
import { ScanLine, Search, UserCheck, LogOut, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

export default function Entry() {
  const { profile } = useAuth()
  const { id: paramId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'scanner' | 'cpf'>('scanner')
  const [cpf, setCpf] = useState('')
  const [promoter, setPromoter] = useState<Promoter | null>(null)
  const [activeVisit, setActiveVisit] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // If navigated from QR code scan
  useEffect(() => {
    if (paramId) {
      const token = searchParams.get('token')
      loadPromoter(paramId, token || undefined)
    }
  }, [paramId])

  const loadPromoter = async (promoterId: string, token?: string) => {
    setLoading(true)
    setMessage(null)
    try {
      const p = await getPromoterById(promoterId)
      if (!p || !p.active) {
        setMessage({ type: 'error', text: 'Promotor não encontrado ou inativo.' })
        setLoading(false)
        return
      }
      if (token && p.qrToken !== token) {
        setMessage({ type: 'error', text: 'QR code inválido!' })
        setLoading(false)
        return
      }
      setPromoter(p)
      const active = await getActiveVisit(promoterId)
      setActiveVisit(active)
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar promotor.' })
    }
    setLoading(false)
  }

  const handleCpfSearch = async () => {
    const cleaned = cpf.replace(/\D/g, '')
    if (cleaned.length !== 11) {
      setMessage({ type: 'error', text: 'CPF inválido. Digite 11 dígitos.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const p = await getPromoterByCpf(cleaned)
      if (!p || !p.active) {
        setMessage({ type: 'error', text: 'Promotor não encontrado ou inativo.' })
        setLoading(false)
        return
      }
      setPromoter(p)
      const active = await getActiveVisit(p.id)
      setActiveVisit(active)
    } catch {
      setMessage({ type: 'error', text: 'Erro ao buscar promotor.' })
    }
    setLoading(false)
  }

  const handleEntry = async () => {
    if (!promoter) return
    setLoading(true)
    setMessage(null)
    try {
      await registerEntry({
        promoterId: promoter.id,
        promoterName: promoter.name,
        promoterCpf: promoter.cpf,
        brandName: promoter.brandName,
        networkId: promoter.networkId,
        networkName: promoter.networkName,
        date: new Date().toISOString().split('T')[0],
        entryTime: Date.now(),
        exitTime: null,
        status: 'active',
        registeredBy: profile?.id || '',
        closedBy: null,
      })
      setMessage({ type: 'success', text: `Entrada registrada! ${promoter.name} está na loja.` })
      setActiveVisit({ id: 'temp' })
    } catch {
      setMessage({ type: 'error', text: 'Erro ao registrar entrada.' })
    }
    setLoading(false)
  }

  const handleExit = async () => {
    if (!promoter || !activeVisit) return
    setLoading(true)
    setMessage(null)
    try {
      await registerExit(activeVisit.id, Date.now(), profile?.id || '')
      setMessage({ type: 'success', text: `Saída registrada! ${promoter.name} saiu da loja.` })
      setActiveVisit(null)
    } catch {
      setMessage({ type: 'error', text: 'Erro ao registrar saída.' })
    }
    setLoading(false)
  }

  const handleScan = (result: string) => {
    try {
      const url = new URL(result)
      const pathParts = url.pathname.split('/')
      const id = pathParts[pathParts.length - 1]
      const token = url.searchParams.get('token')
      if (id) {
        loadPromoter(id, token || undefined)
      }
    } catch {
      // If just a text value
      loadPromoter(result)
    }
  }

  const reset = () => {
    setPromoter(null)
    setActiveVisit(null)
    setMessage(null)
    setCpf('')
  }

  // Promoter identified, show entry/exit action
  if (promoter) {
    return (
      <div className="max-w-md mx-auto">
        <button onClick={reset} className="flex items-center gap-2 text-[#8197a4] hover:text-white font-bold text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Novo registro
        </button>

        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00A8E1]/20 flex items-center justify-center">
            {activeVisit ? <LogOut size={28} className="text-[#F59E0B]" /> : <UserCheck size={28} className="text-[#10B981]" />}
          </div>

          <h2 className="text-xl font-black mb-1">{promoter.name}</h2>
          <p className="text-[#8197a4] text-sm font-bold mb-1">{promoter.cpf}</p>
          <p className="text-[#8197a4] text-xs mb-4">
            {promoter.brandName} • {promoter.networkName}
          </p>

          {message && (
            <div className={`flex items-center gap-2 justify-center mb-4 text-xs font-bold px-3 py-2 rounded-lg ${
              message.type === 'success' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#ff4d4d]/20 text-[#ff4d4d]'
            }`}>
              {message.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {message.text}
            </div>
          )}

          <button
            onClick={activeVisit ? handleExit : handleEntry}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 text-sm ${
              activeVisit
                ? 'bg-[#F59E0B] hover:bg-[#D48A0A]'
                : 'bg-[#10B981] hover:bg-[#0D9668]'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : activeVisit ? (
              <LogOut size={16} />
            ) : (
              <UserCheck size={16} />
            )}
            {loading ? 'AGUARDE...' : activeVisit ? 'REGISTRAR SAÍDA' : 'REGISTRAR ENTRADA'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-black mb-1">Registrar Entrada/Saída</h1>
      <p className="text-[#8197a4] text-sm font-bold mb-6">Identifique o promotor para registrar o acesso</p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('scanner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'scanner' ? 'bg-[#00A8E1] text-white' : 'bg-[#1a242f] text-[#8197a4] hover:text-white'
          }`}
        >
          <ScanLine size={16} /> QR Code
        </button>
        <button
          onClick={() => setMode('cpf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'cpf' ? 'bg-[#00A8E1] text-white' : 'bg-[#1a242f] text-[#8197a4] hover:text-white'
          }`}
        >
          <Search size={16} /> CPF
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 mb-4 text-xs font-bold px-3 py-2 rounded-lg ${
          message.type === 'success' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#ff4d4d]/20 text-[#ff4d4d]'
        }`}>
          {message.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {message.text}
        </div>
      )}

      {mode === 'scanner' ? (
        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-4">
          <p className="text-[#8197a4] text-xs font-bold mb-3 text-center">Posicione o QR code na câmera</p>
          <div className="aspect-square max-w-sm mx-auto overflow-hidden rounded-xl bg-black">
            <Scanner
              onScan={(result) => {
                if (result?.[0]?.rawValue) handleScan(result[0].rawValue)
              }}
              styles={{ container: { width: '100%', height: '100%' } }}
              components={{}}
            />
          </div>
        </div>
      ) : (
        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6">
          <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">DIGITE O CPF</label>
          <div className="flex gap-2">
            <input
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="flex-1 bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]"
              onKeyDown={e => e.key === 'Enter' && handleCpfSearch()}
            />
            <button
              onClick={handleCpfSearch}
              disabled={loading || cpf.replace(/\D/g, '').length !== 11}
              className="bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
