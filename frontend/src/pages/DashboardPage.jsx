import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import KpiCard from '../components/common/KpiCard'
import TicketStatistics from '../components/TicketStatistics'
import { PageLoader } from '../components/common/Loader'
import { StatutBadge, PrioriteBadge } from '../components/common/Badges'
import { motion } from 'framer-motion'
import { Ticket, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getSousCategorieName } from '../utils/sousCategories'

export default function DashboardPage() {
  const { user, isRole } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const formatTicketDate = (dateCreation, heureCreation) => {
    if (!dateCreation) return '—'
    const dateOnly = dateCreation.split('T')[0].split(' ')[0]
    return heureCreation
      ? new Date(`${dateOnly}T${heureCreation}`).toLocaleString('fr-FR')
      : new Date(dateOnly).toLocaleDateString('fr-FR')
  }

  const isTicketOverdue = (ticket) => {
    if (!ticket) return false
    if (!['ouvert', 'en_cours', 'en_cour', 'en_attente'].includes(ticket.statut)) return false

    let referenceDate = null
    if (['en_cours', 'en_cour'].includes(ticket.statut) && ticket.date_en_cours) {
      referenceDate = ticket.date_en_cours
    } else if (ticket.statut === 'en_attente' && ticket.date_en_attente) {
      referenceDate = ticket.date_en_attente
    } else if (ticket.date_ouverture) {
      referenceDate = ticket.date_ouverture
    } else if (ticket.date_ouvert) {
      referenceDate = ticket.date_ouvert
    } else if (ticket.date_creation) {
      referenceDate = ticket.date_creation
    }

    if (!referenceDate) return false
    const openedAt = new Date(referenceDate)
    return (Date.now() - openedAt.getTime()) >= 48 * 60 * 60 * 1000
  }

  if (isRole('admin')) {
    return <Navigate to="/admin" replace />
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = '/tickets/statistiques'
        const [statsRes, ticketsRes, subCategoriesRes] = await Promise.all([
          api.get(endpoint),
          api.get('/tickets?per_page=5'),
          api.get('/sous-categories'),
        ])
        setStats(statsRes.data)
        setRecentTickets(ticketsRes.data.data || [])
        setSubCategories(subCategoriesRes.data || [])
      } catch { }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <PageLoader />

  const kpis = [
    { icon: Ticket, label: 'Total tickets', value: stats?.total, color: 'bg-primary-500', delay: 0 },
    { icon: Clock, label: 'En cours', value: stats?.en_cours, color: 'bg-yellow-500', delay: 0.1 },
    { icon: CheckCircle, label: 'Résolus / Validés', value: (stats?.resolu || 0) + (stats?.valide || 0), color: 'bg-green-500', delay: 0.2 },
    { icon: AlertTriangle, label: 'Critiques', value: stats?.critique, color: 'bg-red-500', delay: 0.3 },
  ]

  if (isRole('admin')) {
    kpis.push({ icon: Users, label: 'Utilisateurs', value: stats?.total_utilisateurs, color: 'bg-indigo-500', delay: 0.4 })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Bonjour, <span className="text-primary-500">{user?.nom?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Voici un aperçu de l'activité des tickets.</p>
      </div>



      {/* Advanced Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-base font-bold text-gray-900 mb-5">Statistiques détaillées</h2>
        <TicketStatistics />
      </motion.div>

      {/* Recent tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Tickets récents</h2>
          <button onClick={() => navigate('/tickets')} className="text-sm text-primary-500 hover:text-primary-600 font-semibold transition-colors">
            Voir tout →
          </button>
        </div>
        {recentTickets.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Aucun ticket pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Objet</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sous-catégorie</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Priorité</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t, i) => {
                  const overdueAlert = isRole('traiteur') && isTicketOverdue(t)
                  return (
                    <motion.tr
                      key={t.id_ticket}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className={`border-b border-gray-50 hover:bg-primary-50/30 cursor-pointer transition-colors ${overdueAlert ? 'bg-red-50/70' : ''}`}
                      onClick={() => navigate(`/tickets/${t.id_ticket}`)}
                    >
                      <td className="py-3 px-3 font-bold text-primary-500">#{t.id_ticket}</td>
                      <td className="py-3 px-3 font-medium text-gray-900 max-w-xs truncate">{t.objet_ticket}</td>
                      <td className="py-3 px-3 text-sm text-gray-700 whitespace-nowrap">{t.categorie?.nom || '—'}</td>
                      <td className="py-3 px-3 text-sm text-gray-700 whitespace-nowrap">{getSousCategorieName(t.sousCategorie, t.id_sous_categorie, subCategories)}</td>
                      <td className="py-3 px-3"><PrioriteBadge priorite={t.priorite} /></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <StatutBadge statut={t.statut} />
                          {overdueAlert && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase bg-red-100 text-red-700">
                              +48h
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400">{formatTicketDate(t.date_creation, t.heure_creation)}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
