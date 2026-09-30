import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react'

export default function DemandeAchatValidationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [demandes, setDemandes] = useState([])
  const [filter, setFilter] = useState('en_attente')

  useEffect(() => {
    fetchDemandes()
  }, [filter])

  const fetchDemandes = async () => {
    setLoading(true)
    try {
      const response = await api.get('/demandes-achat', {
        params: { statut: filter === 'tous' ? undefined : filter }
      })
      setDemandes(response.data.data || response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des demandes d\'achat.')
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async (id) => {
    try {
      await api.patch(`/demandes-achat/${id}/valider`)
      toast.success('Déclaration validée et e-mail envoyé au prestataire.')
      await fetchDemandes()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la validation.')
    }
  }

  const handleRefuser = async (id) => {
    try {
      await api.patch(`/demandes-achat/${id}/refuser`)
      toast.success('Déclaration refusée.')
      await fetchDemandes()
    } catch (error) {
      toast.error('Erreur lors du refus.')
    }
  }

  const handleViewTicket = (ticketId) => {
    if (ticketId) {
      navigate(`/tickets/${ticketId}`)
    } else {
      toast.error('Aucun ticket associé à cette demande d\'achat.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Chargement des declarations niveau +2 ...</p>
      </div>
    )
  }

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-700'
      case 'validee':
        return 'bg-green-100 text-green-700'
      case 'refusee':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'en_attente':
        return <Clock size={16} className="text-yellow-600" />
      case 'validee':
        return <CheckCircle size={16} className="text-green-600" />
      case 'refusee':
        return <XCircle size={16} className="text-red-600" />
      default:
        return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Déclaration niveau 2</h1>
          <p className="text-gray-600 mt-2">Gérez les déclarations niveau 2 en attente de traitement</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 mb-6 shadow-sm"
        >
          <div className="flex flex-wrap gap-2">
            {['tous', 'en_attente', 'validee', 'refusee'].map((stat) => (
              <button
                key={stat}
                onClick={() => setFilter(stat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === stat
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {stat === 'tous' ? 'Tous' : stat === 'en_attente' ? 'En attente' : stat === 'validee' ? 'Validées' : 'Refusées'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Total: {demandes.length} demande{demandes.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Demandes List */}
        {demandes.length > 0 ? (
          <div className="space-y-4">
            {demandes.map((demande, index) => (
              <motion.div
                key={demande.id_demande}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border-l-4 border-primary-500 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Ticket #{demande.ticket?.id_ticket}
                    </h3>
                    <p className="text-gray-600 mt-1">{demande.ticket?.objet_ticket}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatutBadge(demande.statut)}`}>
                    {getStatutIcon(demande.statut)}
                    {demande.statut === 'en_attente' ? 'En attente' : demande.statut === 'validee' ? 'Validée' : demande.statut === 'refusee' ? 'Refusée' : demande.statut}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Prestataire</label>
                    <p className="text-gray-900">{demande.email_prestataire}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Type de contrat</label>
                    <p className="text-gray-900">{demande.type_contrat === 'avec_contrat' ? 'Sur contrat' : 'Sur devis'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Objet</label>
                    <p className="text-gray-900">{demande.objet}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-semibold">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded mt-1">{demande.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Copy mail</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded mt-1">{demande.copy_mail || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Pièce jointe</label>
                    {demande.piece_jointe ? (
                      <a
                        href={`${import.meta.env.VITE_API_URL}/storage/${demande.piece_jointe}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded mt-1 transition-colors"
                      >
                        <Eye size={16} />
                        Voir la pièce jointe
                      </a>
                    ) : (
                      <p className="text-gray-500 bg-gray-50 p-3 rounded mt-1">Aucune pièce jointe</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Créée le {new Date(demande.created_at).toLocaleDateString('fr-FR')}</span>
                  <span>Par: {demande.utilisateur?.nom}</span>
                </div>

                {/* Actions pour les validateurs */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewTicket(demande.ticket?.id_ticket)}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <Eye size={18} />
                    Voir le ticket
                  </button>
                  {demande.statut === 'en_attente' && (
                    <>
                      <button
                        onClick={() => handleValider(demande.id_demande)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <CheckCircle size={18} />
                        Valider
                      </button>
                      <button
                        onClick={() => handleRefuser(demande.id_demande)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <XCircle size={18} />
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg">Aucune demande d'achat trouvée.</p>
          </div>
        )}
      </div>
    </div>
  )
}
