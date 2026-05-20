import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPromoters, getPromotersByNetwork } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'
import type { Promoter } from '../types'
import { Search, QrCode, UserCheck, UserX } from 'lucide-react'

export default function Promoters() {
  const { profile } = useAuth()
  const [promoters, setPromoters] = useState<Promoter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = isAdmin
          ? await getPromoters()
          : profile?.networkId ? await getPromotersByNetwork(profile.networkId) : []
        setPromoters(data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [isAdmin, profile?.networkId])

  const filtered = promoters.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search) ||
    p.brandName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black mb-1">Promotores</h1>
          <p className="text-[#8197a4] text-sm font-bold">{promoters.length} cadastrados</p>
        </div>
        <Link
          to="/promoters/new"
          className="bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold px-4 py-2 rounded-lg text-sm transition-all"
        >
          Novo Promotor
        </Link>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6a78]" size={16} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF ou marca..."
          className="w-full bg-[#1a242f] border border-[#2a3a48] rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 placeholder:text-[#5a6a78]"
        />
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
                  <th className="text-left px-4 py-3">NOME</th>
                  <th className="text-left px-4 py-3">CPF</th>
                  <th className="text-left px-4 py-3">TIPO</th>
                  <th className="text-left px-4 py-3">MARCA</th>
                  <th className="text-left px-4 py-3">REDE</th>
                  <th className="text-left px-4 py-3">TELEFONE</th>
                  <th className="text-left px-4 py-3">STATUS</th>
                  <th className="text-right px-4 py-3">QR</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-[#2a3a48]/50 hover:bg-[#2a3a48]/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/promoters/${p.id}`} className="font-bold text-white hover:text-[#00A8E1] transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#8197a4] font-mono">{p.cpf}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.type === 'supervisor' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-[#00A8E1]/20 text-[#00A8E1]'}`}>
                        {p.type === 'supervisor' ? 'SUPERVISOR' : 'PROMOTOR'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8197a4]">{p.brandName}</td>
                    <td className="px-4 py-3 text-[#8197a4]">{p.networkName}</td>
                    <td className="px-4 py-3 text-[#8197a4]">{p.phone}</td>
                    <td className="px-4 py-3">
                      {p.active ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981]">
                          <UserCheck size={12} /> ATIVO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#ff4d4d]">
                          <UserX size={12} /> INATIVO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/promoters/${p.id}`}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A8E1] hover:text-white transition-colors"
                      >
                        <QrCode size={14} /> QR
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#5a6a78] text-sm font-bold">
                      {search ? 'Nenhum promotor encontrado.' : 'Nenhum promotor cadastrado.'}
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
