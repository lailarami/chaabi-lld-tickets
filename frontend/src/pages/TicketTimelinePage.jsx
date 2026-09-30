import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { PageLoader } from '../components/common/Loader'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function TicketTimelinePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isRole } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [historique, setHistorique] = useState([])
  const [emails, setEmails] = useState([])
  const [demandes, setDemandes] = useState([])

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/tickets/${id}`)
      setTicket(data)

      // Récupérer l'historique des actions
      const historiques = data.ticketHistoriques || data.ticket_historiques
      if (historiques) {
        setHistorique(historiques.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      }

      // Récupérer les emails envoyés
      const emailLogs = data.emailLogs || data.email_logs
      if (emailLogs) {
        setEmails(emailLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      }

      // Récupérer les demandes d'achat
      const demandeAchats = data.demandeAchats || data.demande_achats
      if (demandeAchats) {
        setDemandes(demandeAchats.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'historique.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />
  if (!ticket) return null

  // Fusionner tous les événements dans une timeline selon le rôle
  const events = [
    ...historique.map(h => ({ type: 'action', data: h, date: h.created_at })),
    ...(isRole('traiteur', 'admin') ? emails.map(e => ({ type: 'email', data: e, date: e.created_at })) : []),
    ...(isRole('traiteur', 'admin') ? demandes.map(d => ({ type: 'demande', data: d, date: d.created_at })) : [])
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const getEventIcon = (type) => {
    switch (type) {
      case 'action':
        return <CheckCircle size={20} className="text-blue-500" />
      case 'email':
        return <Mail size={20} className="text-green-500" />
      case 'demande':
        return <AlertCircle size={20} className="text-orange-500" />
      default:
        return <FileText size={20} className="text-gray-500" />
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateTime = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const STATUT_COLORS = {
    ouvert: 'bg-blue-100 text-blue-800',
    en_cours: 'bg-yellow-100 text-yellow-800',
    en_attente: 'bg-orange-100 text-orange-800',
    cloture: 'bg-green-100 text-green-800',
    confirmation: 'bg-indigo-100 text-indigo-800',
  }

  const parseCreatedAt = () => {
    if (ticket.date_creation && ticket.heure_creation) {
      return new Date(`${ticket.date_creation.split('T')[0].split(' ')[0]}T${ticket.heure_creation}`)
    }
    return ticket.date_creation ? new Date(ticket.date_creation) : null
  }

  const getActionDate = (ticket, actions) => {
    const history = ticket.ticketHistoriques || ticket.ticket_historiques || []
    const normalizedActions = actions.map(action => action.toLowerCase().trim())

    const historyItem = history
      .slice()
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .find(item => {
        const actionText = (item.action || '').toString().toLowerCase().trim()
        return normalizedActions.some(search => actionText.includes(search))
      })

    if (!historyItem || !historyItem.created_at) return null
    return new Date(historyItem.created_at)
  }

  const calculateStatusDates = () => {
    const statusDates = {}

    statusDates.ouvert = {
      startDate: parseCreatedAt()
    }

    if (ticket.date_en_cours) {
      statusDates.en_cours = { startDate: new Date(ticket.date_en_cours) }
    } else {
      const priseEnCharge = getActionDate(ticket, ['pris en charge', 'en cours', 'prise en charge'])
      if (priseEnCharge) {
        statusDates.en_cours = { startDate: priseEnCharge }
      }
    }

    if (ticket.date_en_attente) {
      statusDates.en_attente = { startDate: new Date(ticket.date_en_attente) }
    } else {
      const miseEnAttente = getActionDate(ticket, ['mis en attente', 'marqué en attente', 'en attente'])
      if (miseEnAttente) {
        statusDates.en_attente = { startDate: miseEnAttente }
      }
    }

    const clotureDate = getActionDate(ticket, ['clôtur', 'resolu', 'résolu', 'clos', 'fermé'])
    if (clotureDate) {
      statusDates.cloture = { startDate: clotureDate }
    } else if (ticket.date_cloture) {
      statusDates.cloture = { startDate: new Date(ticket.date_cloture) }
    }

    // Support for second open/close (réouverture / reclôture)
    if (ticket.date_ouverture_2) {
      statusDates.reouverture = { startDate: new Date(ticket.date_ouverture_2) }
    }

    if (ticket.date_cloture_2) {
      statusDates.recloture = { startDate: new Date(ticket.date_cloture_2) }
    }

    if (ticket.date_confirmation_utilisateur) {
      statusDates.confirmation = { startDate: new Date(ticket.date_confirmation_utilisateur) }
    } else {
      const confirmationDate = getActionDate(ticket, ['confirm', 'confirmé', 'confirmée'])
      if (confirmationDate) {
        statusDates.confirmation = { startDate: confirmationDate }
      }
    }

    return statusDates
  }

  const statusDates = calculateStatusDates()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
        </div>

        {/* Info ticket */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ticket #{ticket.id_ticket}</h1>
              <p className="text-gray-600 mt-1">{ticket.objet_ticket}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${STATUT_COLORS[ticket.statut] || 'bg-gray-100 text-gray-800'}`}>
              {ticket.statut?.toUpperCase().replace('_', ' ')}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Catégorie</p>
              <p className="font-semibold text-gray-900">{ticket.categorie?.nom}</p>
            </div>
            <div>
              <p className="text-gray-600">Priorité</p>
              <p className="font-semibold text-gray-900">{ticket.priorite}</p>
            </div>
            <div>
              <p className="text-gray-600">Demandeur</p>
              <p className="font-semibold text-gray-900">{ticket.utilisateur?.nom}</p>
            </div>
            <div>
              <p className="text-gray-600">Créé le</p>
              <p className="font-semibold text-gray-900">{new Date(ticket.date_creation).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </motion.div>

        {/* Résumé des durées de statuts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Date et heure par statut</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(statusDates).map(([statut, status]) => (
              <div
                key={statut}
                className={`rounded-lg p-4 ${STATUT_COLORS[statut] || 'bg-gray-100 text-gray-800'}`}
              >
                <p className="text-xs font-semibold opacity-80 mb-1">
                  {statut === 'ouvert' ? 'Créé / Ouvert' :
                    statut === 'en_cours' ? 'Pris en charge' :
                      statut === 'en_attente' ? 'Mis en attente' :
                        statut === 'cloture' ? 'Clôturé' :
                          statut === 'reouverture' ? 'Réouvert' :
                            statut === 'recloture' ? 'Reclôturé' :
                              statut === 'confirmation' ? 'Confirmé par le créateur' : statut}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDateTime(status.startDate)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique des événements</h2>

          {events.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">Aucun événement pour ce ticket.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 p-6">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {event.type === 'action' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{event.data.action}</h3>
                            <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                          </div>
                          {event.data.commentaire && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-2">
                              {event.data.commentaire}
                            </p>
                          )}
                        </div>
                      )}

                      {event.type === 'email' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Mail size={16} /> Email Envoyé
                            </h3>
                            <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex gap-2">
                              <span className="text-gray-600 font-semibold">À:</span>
                              <span className="text-gray-900">{event.data.destinataire}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-600 font-semibold">Sujet:</span>
                              <span className="text-gray-900">{event.data.sujet}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-600 font-semibold">Statut:</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${event.data.statut === 'envoye' ? 'bg-green-100 text-green-700' :
                                event.data.statut === 'echoue' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                {event.data.statut?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {event.type === 'demande' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <AlertCircle size={16} /> Demande d'Achat
                            </h3>
                            <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex gap-2">
                              <span className="text-gray-600 font-semibold">Prestataire:</span>
                              <span className="text-gray-900">{event.data.email_prestataire}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-600 font-semibold">Objet:</span>
                              <span className="text-gray-900">{event.data.objet}</span>
                            </div>
                            <div className="text-gray-600 bg-gray-50 p-2 rounded">
                              {event.data.description}
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-gray-600 font-semibold">Statut:</span>
                              <span className={`px-3 py-1 rounded text-xs font-semibold ${event.data.statut === 'validee' ? 'bg-green-100 text-green-700' :
                                event.data.statut === 'refusee' ? 'bg-red-100 text-red-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                {event.data.statut?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
