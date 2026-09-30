import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const SOUS_CATEGORIES_MAP = {
  90: 'POST DE TRAVAIL',
  91: 'ECRAN',
  92: 'IMPRESSION',
  93: 'SERVEUR ET STOCKAGE',
  94: 'RESEAU ET SWITCH',
  95: 'MOBILITE',
  96: 'BASE DE DONNEES',
  97: 'RÉSEAU ET CONNEXION',
  98: 'SAGE',
  99: 'LOCPR',
  100: 'ONBASE',
  101: 'CHAABIOCAS',
  102: 'MESSAGERIE',
  103: 'INTERNET',
  104: 'ACTIVE DIRECTORY',
  105: 'INSTALLATION ET DEPLOIEMENT',
  106: 'ACCESS ET LICENCE',
  107: 'INCIDENT LOGICIEL',
  108: 'CONFIGURATION',
  109: 'SECURITE LOGICIEL',
  110: 'SAUVEGARDE ET RESTEAURATION',
  111: 'VIRTUALISATION',
  112: 'STOCKAGE',
  113: 'ALIMENTATION DATA CENTER',
  114: 'ONDULAIRE DATE CENTER',
  115: 'DATA CENTER RACK',
  116: 'GESTION DES ACCESS',
  117: 'NAC',
  118: 'SECURITE MESSAGERIE',
  119: 'SECURITE DES POSTES',
  120: 'SECURITE RESEAU',
  121: 'INCIDENT DE SECURITE',
  122: 'SECURITE CLOUD',
  123: 'SECURITE LOGICIEL',
  124: 'TELEPHONIE IP',
  125: 'LES LIGNES ET LES COMPTES TEL',
  126: 'CENTRE DES CONTACTS',
  127: 'RESEAU VOIP',
  128: 'GESTION DE CALENDRIER',
  129: 'PEREPHIRIQUE',
  130: 'CLAVIER',
  131: 'SOURIS',
  132: 'ALEMENTATION',
  133: 'CASQUE',
  134: 'EXTRA NET CLIENT'
}

const getSousCategorieName = (sousCategorie, idSousCategorie) => {
  if (sousCategorie && sousCategorie.nom) {
    return sousCategorie.nom
  }
  if (idSousCategorie && SOUS_CATEGORIES_MAP[idSousCategorie]) {
    return SOUS_CATEGORIES_MAP[idSousCategorie]
  }
  return null
}

const getActionDate = (ticket, actions) => {
  const history = ticket.ticket_historiques || ticket.ticketHistoriques
  if (!history?.length) return null

  const normalizedActions = actions.map((action) => action.toLowerCase().trim())
  const historyItem = history
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .find((item) => {
      const actionText = item.action?.toString().toLowerCase().trim() || ''
      return normalizedActions.some((search) => actionText.includes(search))
    })

  if (!historyItem || !historyItem.created_at) return null
  const date = new Date(historyItem.created_at)
  return Number.isNaN(date.getTime()) ? null : date
}

const getPendingDate = (ticket) => {
  return getActionDate(ticket, ['Ticket mis en attente', 'Ticket marqué en attente'])
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR')
}

const STATUT_BADGES = {
  ouvert: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ouvert' },
  en_cours: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En cours' },
  en_attente: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En attente' },
  cloture: { bg: 'bg-green-100', text: 'text-green-700', label: 'Clôturé' },
}

const PRIORITE_BADGES = {
  faible: { bg: 'bg-blue-100', text: 'text-blue-700' },
  moyenne: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  haute: { bg: 'bg-orange-100', text: 'text-orange-700' },
  critique: { bg: 'bg-red-100', text: 'text-red-700' },
}

const PRIORITE_ICONS = {
  faible: '↓',
  moyenne: '→',
  haute: '↑',
  critique: '⚠',
}

