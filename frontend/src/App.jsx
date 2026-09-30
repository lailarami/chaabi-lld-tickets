import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TicketsPage from './pages/TicketsPage'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketDetailPage from './pages/TicketDetailPage'
import HistoriquePage from './pages/HistoriquePage'
import TicketTimelinePage from './pages/TicketTimelinePage'
import DemandeAchatValidationPage from './pages/DemandeAchatValidationPage'
import RapportsPage from './pages/RapportsPage'
import ContratsPage from './pages/ContratsPage'
import AdminPage from './pages/AdminPage'
import KpiPage from './pages/KpiPage'
import ProfilPage from './pages/ProfilPage'
import AppLayout from './components/layout/AppLayout'

const getDefaultRouteForUser = (user) => {
  if (!user) return '/login'
  if (user.role === 'admin') return '/admin'
  return '/dashboard'
}

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={getDefaultRouteForUser(user)} replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to={getDefaultRouteForUser(user)} replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#F58220', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* Protected */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/nouveau" element={
            <PrivateRoute roles={['user', 'admin', 'traiteur']}><CreateTicketPage /></PrivateRoute>
          } />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/historique" element={
            <PrivateRoute roles={['traiteur', 'admin']}><HistoriquePage /></PrivateRoute>
          } />
          <Route path="/tickets/:id/timeline" element={
            <TicketTimelinePage />
          } />
          <Route path="/demandes-achat/validation" element={
            <PrivateRoute roles={['validateur', 'admin']}><DemandeAchatValidationPage /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}><AdminPage /></PrivateRoute>
          } />
          <Route path="/admin/kpi" element={
            <PrivateRoute roles={['admin']}><KpiPage /></PrivateRoute>
          } />
          <Route path="/rapports" element={
            <PrivateRoute roles={['traiteur']}><RapportsPage /></PrivateRoute>
          } />
          <Route path="/contrats" element={
            <PrivateRoute roles={['traiteur', 'admin']}><ContratsPage /></PrivateRoute>
          } />
          <Route path="/profil" element={<ProfilPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
