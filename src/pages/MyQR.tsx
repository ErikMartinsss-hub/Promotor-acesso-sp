import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getPromoterByUid, getVisitsByPromoter } from '../lib/firestore'
import type { Promoter, Visit } from '../types'
import { QRCodeCanvas } from 'qrcode.react'
import { LogOut, Clock, CheckCircle } from 'lucide-react'

export default function MyQR() {
  const navigate = useNavigate()
  const [promoter, setPromoter] = useState<Promoter | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/promoter-login')
        return
      }
      try {
        const p = await getPromoterByUid(user.uid)
        if (!p) {
          await signOut(auth)
          navigate('/promoter-login')
          return
        }
        setPromoter(p)
        const v = await getVisitsByPromoter(p.id)
        setVisits(v.slice(0, 5))
      } catch {}
      setLoading(false)
    })
    return unsub
  }, [navigate])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/promoter-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!promoter) return null

  const entryUrl = `${window.location.origin}/entry/${promoter.id}?token=${promoter.qrToken}`
  const today = new Date().toISOString().split('T')[0]
  const todayVisit = visits.find(v => v.date === today)

  return (
    <div className="min-h-screen bg-[#0f171e] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#1a242f]/90 backdrop-blur-md border-b border-[#2a3a48] px-4 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black">ACESSO<span className="text-[#00A8E1]">PROMOTOR</span></h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[#ff4d4d] hover:text-red-300 text-xs font-bold transition-colors"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          {/* Status today */}
          {todayVisit && (
            <div className={`flex items-center justify-center gap-2 mb-4 text-xs font-bold px-4 py-2 rounded-lg ${
              todayVisit.status === 'active'
                ? 'bg-[#10B981]/20 text-[#10B981]'
                : 'bg-[#5a6a78]/20 text-[#5a6a78]'
            }`}>
              <CheckCircle size={14} />
              {todayVisit.status === 'active'
                ? `Você está na loja desde ${new Date(todayVisit.entryTime).toLocaleTimeString('pt-BR')}`
                : 'Você ainda não registrou entrada hoje'}
            </div>
          )}

          <h2 className="text-lg font-black mb-1">{promoter.name}</h2>
          <p className="text-[#8197a4] text-sm font-bold mb-6">
            {promoter.brandName} • {promoter.networkName}
          </p>

          {/* QR code */}
          <div className="bg-white rounded-2xl p-4 inline-block mb-4 shadow-xl">
            <QRCodeCanvas value={entryUrl} size={260} bgColor="#ffffff" fgColor="#000000" />
          </div>

          <p className="text-[#5a6a78] text-[10px] font-bold mb-6">
            Mostre este QR code na portaria para registrar sua entrada
          </p>

          {/* Recent visits */}
          {visits.length > 0 && (
            <div className="text-left bg-[#1a242f] border border-[#2a3a48] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={12} className="text-[#00A8E1]" />
                <h3 className="text-white font-black text-[10px] tracking-wider">ÚLTIMAS VISITAS</h3>
              </div>
              <div className="space-y-2">
                {visits.map(v => (
                  <div key={v.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#8197a4] font-bold">
                      {new Date(v.entryTime).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[#10B981] font-bold">
                      {new Date(v.entryTime).toLocaleTimeString('pt-BR')}
                    </span>
                    <span className={v.exitTime ? 'text-[#ff4d4d] font-bold' : 'text-[#00A8E1] font-bold'}>
                      {v.exitTime ? new Date(v.exitTime).toLocaleTimeString('pt-BR') : 'Na loja'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
