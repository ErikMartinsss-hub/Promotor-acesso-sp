import { useState, useEffect } from 'react'
import { getVisits, getVisitsByNetwork } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'
import type { Visit } from '../types'
import { Search, CheckCircle, XCircle } from 'lucide-react'

export default function Visits() {
  const { profile } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = isAdmin
          ? await getVisits(100)
          : profile?.networkId ? await getVisitsByNetwork(profile.networkId, 100) : []
        setVisits(data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [isAdmin, profile?.networkId])

  const filtered = visits.filter(v => {
    const matchSearch = !search || v.promoterName.toLowerCase().includes(search.toLowerCase()) || v.promoterCpf.includes(search)
    const matchDate = !dateFilter || v.date === dateFilter
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchDate && matchStatus
  })

  return (
    <div>
      <h1 className="text-xl font-black mb-1">Histórico de Visitas</h1>
      <p className="text-[#8197a4] text-sm font-bold mb-6">Registro de entradas e saídas</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6a78]" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou CPF..."
            className="w-full bg-[#1a242f] border border-[#2a3a48] rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="bg-[#1a242f] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-[#1a242f] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white"
        >
          <option value="all">Todos</option>
          <option value="active">Em Loja</option>
          <option value="completed">Finalizados</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3a48] text-[10px] text-[#8197a4] font-black tracking-widest">
                  <th className="text-left px-4 py-3">PROMOTOR</th>
                  <th className="text-left px-4 py-3">CPF</th>
                  <th className="text-left px-4 py-3">MARCA</th>
                  <th className="text-left px-4 py-3">REDE</th>
                  <th className="text-left px-4 py-3">DATA</th>
                  <th className="text-left px-4 py-3">ENTRADA</th>
                  <th className="text-left px-4 py-3">SAÍDA</th>
                  <th className="text-left px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-[#2a3a48]/50 hover:bg-[#2a3a48]/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{v.promoterName}</td>
                    <td className="px-4 py-3 text-[#8197a4] font-mono">{v.promoterCpf}</td>
                    <td className="px-4 py-3 text-[#8197a4]">{v.brandName}</td>
                    <td className="px-4 py-3 text-[#8197a4]">{v.networkName}</td>
                    <td className="px-4 py-3 text-[#8197a4]">{new Date(v.entryTime).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-[#10B981] text-xs font-bold">
                      {new Date(v.entryTime).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      {v.exitTime ? (
                        <span className="text-[#ff4d4d] text-xs font-bold">
                          {new Date(v.exitTime).toLocaleTimeString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-[#00A8E1] text-[10px] font-bold">---</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {v.status === 'active' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981]">
                          <CheckCircle size={12} /> EM LOJA
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#5a6a78]">
                          <XCircle size={12} /> FINALIZADO
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#5a6a78] text-sm font-bold">
                      Nenhuma visita encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
