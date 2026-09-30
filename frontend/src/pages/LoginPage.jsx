import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Bienvenue, ${user.nom} !`)
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        err.message ||
        'Identifiants incorrects.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-primary-500 flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Decor */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />


        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Gestion des<br />Tickets IT
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed mb-8">
            Plateforme interne de gestion des incidents techniques — Banque Chaabi LLD.
          </p>
          {[
            'Suivi en temps réel des tickets',
            'Affectation automatique des traiteurs',
            'Validation et rapports automatisés',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-primary-50 text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-primary-200 text-xs relative">© 2026 Chaabi LLD. Tous droits réservés.</p>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-8">
            <ArrowLeft size={16} /> Retour à l'accueil
          </button>

          <div className="lg:hidden mb-8">

          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Connexion</h1>
            <p className="text-gray-500 text-sm">Accédez à votre espace de gestion des tickets.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pl-10 pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
