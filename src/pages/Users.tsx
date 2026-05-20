import { useState, useEffect } from 'react'
import { getNetworks, getUsers, addUser, updateUser } from '../lib/firestore'
import type { Network, AppUser } from '../types'
import { Plus, Pencil, X } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'operator' as AppUser['role'], networkId: '' })

  const fetch = async () => {
    setLoading(true)
    try {
      const [u, n] = await Promise.all([getUsers(), getNetworks()])
      setUsers(u.filter(u => u.id))
      setNetworks(n)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    try {
      if (editing) {
        await updateUser(editing.id, { name: form.name, phone: form.phone, role: form.role, networkId: form.networkId })
      } else {
        await addUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          networkId: form.networkId,
          active: true,
        })
      }
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', email: '', phone: '', password: '', role: 'operator', networkId: '' })
      fetch()
    } catch {}
  }

  const openEdit = (u: AppUser) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, phone: u.phone, password: '', role: u.role, networkId: u.networkId })
    setShowModal(true)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', password: '', role: 'operator', networkId: '' })
    setShowModal(true)
  }

  const roleLabel = (r: string) => {
    const labels: Record<string, string> = { admin: 'Admin', manager: 'Gestor', operator: 'Operador' }
    return labels[r] || r
  }

  const roleColor = (r: string) => {
    const colors: Record<string, string> = { admin: 'text-[#ff4d4d] bg-[#ff4d4d]/20', manager: 'text-[#00A8E1] bg-[#00A8E1]/20', operator: 'text-[#10B981] bg-[#10B981]/20' }
    return colors[r] || 'text-[#8197a4] bg-[#8197a4]/20'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black mb-1">Usuários</h1>
          <p className="text-[#8197a4] text-sm font-bold">Gerenciar acesso ao sistema</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#00A8E1] hover:bg-[#0088b3] text-white font-bold px-4 py-2 rounded-lg text-sm transition-all"
        >
          <Plus size={16} /> Novo Usuário
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
                <th className="text-left px-4 py-3">EMAIL</th>
                <th className="text-left px-4 py-3">TELEFONE</th>
                <th className="text-left px-4 py-3">CARGO</th>
                <th className="text-left px-4 py-3">REDE</th>
                <th className="text-right px-4 py-3">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-[#2a3a48]/50 hover:bg-[#2a3a48]/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">{u.name}</td>
                  <td className="px-4 py-3 text-[#8197a4]">{u.email}</td>
                  <td className="px-4 py-3 text-[#8197a4]">{u.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleColor(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8197a4]">{networks.find(n => n.id === u.networkId)?.name || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-[#8197a4] hover:text-white transition-colors">
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#5a6a78] text-sm font-bold">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1a242f] border border-[#2a3a48] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black text-sm">{editing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8197a4] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">NOME</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">EMAIL</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">TELEFONE</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50" />
              </div>
              {!editing && (
                <div>
                  <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">SENHA</label>
                  <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50" />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">CARGO</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as AppUser['role'] }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white">
                  <option value="operator">Operador (Portaria)</option>
                  <option value="manager">Gestor (Rede)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-[#8197a4] tracking-widest block mb-1">REDE</label>
                <select value={form.networkId} onChange={e => setForm(p => ({ ...p, networkId: e.target.value }))} className="w-full bg-[#0f171e] border border-[#2a3a48] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00A8E1]/50 text-white">
                  <option value="">Todas (Admin)</option>
                  {networks.filter(n => n.active).map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
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
