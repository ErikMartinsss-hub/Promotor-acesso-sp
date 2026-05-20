import { useState, useEffect } from 'react'
import { getVisitsByDate, getPromotersByNetwork, getPromoters } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'
import type { Visit, Promoter } from '../types'
import { Clock, UserCheck, Users, ArrowRightFromLine } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [promoters, setPromoters] = useState<Promoter[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [visitsData, promotersData] = await Promise.all([
          getVisitsByDate(today),
          isAdmin ? getPromoters() : profile?.networkId ? getPromotersByNetwork(profile.networkId) : Promise.resolve([]),
        ])

        const filtered = isAdmin
          ? visitsData
          : visitsData.filter(v => v.networkId === profile?.networkId)

        setVisits(filtered)
        setPromoters(promotersData)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [today, isAdmin, profile?.networkId])

  const activeVisits = visits.filter(v => v.status === 'active')
  const completedToday = visits.filter(v => v.status === 'completed')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-black mb-1">Dashboard</h1>
      <p className="text-[#8197a4] text-sm font-bold mb-6">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#8197a4] text-[10px] font-black tracking-widest">EM LOJA</p>
            <div className="w-8 h-8 rounded-lg bg-[#00A8E1]/15 flex items-center justify-center">
              <UserCheck size={16} className="text-[#00A8E1]" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{activeVisits.length}</p>
          <p className="text-[10px] text-[#5a6a78] font-bold">promotores na loja agora</p>
        </div>

        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#8197a4] text-[10px] font-black tracking-widest">ENTRADAS HOJE</p>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
              <ArrowRightFromLine size={16} className="text-[#10B981]" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{visits.length}</p>
          <p className="text-[10px] text-[#5a6a78] font-bold">registros hoje</p>
        </div>

        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#8197a4] text-[10px] font-black tracking-widest">SAÍDAS HOJE</p>
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center">
              <Users size={16} className="text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{completedToday.length}</p>
          <p className="text-[10px] text-[#5a6a78] font-bold">finalizados hoje</p>
        </div>

        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#8197a4] text-[10px] font-black tracking-widest">PROMOTORES</p>
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center">
              <Users size={16} className="text-[#8B5CF6]" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{promoters.length}</p>
          <p className="text-[10px] text-[#5a6a78] font-bold">cadastrados</p>
        </div>
      </div>

      {/* Active visits */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-[#00A8E1]" />
          <h2 className="text-white font-black text-xs tracking-wider">EM LOJA AGORA</h2>
        </div>
        {activeVisits.length === 0 ? (
          <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl p-8 text-center">
            <p className="text-[#5a6a78] text-sm font-bold">Nenhum promotor na loja no momento.</p>
          </div>
        ) : (
          <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a3a48] text-[10px] text-[#8197a4] font-black tracking-widest">
                    <th className="text-left px-4 py-3">NOME</th>
                    <th className="text-left px-4 py-3">CPF</th>
                    <th className="text-left px-4 py-3">MARCA</th>
                    <th className="text-left px-4 py-3">ENTRADA</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVisits.map(v => (
                    <tr key={v.id} className="border-b border-[#2a3a48]/50 hover:bg-[#2a3a48]/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{v.promoterName}</td>
                      <td className="px-4 py-3 text-[#8197a4]">{v.promoterCpf}</td>
                      <td className="px-4 py-3 text-[#8197a4]">{v.brandName}</td>
                      <td className="px-4 py-3">
                        <span className="text-[#10B981] text-xs font-bold">
                          {new Date(v.entryTime).toLocaleTimeString('pt-BR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
