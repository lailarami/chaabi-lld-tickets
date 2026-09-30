import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import Modal from '../components/common/Modal'
import { PageLoader } from '../components/common/Loader'
import KpiPage from './KpiPage'
import { Plus, Edit2, Trash2, Users, Tag, Shield, FileText, BarChart3, Settings, Search, Filter, RefreshCw, Eye } from 'lucide-react'

const TABS = [
  { key: 'stats', label: 'KPI', icon: BarChart3 },
  { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  { key: 'roles', label: 'Rôles', icon: Shield },
  { key: 'categories', label: 'Catégories', icon: Tag },
  { key: 'domaines', label: 'Domaines', icon: Settings },
  { key: 'rapports', label: 'Rapports', icon: FileText },
  { key: 'demandes', label: 'Déclarations niveau +2', icon: Settings },
]

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
  return '—'
}

export default function AdminPage() {
  const { user, isRole } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [utilisateurs, setUtilisateurs] = useState([])
  const [roles, setRoles] = useState([])
  const [categories, setCategories] = useState([])
  const [domaines, setDomaines] = useState({ traiteurs: [], categories: [] })
  const [rapports, setRapports] = useState([])
  const [demandes, setDemandes] = useState([])
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [demandesFilter, setDemandesFilter] = useState({ statut: 'tous' })
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ open: false, type: '', data: null })
  const [tForm, setTForm] = useState({ objet_ticket: '', description: '', priorite: '', id_categorie: '' })

  const importTickets = async () => {
    if (!importFile) {
      toast.error('Sélectionner un fichier CSV ou TSV avant d’importer.')
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('delimiter', ',')

      const { data } = await api.post('/admin/tickets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success(`${data.imported} tickets importés avec succès.`)
      setImportFile(null)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d’importer les tickets.')
      console.error('Import tickets error', err)
    } finally {
      setImporting(false)
    }
  }



  // Initialize tForm when edit modal opens
  useEffect(() => {
    if (modal.open && modal.type === 'edit_ticket' && modal.data) {
      setTForm({
        objet_ticket: modal.data.objet_ticket || '',
        description: modal.data.description || '',
        priorite: modal.data.priorite || '',
        id_categorie: modal.data.id_categorie || ''
      })
    }
  }, [modal])

  const fetchDemandes = async () => {
    try {
      const { data } = await api.get('/demandes-achat', { params: demandesFilter })
      setDemandes(Array.isArray(data) ? data : (data?.data || []))
    } catch (err) {
      console.error('Erreur chargement demandes', err)
      toast.error('Impossible de charger les demandes.')
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/utilisateurs'),
        api.get('/admin/roles'),
        api.get('/admin/categories'),
        api.get('/admin/domaines-traiteurs'),
        api.get('/admin/rapports'),
        fetchDemandes(), // Remplacer par appel à fetchDemandes
      ])

      if (results[0].status === 'fulfilled') setStats(results[0].value.data)
      if (results[1].status === 'fulfilled') setUtilisateurs(results[1].value.data)
      if (results[2].status === 'fulfilled') setRoles(results[2].value.data)
      if (results[3].status === 'fulfilled') setCategories(results[3].value.data)
      if (results[4].status === 'fulfilled') setDomaines(results[4].value.data)
      if (results[5].status === 'fulfilled') setRapports(results[5].value.data)
      // fetchDemandes gère setDemandes

      // Log any errors
      results.forEach((r, idx) => {
        if (r.status === 'rejected') {
          console.error(`Erreur fetch admin[${idx}]:`, r.reason)
        }
      })
    } catch (err) {
      console.error('Erreur fetch admin', err)
      toast.error('Impossible de charger les données d’administration.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const [rapForm, setRapForm] = useState({ description: '', notes_traiteur: '' })

  useEffect(() => {
    if (modal.type === 'edit_rapport' && modal.data) {
      setRapForm({
        description: modal.data.description || '',
        notes_traiteur: modal.data.notes_traiteur || '',
      })
    }
  }, [modal])

  const openModal = (type, data = null) => setModal({ open: true, type, data })
  const closeModal = () => setModal({ open: false, type: '', data: null })

  // ─── UTILISATEUR CRUD ─────────────────────────────────────────────
  const [uForm, setUForm] = useState({ nom: '', email: '', password: '', id_role: '', actif: true, categories: [] })
  useEffect(() => {
    if (modal.type === 'edit_user' && modal.data) {
      setUForm({
        nom: modal.data.nom,
        email: modal.data.email,
        password: '',
        id_role: modal.data.id_role,
        actif: modal.data.actif !== false,
        categories: modal.data.categories?.map(c => c.id_categorie) || []
      })
    } else if (modal.type === 'add_user') {
      setUForm({ nom: '', email: '', password: '', id_role: '', actif: true, categories: [] })
    }
  }, [modal])

  useEffect(() => {
    if (modal.type === 'edit_domaines' && modal.data) {
      setDForm({
        categories: modal.data.categories?.map(c => c.id_categorie) || []
      })
    }
  }, [modal])

  const saveUser = async () => {
    try {
      if (modal.type === 'add_user') {
        await api.post('/admin/utilisateurs', uForm)
        toast.success('Utilisateur créé.')
      } else {
        await api.put(`/admin/utilisateurs/${modal.data.id_utilisateur}`, uForm)
        toast.success('Utilisateur modifié.')
      }
      fetchAll(); closeModal()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try { await api.delete(`/admin/utilisateurs/${id}`); toast.success('Supprimé.'); fetchAll() }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  // ─── ROLE CRUD ────────────────────────────────────────────────────
  const [rForm, setRForm] = useState({ nom_role: '' })
  const saveRole = async () => {
    try {
      if (modal.type === 'add_role') { await api.post('/admin/roles', rForm); toast.success('Rôle créé.') }
      else { await api.put(`/admin/roles/${modal.data.id_role}`, rForm); toast.success('Rôle modifié.') }
      fetchAll(); closeModal()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  // ─── CATEGORIE CRUD ───────────────────────────────────────────────
  const [cForm, setCForm] = useState({ nom: '' })
  const saveCat = async () => {
    try {
      if (modal.type === 'add_cat') { await api.post('/admin/categories', cForm); toast.success('Catégorie créée.') }
      else { await api.put(`/admin/categories/${modal.data.id_categorie}`, cForm); toast.success('Catégorie modifiée.') }
      fetchAll(); closeModal()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  // ─── DOMAINES CRUD ────────────────────────────────────────────────
  const [dForm, setDForm] = useState({ categories: [] })
  const saveDomaines = async () => {
    try {
      await api.put(`/admin/domaines-traiteurs/${modal.data.id_utilisateur}`, dForm)
      toast.success('Domaines mis à jour.')
      fetchAll()
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.')
    }
  }

  // ─── TICKET CRUD ──────────────────────────────────────────────────
  const saveTicket = async () => {
    try {
      await api.put(`/admin/tickets/${modal.data.id_ticket}`, tForm)
      toast.success('Ticket modifié.')
      fetchAll()
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification.')
    }
  }

  // ─── DEMANDE ACHAT CRUD ───────────────────────────────────────────
  const validerDemande = async (id) => {
    try {
      await api.post(`/demandes-achat/${id}/valider`)
      toast.success('Demande d\'achat validée.')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation.')
    }
  }

  const rejeterDemande = async (id) => {
    try {
      await api.post(`/demandes-achat/${id}/rejeter`)
      toast.success('Demande d\'achat rejetée.')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du rejet.')
    }
  }

  const deleteDemande = async (id) => {
    if (!confirm('Supprimer cette déclaration niveau +2 ?')) return
    try {
      await api.delete(`/demandes-achat/${id}`)
      toast.success('Déclaration supprimée.')
      fetchAll()
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Cette déclaration n\'existe plus.')
      } else {
        toast.error(err.response?.data?.message || 'Impossible de supprimer la déclaration.')
      }
      fetchAll() // Rafraîchir les données même en cas d'erreur
    }
  }

  const saveRapport = async () => {
    try {
      await api.put(`/admin/rapports/${modal.data.id_rapport}`, rapForm)
      toast.success('Rapport modifié.')
      fetchAll()
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification.')
    }
  }

  if (loading && !stats) return <PageLoader />

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bonjour, Administrateur 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Voici un aperçu de l'activité des tickets.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === t.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* KPI */}
      {tab === 'stats' && stats && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total tickets', val: stats.total_tickets, color: 'bg-primary-50 text-primary-600' },
              { label: 'Ouverts', val: stats.tickets_ouvert, color: 'bg-blue-50 text-blue-600' },
              { label: 'En cours', val: stats.tickets_en_cours, color: 'bg-yellow-50 text-yellow-600' },
              { label: 'En attente', val: stats.tickets_en_attente, color: 'bg-orange-50 text-orange-600' },
              { label: 'Clôturés', val: stats.tickets_cloture, color: 'bg-green-50 text-green-600' },
              { label: 'Critiques', val: stats.tickets_critique, color: 'bg-red-50 text-red-600' },
              { label: 'Utilisateurs', val: stats.total_utilisateurs, color: 'bg-indigo-50 text-indigo-600' },
              { label: 'Traiteurs', val: stats.total_traiteurs, color: 'bg-purple-50 text-purple-600' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card text-center"
              >
                <p className={`text-3xl font-extrabold ${s.color.split(' ')[1]}`}>{s.val}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6">
            <KpiPage />
          </div>
        </>
      )}

      {/* UTILISATEURS */}
      {tab === 'utilisateurs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Utilisateurs ({utilisateurs.length})</h2>
            <button onClick={() => openModal('add_user')} className="btn-primary text-sm">
              <Plus size={15} /> Ajouter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Nom', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u, i) => (
                  <tr key={u.id_utilisateur} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                          {u.nom?.charAt(0).toUpperCase()}
                        </div>
                        {u.nom}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-primary-50 text-primary-700 capitalize">{u.role?.nom_role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${u.actif ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                        {u.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal('edit_user', u)} className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all" title="Modifier">
                          <Edit2 size={14} />
                        </button>
                        {u.actif ? (
                          <button onClick={async () => {
                            if (!confirm('Désactiver cet utilisateur ?')) return
                            try {
                              await api.patch(`/admin/utilisateurs/${u.id_utilisateur}/desactiver`)
                              toast.success('Utilisateur désactivé.')
                              fetchAll()
                            } catch (err) {
                              toast.error(err.response?.data?.message || 'Erreur.')
                            }
                          }} className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all" title="Désactiver">
                            <Eye size={14} />
                          </button>
                        ) : (
                          <button onClick={async () => {
                            if (!confirm('Réactiver cet utilisateur ?')) return
                            try {
                              await api.patch(`/admin/utilisateurs/${u.id_utilisateur}/activer`)
                              toast.success('Utilisateur réactivé.')
                              fetchAll()
                            } catch (err) {
                              toast.error(err.response?.data?.message || 'Erreur.')
                            }
                          }} className="p-1.5 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all" title="Réactiver">
                            <Eye size={14} />
                          </button>
                        )}
                        <button onClick={() => deleteUser(u.id_utilisateur)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ROLES */}
      {tab === 'roles' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Rôles ({roles.length})</h2>
            <button onClick={() => { setRForm({ nom_role: '' }); openModal('add_role') }} className="btn-primary text-sm">
              <Plus size={15} /> Ajouter
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {roles.map(r => (
              <div key={r.id_role} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
                <span className="font-semibold text-gray-800 capitalize">{r.nom_role}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setRForm({ nom_role: r.nom_role }); openModal('edit_role', r) }} className="p-1 text-gray-400 hover:text-primary-500 rounded transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={async () => { if (!confirm('Supprimer ?')) return; await api.delete(`/admin/roles/${r.id_role}`); toast.success('Supprimé.'); fetchAll() }} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CATEGORIES */}
      {tab === 'categories' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Catégories ({categories.length})</h2>
            <button onClick={() => { setCForm({ nom: '' }); openModal('add_cat') }} className="btn-primary text-sm">
              <Plus size={15} /> Ajouter
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(c => (
              <div key={c.id_categorie} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
                <span className="font-semibold text-gray-800">{c.nom}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setCForm({ nom: c.nom }); openModal('edit_cat', c) }} className="p-1 text-gray-400 hover:text-primary-500 rounded transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={async () => { if (!confirm('Supprimer ?')) return; await api.delete(`/admin/categories/${c.id_categorie}`); toast.success('Supprimé.'); fetchAll() }} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DOMAINES */}
      {tab === 'domaines' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h2 className="font-bold text-gray-900 mb-5">Domaines des traiteurs ({domaines.traiteurs?.length ?? 0})</h2>
          {domaines.traiteurs?.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Aucun traiteur trouvé.</p>
          ) : (
            <div className="space-y-4">
              {domaines.traiteurs.map(t => (
                <div key={t.id_utilisateur} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                        {t.nom?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{t.nom}</h3>
                        <p className="text-sm text-gray-500">{t.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal('edit_domaines', t)}
                        className="btn-primary text-sm"
                      >
                        <Edit2 size={14} /> Gérer domaines
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Supprimer ce traiteur ?')) return
                          try {
                            await api.delete(`/admin/utilisateurs/${t.id_utilisateur}`)
                            toast.success('Traiteur supprimé.')
                            fetchAll()
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.categories?.length > 0 ? (
                      t.categories.map(c => (
                        <span key={c.id_categorie} className="badge bg-primary-50 text-primary-700">
                          {c.nom}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">Aucun domaine assigné</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* RAPPORTS */}
      {tab === 'rapports' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h2 className="font-bold text-gray-900 mb-5">Rapports générés ({rapports.length})</h2>
          {rapports.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Aucun rapport généré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['#', 'Description', 'Date génération', 'Date fermeture', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rapports.map(r => (
                    <tr key={r.id_rapport} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-primary-500">#{r.id_rapport}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{r.description}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(r.date_generation).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-4 text-gray-500">{r.date_fermeture ? new Date(r.date_fermeture).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('view_rapport', r)}
                            className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => openModal('edit_rapport', r)}
                            className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteRapport(r.id_rapport)}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* DÉCLARATIONS NIVEAU +2 */}
      {tab === 'demandes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h2 className="font-bold text-gray-900">Déclarations niveau +2 ({demandes.length})</h2>
            <div className="flex gap-3">
              <select
                className="input text-sm"
                value={demandesFilter.statut}
                onChange={e => {
                  setDemandesFilter(prev => ({ ...prev, statut: e.target.value }))
                  setTimeout(fetchDemandes, 0) // Rafraîchir immédiatement
                }}
              >
                <option value="tous">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="validee">Validée</option>
                <option value="refusee">Rejetée</option>
              </select>
              <button onClick={fetchDemandes} className="btn-secondary">
                <RefreshCw size={16} /> Actualiser
              </button>
            </div>
          </div>
          {demandes.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Aucune déclaration trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['#', 'Ticket', 'Objet', 'Prestataire', 'Statut', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demandes.map(d => (
                    <tr key={d.id_demande} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-primary-500">#{d.id_demande}</td>
                      <td className="py-3 px-4 font-semibold text-gray-700">#{d.id_ticket}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{d.objet}</td>
                      <td className="py-3 px-4 text-gray-500">{d.email_prestataire}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${d.statut === 'en_attente' ? 'bg-yellow-50 text-yellow-700' :
                          d.statut === 'validee' ? 'bg-green-50 text-green-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                          {d.statut === 'en_attente' ? 'En attente' :
                            d.statut === 'validee' ? 'Validée' :
                              'Rejetée'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(d.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {d.statut === 'en_attente' && isRole('validateur') && (
                            <>
                              <button
                                onClick={() => validerDemande(d.id_demande)}
                                className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                                title="Valider"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => rejeterDemande(d.id_demande)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                title="Rejeter"
                              >
                                ✗
                              </button>
                            </>
                          )}
                          {isRole('validateur', 'admin') && (
                            <button
                              onClick={() => deleteDemande(d.id_demande)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/tickets/${d.id_ticket}`, '_blank')}
                            className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                            title="Voir ticket"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}



      {/* MODALS */}
      {/* Add/Edit User */}
      <Modal open={modal.open && (modal.type === 'add_user' || modal.type === 'edit_user')} onClose={closeModal}
        title={modal.type === 'add_user' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}>
        <div className="space-y-4">
          <div>
            <label className="label">Nom complet</label>
            <input className="input" value={uForm.nom} onChange={e => setUForm(p => ({ ...p, nom: e.target.value }))} placeholder="Nom complet" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={uForm.email} onChange={e => setUForm(p => ({ ...p, email: e.target.value }))} placeholder="email@chaabilld.ma" />
          </div>
          <div>
            <label className="label">{modal.type === 'edit_user' ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}</label>
            <input className="input" type="password" value={uForm.password} onChange={e => setUForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Rôle</label>
            <select className="input" value={uForm.id_role} onChange={e => {
              const roleId = e.target.value
              const selectedRole = roles.find(r => r.id_role == roleId)
              setUForm(p => ({
                ...p,
                id_role: roleId,
                categories: selectedRole?.nom_role === 'traiteur' ? p.categories : []
              }))
            }}>
              <option value="">Sélectionner un rôle</option>
              {roles.map(r => <option key={r.id_role} value={r.id_role}>{r.nom_role}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Statut</label>
            <select className="input" value={uForm.actif ? 'actif' : 'inactif'} onChange={e => setUForm(p => ({ ...p, actif: e.target.value === 'actif' }))}>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          {uForm.id_role && (() => {
            const selectedRole = roles.find(r => r.id_role == uForm.id_role)
            return selectedRole?.nom_role === 'traiteur'
          })() && (
              <div>
                <label className="label">Domaines (catégories gérées)</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {categories.map(c => (
                    <label key={c.id_categorie} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={uForm.categories.includes(c.id_categorie)}
                        onChange={e => {
                          const checked = e.target.checked
                          setUForm(prev => ({
                            ...prev,
                            categories: checked
                              ? [...prev.categories, c.id_categorie]
                              : prev.categories.filter(id => id !== c.id_categorie)
                          }))
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{c.nom}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sélectionnez les catégories que ce traiteur peut gérer. Si aucune n'est sélectionnée, il pourra gérer tous les tickets.
                </p>
              </div>
            )}
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button onClick={saveUser} className="btn-primary flex-1 justify-center">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Role */}
      <Modal open={modal.open && (modal.type === 'add_role' || modal.type === 'edit_role')} onClose={closeModal}
        title={modal.type === 'add_role' ? 'Ajouter un rôle' : 'Modifier le rôle'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Nom du rôle</label>
            <input className="input" value={rForm.nom_role} onChange={e => setRForm({ nom_role: e.target.value })} placeholder="Ex: superviseur" />
          </div>
          <div className="flex gap-3">
            <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button onClick={saveRole} className="btn-primary flex-1 justify-center">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Categorie */}
      <Modal open={modal.open && (modal.type === 'add_cat' || modal.type === 'edit_cat')} onClose={closeModal}
        title={modal.type === 'add_cat' ? 'Ajouter une catégorie' : 'Modifier la catégorie'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Nom de la catégorie</label>
            <input className="input" value={cForm.nom} onChange={e => setCForm({ nom: e.target.value })} placeholder="Ex: Réseau" />
          </div>
          <div className="flex gap-3">
            <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button onClick={saveCat} className="btn-primary flex-1 justify-center">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* Edit Domaines */}
      <Modal open={modal.open && modal.type === 'edit_domaines'} onClose={closeModal}
        title={`Gérer les domaines de ${modal.data?.nom}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Catégories gérées par ce traiteur</label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {domaines.categories?.map(c => (
                <label key={c.id_categorie} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={dForm.categories.includes(c.id_categorie)}
                    onChange={e => {
                      const checked = e.target.checked
                      setDForm(prev => ({
                        ...prev,
                        categories: checked
                          ? [...prev.categories, c.id_categorie]
                          : prev.categories.filter(id => id !== c.id_categorie)
                      }))
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{c.nom}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Sélectionnez les catégories que ce traiteur peut gérer. Si aucune catégorie n'est sélectionnée, il pourra gérer tous les tickets.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button onClick={saveDomaines} className="btn-primary flex-1 justify-center">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* Edit Ticket */}
      <Modal open={modal.open && modal.type === 'edit_ticket'} onClose={closeModal}
        title={`Modifier le ticket #${modal.data?.id_ticket}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Objet du ticket</label>
            <input
              className="input"
              value={tForm.objet_ticket}
              onChange={e => setTForm(p => ({ ...p, objet_ticket: e.target.value }))}
              placeholder="Objet du ticket"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px] resize-none"
              value={tForm.description}
              onChange={e => setTForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description détaillée"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priorité</label>
              <select
                className="input"
                value={tForm.priorite}
                onChange={e => setTForm(p => ({ ...p, priorite: e.target.value }))}
              >
                <option value="faible">Faible</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
                <option value="critique">Critique</option>
              </select>
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select
                className="input"
                value={tForm.id_categorie}
                onChange={e => setTForm(p => ({ ...p, id_categorie: e.target.value }))}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => (
                  <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button onClick={saveTicket} className="btn-primary flex-1 justify-center">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* View/Edit Rapport */}
      <Modal open={modal.open && (modal.type === 'view_rapport' || modal.type === 'edit_rapport')} onClose={closeModal}
        title={`${modal.type === 'view_rapport' ? 'Détails du' : 'Modifier le'} rapport #${modal.data?.id_rapport}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px] resize-none"
              value={rapForm.description}
              onChange={e => setRapForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description du rapport"
              readOnly={modal.type === 'view_rapport'}
            />
          </div>
          <div>
            <label className="label">Notes du traiteur</label>
            <textarea
              className="input min-h-[100px] resize-none"
              value={rapForm.notes_traiteur}
              onChange={e => setRapForm(p => ({ ...p, notes_traiteur: e.target.value }))}
              placeholder="Notes détaillées du traiteur"
              readOnly={modal.type === 'view_rapport'}
            />
          </div>
          {modal.data && (
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Date génération</span>
                <span className="font-semibold text-gray-800">{new Date(modal.data.date_generation).toLocaleDateString('fr-FR')}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Date fermeture</span>
                <span className="font-semibold text-gray-800">{modal.data.date_fermeture ? new Date(modal.data.date_fermeture).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Typologie</span>
                <span className="font-semibold text-gray-800">{modal.data.typologie || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Impact</span>
                <span className="font-semibold text-gray-800">{modal.data.impact ? modal.data.impact.replace('_', ' ').toUpperCase() : '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Sous-catégorie</span>
                <span className="font-semibold text-gray-800">{getSousCategorieName(modal.data.sousCategorie, modal.data.id_sous_categorie)}</span>
              </div>
            </div>
          )}
          {modal.type === 'edit_rapport' && (
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Annuler</button>
              <button onClick={saveRapport} className="btn-primary flex-1 justify-center">Enregistrer</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
