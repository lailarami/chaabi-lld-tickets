import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Ticket, CheckCircle, BarChart3, Users, ArrowRight,
  Clock, Shield, FileText, Zap, ChevronRight
} from 'lucide-react'

const features = [
  { icon: Ticket,      title: 'Création de tickets',        desc: 'Déclarez vos incidents en quelques secondes avec notre interface intuitive.' },
  { icon: Zap,         title: 'Affectation automatique',     desc: 'Les tickets sont assignés automatiquement aux techniciens disponibles.' },
  { icon: CheckCircle, title: 'Validation qualité',          desc: 'Un processus de validation garantit la qualité de chaque résolution.' },
  { icon: FileText,    title: 'Rapports automatiques',       desc: 'Génération automatique de rapports à chaque clôture de ticket.' },
]

const importances = [
  { icon: Clock,   title: 'Réduction des délais',    desc: 'Priorisation intelligente et suivi en temps réel pour des résolutions rapides.' },
  { icon: Shield,  title: 'Traçabilité complète',    desc: 'Historique complet de chaque incident pour audit et amélioration continue.' },
  { icon: BarChart3, title: 'Suivi des incidents',   desc: 'Tableau de bord avec KPIs pour mesurer la performance du support IT.' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://media.licdn.com/dms/image/v2/C4E0BAQEdZucFTq6rnQ/company-logo_200_200/company-logo_200_200/0/1659966418672/chaabi_lld_logo?e=2147483647&v=beta&t=HUmay73LpMs7XV1R5ez7K9CJ-iZu8cDz6ytswVIxO-o" alt="Chaabi LLD" className="h-14 object-contain"
              onError={e => { e.target.style.display = 'none' }} />
            <span className="font-bold text-orange-500">Chaabi Lld</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-sm"
          >
            Se connecter <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50/40 to-orange-50/20 py-24">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-100/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-primary-100">
              <Ticket size={13} /> Système IT Interne
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Système de Gestion<br />
            <span className="text-primary-500">des Tickets</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Cette application permet de gérer efficacement les incidents techniques au sein de Chaabi LLD, en assurant un suivi rapide, une résolution optimisée et une amélioration continue de la qualité de service.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-200"
            >
              Se connecter <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Importance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Pourquoi c'est important</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">Bénéfices clés</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {importances.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <item.icon size={24} className="text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Fonctionnalités</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">Tout ce dont vous avez besoin</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={21} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="text-3xl font-extrabold text-white mb-4">Prêt à commencer ?</h2>
            <p className="text-primary-100 mb-8 text-lg">Connectez-vous pour accéder à votre espace de gestion des tickets.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-primary-500 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg inline-flex items-center gap-2 text-base"
            >
              Se connecter <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-6 text-center">
        <p className="text-gray-400 text-sm">
          © 2026 <span className="text-primary-400 font-semibold">Chaabi LLD</span> — Système de Gestion des Tickets IT. Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
