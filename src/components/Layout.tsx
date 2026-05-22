import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, ScanLine, History, Store, Tag, Shield, LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/entry', label: 'Registrar Entrada/Saída', icon: ScanLine },
  { to: '/promoters', label: 'Promotores', icon: Users },
  { to: '/promoters/new', label: 'Novo Promotor', icon: UserPlus },
  { to: '/visits', label: 'Histórico de Visitas', icon: History },
]

const adminItems = [
  { to: '/networks', label: 'Redes', icon: Store },
  { to: '/brands', label: 'Marcas', icon: Tag },
  { to: '/users', label: 'Usuários', icon: Shield },
]

export default function Layout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-[#0f171e] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a242f] border-r border-[#2a3a48] transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#2a3a48]">
          <div>
            <h1 className="text-base font-black tracking-[0.1em]">Acess<span className="text-[#00A8E1]">Promo</span></h1>
            <p className="text-[10px] text-[#8197a4] font-bold">{profile?.name}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#8197a4] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#00A8E1]/15 text-[#00A8E1]'
                    : 'text-[#8197a4] hover:text-white hover:bg-[#2a3a48]'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-[10px] font-black text-[#5a6a78] tracking-widest">ADMIN</p>
              </div>
              {adminItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#00A8E1]/15 text-[#00A8E1]'
                        : 'text-[#8197a4] hover:text-white hover:bg-[#2a3a48]'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-[#ff4d4d] hover:bg-[#ff4d4d]/10 transition-all w-full"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-[#1a242f]/90 backdrop-blur-md border-b border-[#2a3a48] px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-[#8197a4] hover:text-white">
            <Menu size={22} />
          </button>
          <h1 className="text-sm font-black tracking-[0.1em]">Acess<span className="text-[#00A8E1]">Promo</span></h1>
          <div />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
