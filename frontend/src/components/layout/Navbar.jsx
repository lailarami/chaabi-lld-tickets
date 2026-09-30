import { Menu, Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LOGO = 'https://media.licdn.com/dms/image/v2/C4E0BAQEdZucFTq6rnQ/company-logo_200_200/company-logo_200_200/0/1659966418672/chaabi_lld_logo?e=2147483647&v=beta&t=HUmay73LpMs7XV1R5ez7K9CJ-iZu8cDz6ytswVIxO-o'

const ROLE_LABELS = {
  user: 'Utilisateur',
  traiteur: 'Traiteur',
  validateur: 'Validateur',
  admin: 'Administrateur',
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 z-10 flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-gray-500 hover:text-primary-500 transition-colors p-1.5 rounded-lg hover:bg-primary-50"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
          <img src={LOGO} alt="Chaabi LLD" className="h-12 object-contain" />
          <div>
            <span className="font-semibold text-gray-900 block">Chaabi LLD</span>
            <span className="text-xs text-gray-400">Système de Gestion des Tickets</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
            {user?.nom?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.nom}</p>
            <p className="text-xs text-primary-500 font-medium capitalize leading-tight">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
