import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { motion } from 'framer-motion'
import { Eye, RefreshCw, FileText } from 'lucide-react'
import { PageLoader } from '../components/common/Loader'
import { getSousCategorieName } from '../utils/sousCategories'
import { formatDateTime } from '../utils/dateUtils'

export default function RapportsPage() {
  const navigate = useNavigate()
  const [rapports, setRapports] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const formatTicketDate = (dateCreation, heureCreation) => {
    if (!dateCreation) return '—'
    const dateOnly = dateCreation.split('T')[0].split(' ')[0]
    return heureCreation
      ? new Date(`${dateOnly}T${heureCreation}`).toLocaleString('fr-FR')
      : new Date(dateOnly).toLocaleDateString('fr-FR')
  }

  const fetchRapports = async () => {
    setLoading(true)
    try {
      const [rapportsRes, subCategoriesRes] = await Promise.all([
        api.get('/rapports'),
        api.get('/sous-categories'),
      ])
      setRapports(rapportsRes.data)
      setSubCategories(subCategoriesRes.data || [])
    } catch (err) {
      console.error('Erreur chargement rapports', err)
    } finally {
      setLoading(false)
    }
  }

  const formatImpact = (impact) => {
    if (!impact) return '—'
    switch (impact) {
      case 'pas_impact': return 'Pas d’impact'
      case 'impact_individuel': return 'Impact individuel'
      case 'impact_general': return 'Impact général'
      default: return impact
    }
  }

  useEffect(() => {
    fetchRapports()
  }, [])

  const openReportModal = (rapport) => {
    setSelectedReport(rapport)
    setShowReportModal(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-primary-100 flex items-center justify-center text-primary-600">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Rapports</h1>
            <p className="text-gray-500 text-sm mt-1">Consultez les rapports générés pour vos tickets.</p>
          </div>
        </div>
        <button onClick={fetchRapports} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center"><PageLoader /></div>
        ) : rapports.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">Aucun rapport disponible.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'Description', 'Ticket', 'Catégorie', 'Sous-catégorie', 'Créé le', 'Généré le', 'Fermé le', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rapports.map((rapport, index) => {
                  const ticket = rapport.tickets?.[0]
                  return (
                    <motion.tr
                      key={rapport.id_rapport}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-bold text-primary-500 whitespace-nowrap">#{rapport.id_rapport}</td>
                      <td className="py-3 px-4 text-gray-700 max-w-xs truncate">{rapport.description}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{ticket ? `#${ticket.id_ticket}` : '—'}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{ticket?.categorie?.nom || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap text-xs">{getSousCategorieName(ticket?.sousCategorie, ticket?.id_sous_categorie, subCategories)}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {ticket ? formatTicketDate(ticket.date_creation, ticket.heure_creation) : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{new Date(rapport.date_generation).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{rapport.date_fermeture ? formatDateTime(rapport.date_fermeture) : '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => ticket && navigate(`/tickets/${ticket.id_ticket}`)}
                            disabled={!ticket}
                            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 font-semibold text-xs bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                          >
                            <Eye size={13} /> Détails
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Rapport #{selectedReport.id_rapport}</h2>
                  <p className="text-sm text-gray-500 mt-2">Ticket #{selectedReport.tickets?.[0]?.id_ticket || '—'} • Généré le {new Date(selectedReport.date_generation).toLocaleDateString('fr-FR')}</p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Informations du ticket et ticket */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Informations du ticket</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Créateur</span>
                    <span className="font-semibold text-gray-800">{selectedReport.tickets?.[0]?.utilisateur?.nom || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Traiteur</span>
                    <span className="font-semibold text-gray-800">{selectedReport.tickets?.[0]?.traiteur?.nom || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Catégorie</span>
                    <span className="font-semibold text-gray-800">{selectedReport.tickets?.[0]?.categorie?.nom || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Créé le</span>
                    <span className="font-semibold text-gray-800">{selectedReport.tickets?.[0]?.date_creation ? formatDateTime(selectedReport.tickets[0].date_creation) : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Ouvert le</span>
                    <span className="font-semibold text-gray-800">{selectedReport.tickets?.[0]?.date_ouverture ? formatDateTime(selectedReport.tickets[0].date_ouverture) : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Clôturé le</span>
                    <span className="font-semibold text-gray-800">{selectedReport.tickets?.[0]?.date_cloture ? formatDateTime(selectedReport.tickets[0].date_cloture) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Détails du rapport */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Rapport de résolution</h3>
                <p className="text-gray-600 mb-4 italic">{selectedReport.description || '—'}</p>
                <p className="text-xs text-gray-400 mb-4">Généré le {new Date(selectedReport.date_generation).toLocaleDateString('fr-FR')}</p>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Typologie</span>
                    <span className="font-semibold text-gray-800">{selectedReport.typologie || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Sous-catégorie</span>
                    <span className="font-semibold text-gray-800">
                      {getSousCategorieName(
                        selectedReport.sousCategorie || selectedReport.tickets?.[0]?.sousCategorie,
                        selectedReport.id_sous_categorie || selectedReport.tickets?.[0]?.id_sous_categorie,
                        subCategories
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Impact</span>
                    <span className="font-semibold text-gray-800">{selectedReport.impact ? formatImpact(selectedReport.impact) : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Fermé le</span>
                    <span className="font-semibold text-gray-800">{selectedReport.date_fermeture ? formatDateTime(selectedReport.date_fermeture) : '—'}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Notes du traiteur</span>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm border border-gray-200">{selectedReport.notes_traiteur || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