export default function HistoriquePage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await api.get('/tickets')
      setTickets(response.data.data || response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des tickets')
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'tous') return true
    return ticket.statut === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Chargement de l\'historique...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Tickets</h1>
          <p className="text-gray-600">
            {user?.nom} - {user?.role === 'traiteur' ? 'Traiteur' : 'Administrateur'}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 mb-6 shadow-sm"
        >
          <div className="flex flex-wrap gap-2">
            {['tous', 'ouvert', 'en_cours', 'en_attente', 'cloture'].map((stat) => (
              <button
                key={stat}
                onClick={() => setFilter(stat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === stat
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {stat === 'tous' ? 'Tous' : STATUT_BADGES[stat]?.label || stat}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Total: {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id_ticket}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-primary-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">#{ticket.id_ticket}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${STATUT_BADGES[ticket.statut].bg
                          } ${STATUT_BADGES[ticket.statut].text}`}
                      >
                        {STATUT_BADGES[ticket.statut].label}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${PRIORITE_BADGES[ticket.priorite].bg
                          } ${PRIORITE_BADGES[ticket.priorite].text}`}
                      >
                        {PRIORITE_ICONS[ticket.priorite]} {ticket.priorite}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-2">{ticket.objet_ticket}</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    {(ticket.demandeAchats || ticket.demande_achats)?.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-3 text-sm text-gray-700">
                        <div className="font-semibold text-gray-900 mb-1">Demande d'achat liée</div>
                        <div>Prestataire: {(ticket.demandeAchats || ticket.demande_achats)[0].email_prestataire || '—'}</div>
                        <div>Objet: {(ticket.demandeAchats || ticket.demande_achats)[0].objet || '—'}</div>
                        <div>Description: {(ticket.demandeAchats || ticket.demande_achats)[0].description || '—'}</div>
                        <div>Statut: {(ticket.demandeAchats || ticket.demande_achats)[0].statut === 'en_attente' ? 'En attente' : (ticket.demandeAchats || ticket.demande_achats)[0].statut === 'validee' ? 'Validée' : 'Refusée'}</div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{ticket.utilisateur?.nom || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{formatDate(ticket.date_creation)}</span>
                      </div>
                      {ticket.categorie?.nom && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">Cat:</span>
                          <span>{ticket.categorie.nom}</span>
                        </div>
                      )}
                      {getSousCategorieName(ticket.sousCategorie, ticket.id_sous_categorie) && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">Sous-cat:</span>
                          <span>{getSousCategorieName(ticket.sousCategorie, ticket.id_sous_categorie)}</span>
                        </div>
                      )}
                      {ticket.date_ouverture && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={16} />
                          <span>
                            Pris en charge le {formatDate(ticket.date_ouverture)}
                          </span>
                        </div>
                      )}
                      {getPendingDate(ticket) && (
                        <div className="flex items-center gap-1">
                          <AlertCircle size={16} />
                          <span>Mis en attente le {formatDate(getPendingDate(ticket))}</span>
                        </div>
                      )}
                      {ticket.date_cloture && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={16} />
                          <span>
                            Clôturé le {formatDate(ticket.date_cloture)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(ticket.emailLogs || ticket.email_logs)?.length > 0 && (
                    <div className="flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {(ticket.emailLogs || ticket.email_logs).length} email{(ticket.emailLogs || ticket.email_logs).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-12 text-center shadow-sm"
          >
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Aucun ticket trouvé</p>
          </motion.div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </div>
  )
}

function TicketDetailModal({ ticket, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">#{ticket.id_ticket}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">{ticket.objet_ticket}</h3>
            <p className="text-gray-600 mt-2">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUT_BADGES[ticket.statut].bg
                  } ${STATUT_BADGES[ticket.statut].text}`}
              >
                {STATUT_BADGES[ticket.statut].label}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Priorité</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${PRIORITE_BADGES[ticket.priorite].bg
                  } ${PRIORITE_BADGES[ticket.priorite].text}`}
              >
                {PRIORITE_ICONS[ticket.priorite]} {ticket.priorite}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Catégorie</p>
              <p className="text-gray-900 font-medium">{ticket.categorie?.nom || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Utilisateur</p>
              <p className="text-gray-900 font-medium">{ticket.utilisateur?.nom || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date de création</p>
              <p className="text-gray-900 font-medium">{formatDate(ticket.date_creation)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pris en charge</p>
              <p className="text-gray-900 font-medium">{formatDate(ticket.date_ouverture)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mis en attente</p>
              <p className="text-gray-900 font-medium">{formatDate(getPendingDate(ticket))}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Clôturé</p>
              <p className="text-gray-900 font-medium">{formatDate(ticket.date_cloture)}</p>
            </div>
          </div>

          {(ticket.demandeAchats || ticket.demande_achats)?.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Demande d'achat liée</h4>
              {(ticket.demandeAchats || ticket.demande_achats).map((demande) => (
                <div key={demande.id_demande} className="space-y-1 text-sm text-gray-700 mb-3 last:mb-0">
                  <div><span className="font-medium">Prestataire:</span> {demande.email_prestataire || '—'}</div>
                  <div><span className="font-medium">Objet:</span> {demande.objet || '—'}</div>
                  <div><span className="font-medium">Description:</span> {demande.description || '—'}</div>
                  <div><span className="font-medium">Statut:</span> {demande.statut === 'en_attente' ? 'En attente' : demande.statut === 'validee' ? 'Validée' : 'Refusée'}</div>
                </div>
              ))}
            </div>
          )}

          {ticket.notes_traiteur && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Notes du traiteur</p>
              <p className="text-gray-900">{ticket.notes_traiteur}</p>
            </div>
          )}

          {(ticket.emailLogs || ticket.email_logs)?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Emails envoyés</h4>
              <div className="space-y-2">
                {(ticket.emailLogs || ticket.email_logs).map((email) => (
                  <div key={email.id} className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">{email.sujet}</p>
                    <p className="text-xs text-blue-700">
                      {new Date(email.date_envoi).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
