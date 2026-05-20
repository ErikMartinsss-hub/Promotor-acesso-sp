import { useState, useEffect } from 'react'
import { getNetworks, addNetwork, updateNetwork, deleteNetwork } from '../lib/firestore'
import type { Network } from '../types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

export default function Networks() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Network | null>(null)
  const [name, setName] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const data = await getNetworks()
      setNetworks(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      if (editing) {
        await updateNetwork(editing.id, { name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-') })
      } else {
        await addNetwork({ name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-'), active: true })
      }
      setShowModal(false)
      setEditing(null)
      setName('')
      fetch()
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta rede?')) return
    try {
      await deleteNetwork(id)
      fetch()
    } catch {}
  }

  const openEdit = (n: Network) => {
    setEditing(n)
    setName(n.name)
    setShowModal(true)
  }

  const openNew = () => {
    setEditing(null)
    setName('')
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black mb-1">Redes</h1>
          <p className="text-[#8197a4] text-sm font-bold">Gerenciar redes de supermercados</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold px-4 py-2 rounded-lg text-sm transition-all"
        >
          <Plus size={16} /> Nova Rede
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-[#00A8E1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#1a242f] border border-[#2a3a48] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a3a48] text-[10px] text-[#8197a4] font-black tracking-widest">
                <th className="text-left px-4 py-3">NOME</th>
                <th className="text-left px-4 py-3">SLUG</th>
                <th className="text-left px-4 py-3">STATUS</th>
                <th className="text-right px-4 py-3">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {networks.map(n => (
                <tr key={n.id} className="border-b border-[#2a3a48]/50 hover:bg-[#2a3a48]/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">{n.name}</td>
                  <td className="px-4 py-3 text-[#8197a4]">{n.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${n.active ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#ff4d4d]/20 text-[#ff4d4d]'}`}>
                      {n.active ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(n)} className="p-1.5 text-[#8197a4] hover:text-white transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 text-[#8197a4] hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {networks.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[#5a6a78] text-sm font-bold">
                    Nenhuma rede cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black text-sm">{editing ? 'Editar Rede' : 'Nova Rede'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8197a4] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1.5">NOME DA REDE</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Mercado Alabarce"
                className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-[#2a3a48] hover:bg-[#3a4a58] text-white font-bold py-2.5 rounded-lg text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold py-2.5 rounded-lg text-sm transition-all">
                {editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
