import { useNavigate } from 'react-router-dom'
import { Shield, QrCode } from 'lucide-react'
import logo from '../assets/logo.png'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0f171e] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <img src={logo} alt="AccessPromo" className="h-16 mx-auto mb-3" />
        <p className="text-[#8197a4] text-sm font-bold">Controle de Acesso</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={() => navigate('/promoter-login')}
          className="w-full bg-[#1a242f] border border-[#2a3a48] hover:border-[#00A8E1]/50 rounded-2xl p-6 text-center transition-all group"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#00A8E1]/15 flex items-center justify-center group-hover:bg-[#00A8E1]/25 transition-colors">
            <QrCode size={28} className="text-[#00A8E1]" />
          </div>
          <h2 className="text-white font-black text-lg mb-1">Promotor / Supervisor</h2>
          <p className="text-[#8197a4] text-xs font-bold">Acessar meu QR Code</p>
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-[#1a242f] border border-[#2a3a48] hover:border-[#00A8E1]/50 rounded-2xl p-6 text-center transition-all group"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#8B5CF6]/15 flex items-center justify-center group-hover:bg-[#8B5CF6]/25 transition-colors">
            <Shield size={28} className="text-[#8B5CF6]" />
          </div>
          <h2 className="text-white font-black text-lg mb-1">Administrador</h2>
          <p className="text-[#8197a4] text-xs font-bold">Gestão do sistema</p>
        </button>
      </div>

      <p className="mt-12 text-[10px] text-[#3a4a58] font-black tracking-widest">
        AccessPromo © {new Date().getFullYear()}
      </p>
    </div>
  )
}
