import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { User, Mail, Shield, LogOut, Edit2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const ROLE_LABELS = {
  user: 'Utilisateur',
  traiteur: 'Traiteur',
  validateur: 'Validateur',
  admin: 'Administrateur',
}

const ROLE_COLORS = {
  user: 'bg-blue-100 text-blue-700',
  traiteur: 'bg-yellow-100 text-yellow-700',
  validateur: 'bg-green-100 text-green-700',
  admin: 'bg-primary-100 text-primary-700',
}

const LOGO = 'https://media.licdn.com/dms/image/v2/C4E0BAQEdZucFTq6rnQ/company-logo_200_200/company-logo_200_200/0/1659966418672/chaabi_lld_logo?e=2147483647&v=beta&t=HUmay73LpMs7XV1R5ez7K9CJ-iZu8cDz6ytswVIxO-o'

export default function ProfilPage() {
  const { user, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({ password: '' })
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setProfileForm({ password: '' })
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnexion réussie.')
    navigate('/login')
  }

  const handleSaveProfile = async () => {
    if (!profileForm.password.trim()) {
      toast.error('Veuillez entrer un nouveau mot de passe.')
      return
    }
    setSaving(true)
    try {
      const payload = { 
        email: user?.email,
        password: profileForm.password.trim() 
      }
      const { data } = await api.put('/auth/me', payload)
      updateUser(data)
      toast.success('Profil mis à jour.')
      setIsEditing(false)
      setProfileForm(prev => ({ ...prev, password: '' }))
    } catch (err) {
      // Gestion des erreurs de validation
      const errorData = err.response?.data
      let errorMsg = 'Impossible de mettre à jour le profil.'
      
      if (errorData?.errors) {
        // Si le backend retourne des erreurs de validation
        errorMsg = Object.values(errorData.errors)[0] || errorMsg
      } else if (errorData?.message) {
        errorMsg = errorData.message
      }
      
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-extrabold text-3xl shadow-md">
            {user?.nom?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">{user?.nom}</h1>
            <span className={`badge text-sm ${ROLE_COLORS[user?.role] || 'bg-gray-100 text-gray-600'}`}>
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
          <button
            onClick={() => setIsEditing(prev => !prev)}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <Edit2 size={16} />
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input
                type="password"
                className="input"
                value={profileForm.password}
                onChange={e => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary flex-1 justify-center"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 space-y-3 text-left">
          {[
            { icon: User,   label: 'Nom complet', value: user?.nom },
            { icon: Mail,   label: 'Adresse email', value: user?.email },
            { icon: Shield, label: 'Rôle', value: ROLE_LABELS[user?.role] || user?.role },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={17} className="text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-5 border-t border-gray-100">
          <img src={LOGO} alt="Chaabi LLD" className="h-8 object-contain mx-auto mb-4"
            onError={e => { e.target.style.display='none' }} />
          <button onClick={handleLogout} className="btn-danger w-full justify-center">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </motion.div>
    </div>
  )
}
