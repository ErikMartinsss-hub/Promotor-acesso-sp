import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPromoterById, getVisitsByPromoter } from '../lib/firestore'
import { generateResetLink } from '../lib/resetPassword'
import type { Promoter, Visit } from '../types'
import { QRCodeCanvas } from 'qrcode.react'
import { ArrowLeft, Phone, Calendar, Building2, Tag, QrCode, Clock, KeyRound } from 'lucide-react'

export default function PromoterDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [promoter, setPromoter] = useState<Promoter | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [resetLink, setResetLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getPromoterById(id), getVisitsByPromoter(id)])
      .then(([p, v]) => {
        setPromoter(p)
        setVisits(v)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!promoter) {
    return (
      <div className="text-center py-12">
        <p className="text-[#5a6a78] text-sm font-bold">Promotor não encontrado.</p>
      </div>
    )
  }

  const entryUrl = `${window.location.origin}/entry/${promoter.id}?token=${promoter.qrToken}`

  return (
    <div>
      <button onClick={() => navigate('/promoters')} className="flex items-center gap-2 text-[#8197a4] hover:text-white font-bold text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6">
            <h1 className="text-xl font-black mb-1">{promoter.name}</h1>
            <p className="text-[#8197a4] text-sm font-bold mb-4">{promoter.cpf}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00A8E1]/15 flex items-center justify-center">
                  <Phone size={14} className="text-[#00A8E1]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8197a4] font-bold">TELEFONE</p>
                  <p className="text-white text-sm font-bold">{promoter.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center">
                  <Building2 size={14} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8197a4] font-bold">TIPO</p>
                  <p className={`text-sm font-bold ${promoter.type === 'supervisor' ? 'text-[#8B5CF6]' : 'text-[#00A8E1]'}`}>
                    {promoter.type === 'supervisor' ? 'SUPERVISOR' : 'PROMOTOR'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00A8E1]/15 flex items-center justify-center">
                  <Building2 size={14} className="text-[#00A8E1]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8197a4] font-bold">REDE</p>
                  <p className="text-white text-sm font-bold">{promoter.networkName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00A8E1]/15 flex items-center justify-center">
                  <Tag size={14} className="text-[#00A8E1]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8197a4] font-bold">MARCA</p>
                  <p className="text-white text-sm font-bold">{promoter.brandName}</p>
                </div>
              </div>
              {promoter.type !== 'supervisor' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00A8E1]/15 flex items-center justify-center">
                    <Calendar size={14} className="text-[#00A8E1]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8197a4] font-bold">DIAS DE VISITA</p>
                    <p className="text-white text-sm font-bold">
                      {promoter.visitDays.length > 0
                        ? promoter.visitDays.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')
                        : 'Todos'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reset password */}
            <div className="mt-4 pt-4 border-t border-[#2a3a48]">
              <p className="text-[10px] text-[#8197a4] font-bold mb-2">Email usado no login: <span className="text-white">{promoter.email}</span></p>
              {resetLink ? (
                <div className="bg-[#0f171e] rounded-lg p-3 border border-[#2a3a48]">
                  <p className="text-[#10B981] text-xs font-bold mb-2">Link gerado! Copie e envie ao promotor:</p>
                  <p className="text-[10px] text-[#8197a4] break-all mb-2 bg-[#1a242f] rounded p-2 select-all">{resetLink}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(resetLink); setCopied(true) }}
                      className="flex-1 text-[#00A8E1] text-[10px] font-bold hover:text-white transition-colors border border-[#2a3a48] rounded-lg py-2"
                    >
                      {copied ? 'COPIADO!' : 'COPIAR LINK'}
                    </button>
                    <a
                      href={`https://wa.me/${promoter.phone ? '55'+promoter.phone.replace(/\D/g,'') : ''}?text=${encodeURIComponent('Acesse este link para redefinir sua senha do Acesso Promotor: ' + resetLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#1da851] text-white text-[10px] font-bold rounded-lg py-2 transition-colors"
                    >
                      WHATSAPP
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setResetting(true)
                      try {
                        const link = await generateResetLink(promoter.email)
                        setResetLink(link)
                      } catch (e) { alert(e instanceof Error ? e.message : 'Erro ao gerar link de redefinição.') }
                      setResetting(false)
                    }}
                    disabled={resetting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-50"
                  >
                    <KeyRound size={12} />
                    {resetting ? 'GERANDO...' : 'Gerar link de redefinição'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent visits */}
          <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-[#00A8E1]" />
              <h2 className="text-white font-black text-xs tracking-wider">ÚLTIMAS VISITAS</h2>
            </div>
            {visits.length === 0 ? (
              <p className="text-[#5a6a78] text-sm font-bold text-center py-4">Nenhuma visita registrada.</p>
            ) : (
              <div className="space-y-2">
                {visits.slice(0, 10).map(v => (
                  <div key={v.id} className="flex items-center justify-between bg-[#0f171e] rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-bold">{new Date(v.entryTime).toLocaleDateString('pt-BR')}</p>
                      <p className="text-[10px] text-[#8197a4] font-bold">{v.networkName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#10B981] text-xs font-bold">
                        Ent: {new Date(v.entryTime).toLocaleTimeString('pt-BR')}
                      </p>
                      {v.exitTime ? (
                        <p className="text-[#ff4d4d] text-xs font-bold">
                          Sai: {new Date(v.exitTime).toLocaleTimeString('pt-BR')}
                        </p>
                      ) : (
                        <span className="text-[#00A8E1] text-[10px] font-bold">EM LOJA</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div>
          <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 text-center sticky top-6">
            <div className="flex items-center gap-2 justify-center mb-4">
              <QrCode size={14} className="text-[#00A8E1]" />
              <h2 className="text-white font-black text-xs tracking-wider">QR CODE DE ACESSO</h2>
            </div>
            <div className="bg-white rounded-2xl p-4 inline-block mb-4">
              <QRCodeCanvas value={entryUrl} size={200} bgColor="#ffffff" fgColor="#000000" />
            </div>
            <p className="text-[#5a6a78] text-[10px] font-bold break-all mb-2">{entryUrl}</p>
            <button
              onClick={() => navigator.clipboard.writeText(entryUrl)}
              className="text-[#00A8E1] text-xs font-bold hover:text-white transition-colors"
            >
              Copiar link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
