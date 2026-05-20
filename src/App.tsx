import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Promoters from './pages/Promoters'
import RegisterPromoter from './pages/RegisterPromoter'
import PromoterDetail from './pages/PromoterDetail'
import Entry from './pages/Entry'
import Visits from './pages/Visits'
import Networks from './pages/Networks'
import Brands from './pages/Brands'
import Users from './pages/Users'
import PublicRegister from './pages/PublicRegister'
import PromoterLogin from './pages/PromoterLogin'
import MyQR from './pages/MyQR'
import Landing from './pages/Landing'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root - tela inicial */}
          <Route path="/" element={<Landing />} />

          {/* Public routes */}
          <Route path="/register" element={<PublicRegister />} />
          <Route path="/promoter-login" element={<PromoterLogin />} />
          <Route path="/my-qr" element={<MyQR />} />

          {/* Admin routes */}
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entry" element={<Entry />} />
            <Route path="/entry/:id" element={<Entry />} />
            <Route path="/promoters" element={<Promoters />} />
            <Route path="/promoters/new" element={<RegisterPromoter />} />
            <Route path="/promoters/:id" element={<PromoterDetail />} />
            <Route path="/visits" element={<Visits />} />
            <Route path="/networks" element={<Networks />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/users" element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
