import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Ticket, PlusCircle, Users, Settings,
  LogOut, FileText, Shield, X, History, BarChart3, CheckSquare
} from 'lucide-react'

const LOGO = 'https://media.licdn.com/dms/image/v2/C4E0BAQEdZucFTq6rnQ/company-logo_200_200/company-logo_200_200/0/1659966418672/chaabi_lld_logo?e=2147483647&v=beta&t=HUmay73LpMs7XV1R5ez7K9CJ-iZu8cDz6ytswVIxO-o'

export default function Sidebar({ onClose }) {
  const { user, logout, isRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin', icon: Settings, label: 'Administration', roles: ['admin'] },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['user', 'traiteur', 'validateur'] },
    { to: '/tickets/nouveau', icon: PlusCircle, label: 'Nouveau ticket', roles: ['user', 'traiteur'] },
    { to: '/tickets', icon: Ticket, label: 'Mes tickets', roles: ['user'] },
    { to: '/tickets', icon: Ticket, label: 'Tickets assignés', roles: ['traiteur'] },
    { to: '/historique', icon: History, label: 'Historique', roles: ['traiteur'] },
    { to: '/rapports', icon: FileText, label: 'Rapports', roles: ['traiteur'] },
    { to: '/demandes-achat/validation', icon: CheckSquare, label: 'Déclaration niveau 2', roles: ['validateur'] },
    { to: '/contrats', icon: FileText, label: 'Contrats', roles: ['traiteur', 'admin'] },
    { to: '/tickets', icon: Ticket, label: 'Toutes les tickets', roles: ['validateur'] },
    { to: '/tickets', icon: Ticket, label: 'Tous les tickets', roles: ['admin'] },
  ]

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="https://media.licdn.com/dms/image/v2/C4E0BAQEdZucFTq6rnQ/company-logo_200_200/company-logo_200_200/0/1659966418672/chaabi_lld_logo?e=2147483647&v=beta&t=HUmay73LpMs7XV1R5ez7K9CJ-iZu8cDz6ytswVIxO-o" alt="Chaabi LLD" className="h-12 object-contain" onError={e => { e.target.style.display = 'none' }} />
          <span className="font-bold text-orange-500">Chaabi LLD</span>
        </div>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* App name */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500">Gestion des Tickets</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item, i) => (
          <motion.div
            key={item.to + item.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <NavLink
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <NavLink to="/profil" className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
            {user?.nom?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.nom}</p>
            <p className="text-xs text-primary-500 font-medium capitalize">{user?.role}</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </div>
  )
}
