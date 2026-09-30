import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StatutBadge, PrioriteBadge } from '../components/common/Badges'
import { PageLoader } from '../components/common/Loader'
import Modal from '../components/common/Modal'
import { getSousCategorieName as getDynamicSousCategorieName } from '../utils/sousCategories'
import TicketConfirmationModal from '../components/TicketConfirmationModal'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, RefreshCw, Eye, Edit2, Trash2, Check, X, CheckCircle } from 'lucide-react'

const STATUTS = ['', 'ouvert', 'en_cours', 'en_attente', 'cloture']
const PRIORITES = ['', 'faible', 'moyenne', 'haute', 'critique']
const STATUT_LABELS = { '': 'Tous les statuts', ouvert: 'Ouvert', en_cours: 'En cours', en_attente: 'En attente', cloture: 'Clôturé' }
const PRIORITE_LABELS = { '': 'Toutes priorités', faible: 'Faible', moyenne: 'Moyenne', haute: 'Haute', critique: 'Critique' }

export default function TicketsPage() {
  const { user, isRole } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ statut: '', priorite: '', id_categorie: '', search: '', impact: '', confirme_par_utilisateur: '' })
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedTicketIds, setSelectedTicketIds] = useState([])
  const [editForm, setEditForm] = useState({ objet_ticket: '', description: '', priorite: 'moyenne', id_categorie: '' })
  const [errors, setErrors] = useState({})
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)

  const formatTicketDate = (dateCreation, heureCreation) => {
    if (!dateCreation) return '—'
    const dateOnly = dateCreation.split('T')[0].split(' ')[0]
    return heureCreation
      ? new Date(`${dateOnly}T${heureCreation}`).toLocaleString('fr-FR')
      : new Date(dateOnly).toLocaleDateString('fr-FR')
  }

  const isTicketOverdue = (ticket) => {
    if (!ticket) return false
    if (!['ouvert', 'en_cours', 'en_attente'].includes(ticket.statut)) return false

    let referenceDate = null
    if (ticket.statut === 'en_cours' && ticket.date_en_cours) {
      referenceDate = ticket.date_en_cours
    } else if (ticket.statut === 'en_attente' && ticket.date_en_attente) {
      referenceDate = ticket.date_en_attente
    } else if (ticket.statut === 'ouvert' && ticket.date_ouvert) {
      referenceDate = ticket.date_ouvert
    } else if (ticket.date_ouverture) {
      referenceDate = ticket.date_ouverture
    } else if (ticket.date_creation) {
      referenceDate = ticket.date_creation
    }

    if (!referenceDate) return false
    const openedAt = new Date(referenceDate)
    return (Date.now() - openedAt.getTime()) >= 48 * 60 * 60 * 1000
  }

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, ...filters }
      if (searchParams.get('mes') === '1') {
        params.mes = 1
      }
      if (searchParams.get('impact')) {
        params.impact = searchParams.get('impact')
      }
      if (searchParams.get('statut')) {
        params.statut = searchParams.get('statut')
      }
      Object.keys(params).forEach(k => {
        if (params[k] === '' || params[k] === null || params[k] === undefined) {
          delete params[k]
        }
      })
      const { data } = await api.get('/tickets', { params })
      setTickets(data.data || [])
      setPagination({ current_page: data.current_page, last_page: data.last_page, total: data.total })
    } catch { }
    finally { setLoading(false) }
  }, [page, filters, searchParams])

  useEffect(() => {
    setSelectedTicketIds(prev => prev.filter(id => tickets.some(t => t.id_ticket === id)))
  }, [tickets])

  const openEditModal = ticket => {
    setSelectedTicket(ticket)
    setEditForm({
      objet_ticket: ticket.objet_ticket || '',
      description: ticket.description || '',
      priorite: ticket.priorite || 'moyenne',
      id_categorie: ticket.id_categorie || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedTicket(null)
    setErrors({})
  }

  const canModifyTicket = (ticket) => {
    return isRole('admin')
  }

  const saveTicket = async () => {
    if (!selectedTicket) return
    try {
      const payload = {
        objet_ticket: editForm.objet_ticket,
        description: editForm.description,
        priorite: editForm.priorite,
        id_categorie: editForm.id_categorie,
      }
      await api.put(`/tickets/${selectedTicket.id_ticket}`, payload)
      toast.success('Ticket mis à jour.')
      closeModal()
      fetchTickets()
    } catch (error) {
      const validationErrors = error?.response?.data?.errors || {}
      setErrors(validationErrors)
      if (!Object.keys(validationErrors).length) {
        toast.error(error?.response?.data?.message || 'Impossible de mettre à jour le ticket.')
      }
    }
  }

  const deleteTicket = async id => {
    if (!confirm('Supprimer ce ticket ?')) return
    try {
      await api.delete(`/tickets/${id}`)
      toast.success('Ticket supprimé.')
      fetchTickets()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de supprimer le ticket.')
    }
  }

  const validerTicket = async (id) => {
    try {
      await api.post(`/tickets/${id}/valider`)
      toast.success('Ticket validé.')
      fetchTickets()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la validation.')
    }
  }

  const rejeterTicket = async (id) => {
    try {
      await api.post(`/tickets/${id}/rejeter`)
      toast.success('Ticket rejeté.')
      fetchTickets()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors du rejet.')
    }
  }

  const openConfirmationModal = (ticket) => {
    setSelectedTicket(ticket)
    setConfirmationModalOpen(true)
  }

  const handleConfirmationSuccess = (updatedTicket) => {
    setTickets(prev => prev.map(t => t.id_ticket === updatedTicket.id_ticket ? updatedTicket : t))
    fetchTickets()
  }

  const isAllTicketsSelected = tickets.length > 0 && selectedTicketIds.length === tickets.length

  const toggleSelectAllTickets = () => {
    if (isAllTicketsSelected) {
      setSelectedTicketIds([])
      return
    }
    setSelectedTicketIds(tickets.map(ticket => ticket.id_ticket))
  }

  const toggleTicketSelection = (ticketId) => {
    setSelectedTicketIds(prev => prev.includes(ticketId)
      ? prev.filter(id => id !== ticketId)
      : [...prev, ticketId]
    )
  }

  const exportTicketsToCsv = (ticketsToExport, fileName) => {
    if (ticketsToExport.length === 0) {
      toast.error('Aucun ticket à exporter.')
      return
    }

    const columns = [
      { key: 'date_creation', label: 'Date de création' },
      { key: 'id_ticket', label: 'N° Ticket' },
      { key: 'statut', label: 'Statut' },
      { key: 'utilisateur', label: 'Créateur Ticket' },
      { key: 'objet_ticket', label: 'Objet ticket' },
      { key: 'description', label: 'Description Ticket' },
      { key: 'priorite', label: 'Priorité' },
      { key: 'traiteur', label: 'Ticket Traité par' },
      { key: 'typologie', label: 'Typologie ticket' },
      { key: 'categorie', label: 'Catégorie' },
      { key: 'sous_categorie', label: 'Sous-catégorie' },
      { key: 'impact', label: 'Impact incident' },
      { key: 'date_cloture', label: 'Date de fermeture' },
    ]

    const headers = columns.map(col => col.label)

    const formatExportDate = (dateCreation, heureCreation) => {
      const formatted = formatTicketDate(dateCreation, heureCreation)
      return formatted && formatted !== '—' ? `\'${formatted}` : ''
    }

    const data = ticketsToExport.map((ticket) => {
      return columns.map(col => {
        switch (col.key) {
          case 'statut':
            return STATUT_LABELS[ticket.statut] || ticket.statut || ''
          case 'priorite':
            return PRIORITE_LABELS[ticket.priorite] || ticket.priorite || ''
          case 'date_creation':
            return formatExportDate(
              ticket.date_creation || ticket.date_ouverture || ticket.created_at,
              ticket.heure_creation
            )
          case 'categorie':
            return ticket.categorie?.nom || ''
          case 'sous_categorie':
            return getDynamicSousCategorieName(ticket.sousCategorie, ticket.id_sous_categorie, subCategories)
          case 'utilisateur':
            return ticket.utilisateur?.nom || ''
          case 'traiteur':
            return ticket.traiteur?.nom || ticket.traiteur_actuel?.nom || ''
          case 'impact':
            return ticket.impact === 'pas_impact' ? "PAS D'IMPACT" :
              ticket.impact === 'impact_individuel' ? 'IMPACT INDIVIDUEL' :
                ticket.impact === 'impact_general' ? 'IMPACT GÉNÉRAL' :
                  ticket.impact || ''
          case 'date_cloture':
            const closureDate = ticket.date_cloture ? new Date(ticket.date_cloture).toLocaleDateString('fr-FR') : ''
            return closureDate ? `\'${closureDate}` : ''
          default:
            return ticket[col.key] || ''
        }
      })
    })

    const rows = [headers, ...data]
    const csvContent = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`${ticketsToExport.length} ticket(s) exporté(s) avec succès`)
  }

  const exportSelectedTickets = () => {
    if (selectedTicketIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un ticket à exporter.')
      return
    }

    const selectedTickets = tickets.filter(ticket => selectedTicketIds.includes(ticket.id_ticket))
    exportTicketsToCsv(selectedTickets, `tickets_selection_export_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportAllTickets = () => {
    exportTicketsToCsv(tickets, `tickets_export_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleImportFile = (event) => {
    const file = event.target.files?.[0] || null
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!['csv', 'tsv', 'xlsx', 'xls'].includes(extension)) {
        toast.error('Format de fichier non supporté. Utilisez CSV, TSV, XLSX ou XLS.')
        return
      }
    }
    setImportFile(file)
  }

  const handleImportTickets = async () => {
    if (!importFile) {
      toast.error('Sélectionner un fichier avant d\'importer.')
      return
    }

    const fileExtension = importFile.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls', 'tsv'].includes(fileExtension)) {
      toast.error('Format non supporté. Convertissez en CSV avant d\'importer.')
      setImporting(false)
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      // Auto-detect delimiter for CSV files and support semicolon-separated CSV
      formData.append('delimiter', fileExtension === 'tsv' ? 'tab' : 'auto')

      const { data } = await api.post('/admin/tickets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success(`${data.imported} tickets importés avec succès.`)
      setImportFile(null)
      fetchTickets()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Impossible d\'importer les tickets.'

      // If backend returned parsing debug info, show a clearer message
      if (err.response?.status === 422 && err.response?.data?.total_rows) {
        const sample = err.response.data.sample_row
        const diagnostics = err.response.data.diagnostics || []
        console.error('Import debug sample row:', sample)
        console.error('Import diagnostics:', diagnostics)

        // Summarize diagnostics reasons
        const reasonCounts = diagnostics.reduce((acc, d) => {
          (d.reasons || []).forEach(r => acc[r] = (acc[r] || 0) + 1)
          return acc
        }, {})
        const reasonsText = Object.entries(reasonCounts).map(([k, v]) => `${k}: ${v}`).slice(0, 3).join(', ')

        toast.error(`Aucune ligne importée. Vérifiez les en-têtes/colonnes. ${reasonsText}`)
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        toast.error(
          errorMsg.includes('Excel')
            ? 'Convertissez votre fichier Excel en CSV et réessayez.'
            : errorMsg
        )
      } else {
        toast.error(errorMsg)
      }
      console.error('Import tickets error', err)
    } finally {
      setImporting(false)
    }
  }

  useEffect(() => {
    fetchTickets()
    api.get('/categories').then(r => setCategories(r.data)).catch(() => { })
    api.get('/sous-categories').then(r => setSubCategories(r.data)).catch(() => { })
  }, [fetchTickets])

  useEffect(() => {
    const nextFilters = {}
    if (searchParams.get('statut')) nextFilters.statut = searchParams.get('statut')
    if (searchParams.get('impact')) nextFilters.impact = searchParams.get('impact')
    if (searchParams.get('confirme_par_utilisateur')) nextFilters.confirme_par_utilisateur = searchParams.get('confirme_par_utilisateur')
    if (Object.keys(nextFilters).length) {
      setFilters(p => ({ ...p, ...nextFilters }))
    }
  }, [searchParams])

  const updateFilter = (key, val) => {
    setFilters(p => ({ ...p, [key]: val }))
    setPage(1)
  }

  const pageTitle = searchParams.get('mes') === '1'
    ? 'Mes tickets'
    : isRole('validateur')
      ? 'Toutes les tickets'
      : 'Tickets'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pagination.total} ticket(s) au total</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <motion.button
            onClick={exportSelectedTickets}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Exporter sélection
          </motion.button>

          {isRole('admin') && (
            <>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors" title="Fichiers CSV recommandés">
                Importer (CSV)
                <input
                  type="file"
                  accept=".csv,.tsv,.xlsx,.xls,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>
              <button
                onClick={handleImportTickets}
                disabled={!importFile || importing}
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {importing ? 'Import en cours...' : 'Valider'}
              </button>
            </>
          )}
          <button onClick={fetchTickets} className="btn-secondary">
            <RefreshCw size={16} /> Actualiser
          </button>


        </div>
      </div>

      {importFile && isRole('admin') && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span><strong>Fichier sélectionné :</strong> {importFile.name}</span>
            <button onClick={() => setImportFile(null)} className="text-xs text-blue-500 hover:text-blue-700 font-semibold">Annuler</button>
          </div>
          <p className="text-xs text-blue-600">
            💡 Format recommandé: CSV (séparé par des virgules). Les fichiers Excel doivent être convertis en CSV en premier.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 text-sm"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
            />
          </div>
          {/* Statut */}
          <select className="input text-sm" value={filters.statut} onChange={e => updateFilter('statut', e.target.value)}>
            {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
          </select>
          {/* Priorité */}
          <select className="input text-sm" value={filters.priorite} onChange={e => updateFilter('priorite', e.target.value)}>
            {PRIORITES.map(p => <option key={p} value={p}>{PRIORITE_LABELS[p]}</option>)}
          </select>
          {/* Catégorie */}
          <select className="input text-sm" value={filters.id_categorie} onChange={e => updateFilter('id_categorie', e.target.value)}>
            <option value="">Toutes catégories</option>
            {categories.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>)}
          </select>
          {/* Confirmation clôture */}
          <select className="input text-sm" value={filters.confirme_par_utilisateur} onChange={e => updateFilter('confirme_par_utilisateur', e.target.value)}>
            <option value="">Toutes confirmations</option>
            <option value="1">Confirmé</option>
            <option value="0">Non confirmé</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center"><PageLoader /></div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">Aucun ticket trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isAllTicketsSelected}
                      onChange={toggleSelectAllTickets}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date de création</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">N° Ticket</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Statut</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Créateur Ticket</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Objet ticket</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Description Ticket</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Priorité</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Ticket Traité par</th>
                  <th className="text-left py-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Typologie ticket</th>
                  <th className="text-left py-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Catégorie</th>
                  <th className="text-left py-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sous-catégorie</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Impact incident</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date de fermeture</th>
                  <th className="text-left py-3 px-3 font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => {
                  const isDisabledForTraiteur = isRole('traiteur') && t.statut === 'en_cours' && t.traite_par !== user?.id_utilisateur
                  return (
                    <motion.tr
                      key={t.id_ticket}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${isDisabledForTraiteur ? 'opacity-50 bg-gray-100' : ''}`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTicketIds.includes(t.id_ticket)}
                          onChange={() => toggleTicketSelection(t.id_ticket)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{formatTicketDate(t.date_creation, t.heure_creation)}</td>
                      <td className="py-2.5 px-3 font-bold text-primary-600 whitespace-nowrap">#{t.id_ticket}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatutBadge statut={t.statut} />
                          {isRole('traiteur') && isTicketOverdue(t) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase bg-red-100 text-red-700">
                              +48h
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{t.utilisateur?.nom || '—'}</td>
                      <td className="py-2.5 px-3 text-gray-700 max-w-xs">
                        <p className="truncate">{t.objet_ticket}</p>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 max-w-sm">
                        <p className="truncate text-xs">{t.description || '—'}</p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><PrioriteBadge priorite={t.priorite} /></td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{t.traiteur?.nom || '—'}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{t.typologie || '—'}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{t.categorie?.nom || '—'}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap text-xs">{getDynamicSousCategorieName(t.sousCategorie, t.id_sous_categorie, subCategories)}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap text-xs">
                        {t.impact === 'pas_impact' ? "PAS D'IMPACT" :
                          t.impact === 'impact_individuel' ? 'IMPACT INDIVIDUEL' :
                            t.impact === 'impact_general' ? 'IMPACT GÉNÉRAL' :
                              t.impact || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                        {t.date_cloture ? new Date(t.date_cloture).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="py-2.5 px-3 sticky right-0 bg-gray-50 hover:bg-blue-50/40 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/tickets/${t.id_ticket}`)}
                            disabled={isDisabledForTraiteur}
                            className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-1 rounded transition-all ${isDisabledForTraiteur
                              ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                              : 'text-primary-600 hover:text-primary-800 bg-primary-100/50 hover:bg-primary-100'
                              }`}
                          >
                            <Eye size={11} /> Voir
                          </button>
                          {canModifyTicket(t) && (
                            <button
                              onClick={() => openEditModal(t)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-100/50 hover:bg-blue-100 px-2 py-1 rounded transition-all"
                            >
                              <Edit2 size={11} /> Modifier
                            </button>
                          )}
                          {isRole('user') && t.statut === 'cloture' && !t.confirme_par_utilisateur && (
                            <button
                              onClick={() => openConfirmationModal(t)}
                              className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-xs bg-green-100/50 hover:bg-green-100 px-2 py-1 rounded transition-all"
                              title="Confirmer la clôture de ce ticket"
                            >
                              <CheckCircle size={11} /> Confirmer
                            </button>
                          )}
                          {t.statut === 'cloture' && t.confirme_par_utilisateur && (
                            <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-xs bg-green-100/50 px-2 py-1 rounded">
                              <CheckCircle size={11} /> Confirmé
                            </span>
                          )}
                          {isRole('admin') && (
                            <button
                              onClick={() => deleteTicket(t.id_ticket)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold text-xs bg-red-100/50 hover:bg-red-100 px-2 py-1 rounded transition-all"
                            >
                              <Trash2 size={11} /> Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Page {pagination.current_page} / {pagination.last_page} ({pagination.total} ticket(s))</p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >Précédent</button>
              <button
                disabled={page === pagination.last_page}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >Suivant</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={`Modifier le ticket #${selectedTicket?.id_ticket ?? ''}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Objet du ticket</label>
            <input
              value={editForm.objet_ticket}
              onChange={e => setEditForm(f => ({ ...f, objet_ticket: e.target.value }))}
              className={`input ${errors.objet_ticket ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            {errors.objet_ticket && <p className="text-red-500 text-xs mt-1">{errors.objet_ticket}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              className={`input min-h-[120px] resize-none ${errors.description ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Priorité</label>
              <select
                value={editForm.priorite}
                onChange={e => setEditForm(f => ({ ...f, priorite: e.target.value }))}
                className={`input ${errors.priorite ? 'border-red-300 focus:ring-red-400' : ''}`}
              >
                {PRIORITES.filter(p => p).map(p => (
                  <option key={p} value={p}>{PRIORITE_LABELS[p]}</option>
                ))}
              </select>
              {errors.priorite && <p className="text-red-500 text-xs mt-1">{errors.priorite}</p>}
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select
                value={editForm.id_categorie}
                onChange={e => setEditForm(f => ({ ...f, id_categorie: e.target.value }))}
                className={`input ${errors.id_categorie ? 'border-red-300 focus:ring-red-400' : ''}`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => (
                  <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>
                ))}
              </select>
              {errors.id_categorie && <p className="text-red-500 text-xs mt-1">{errors.id_categorie}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={closeModal} className="btn-secondary">Annuler</button>
            <button type="button" onClick={saveTicket} className="btn-primary">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <TicketConfirmationModal
        open={confirmationModalOpen}
        ticket={selectedTicket}
        onClose={() => {
          setConfirmationModalOpen(false)
          setSelectedTicket(null)
        }}
        onSuccess={handleConfirmationSuccess}
      />
    </div>
  )
}
