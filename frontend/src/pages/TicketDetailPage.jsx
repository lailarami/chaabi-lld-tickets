import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StatutBadge, PrioriteBadge } from '../components/common/Badges'
import { PageLoader } from '../components/common/Loader'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  ArrowLeft, User, Tag, Calendar, Clock, CheckCircle,
  XCircle, Play, CheckSquare, FileText, History, AlertCircle, RotateCcw
} from 'lucide-react'
import { getSousCategorieName } from '../utils/sousCategories'
import { formatDateTime } from '../utils/dateUtils'

const TIMELINE_STEPS = [
  { statut: 'ouvert', label: 'Ticket créé', icon: FileText },
  { statut: 'en_cours', label: 'Pris en charge', icon: Play },
  { statut: 'en_attente', label: 'En attente', icon: Clock },
  { statut: 'cloture', label: 'Clôturé', icon: CheckCircle },
]
const STATUT_ORDER = { ouvert: 0, en_cours: 1, en_attente: 2, cloture: 3 }


export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isRole } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showReportDetails, setShowReportDetails] = useState(false)
  const [closeForm, setCloseForm] = useState({
    typologie: '',
    id_categorie: '',
    id_sous_categorie: '',
    impact: '',
    urgence: '',
    description: ''
  })
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [showDemandeModal, setShowDemandeModal] = useState(false)
  const [demandeForm, setDemandeForm] = useState({
    email_prestataire: '',
    copy_mail: '',
    objet: '',
    description: '',
    type_contrat: 'hors_contrat',
    piece_jointe: null
  })

  const fetchTicket = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/tickets/${id}`)
      setTicket(data)
    } catch (error) {
      toast.error('Ticket introuvable ou accès refusé.')
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const hardcodedCategories = [
      { id_categorie: 8, nom: 'MATERIEL info' },
      { id_categorie: 9, nom: 'BASE DE DONNEES' },
      { id_categorie: 10, nom: 'RÉSEAU et connexion' },
      { id_categorie: 11, nom: 'APPLICATION' },
      { id_categorie: 12, nom: 'MESSAGERIE' },
      { id_categorie: 13, nom: 'INTERNET' },
      { id_categorie: 14, nom: 'ACTIVE DIRECTORY' },
      { id_categorie: 15, nom: 'LOGICIEL' },
      { id_categorie: 16, nom: 'INFRASTRUCTURE IT' },
      { id_categorie: 17, nom: 'SECURITE IT' },
      { id_categorie: 18, nom: 'Cisco et telephonie' },
      { id_categorie: 19, nom: 'ACCESSOIR INFORMATIQUE' },
      { id_categorie: 20, nom: 'PORTAIL WEB' },
    ];

    const hardcodedSubCategories = [
      { id: 90, nom: 'POST DE TRAVAIL', id_categorie: 8 },
      { id: 91, nom: 'ECRAN', id_categorie: 8 },
      { id: 92, nom: 'IMPRESSION', id_categorie: 8 },
      { id: 93, nom: 'SERVEUR ET STOCKAGE', id_categorie: 8 },
      { id: 94, nom: 'RESEAU ET SWITCH', id_categorie: 8 },
      { id: 95, nom: 'MOBILITE', id_categorie: 8 },
      { id: 96, nom: 'BASE DE DONNEES', id_categorie: 9 },
      { id: 97, nom: 'RÉSEAU ET CONNEXION', id_categorie: 10 },
      { id: 98, nom: 'SAGE', id_categorie: 11 },
      { id: 99, nom: 'LOCPR', id_categorie: 11 },
      { id: 100, nom: 'ONBASE', id_categorie: 11 },
      { id: 101, nom: 'CHAABIOCAS', id_categorie: 11 },
      { id: 102, nom: 'MESSAGERIE', id_categorie: 12 },
      { id: 103, nom: 'INTERNET', id_categorie: 13 },
      { id: 104, nom: 'ACTIVE DIRECTORY', id_categorie: 14 },
      { id: 105, nom: 'INSTALLATION ET DEPLOIEMENT', id_categorie: 15 },
      { id: 106, nom: 'ACCESS ET LICENCE', id_categorie: 15 },
      { id: 107, nom: 'INCIDENT LOGICIEL', id_categorie: 15 },
      { id: 108, nom: 'CONFIGURATION', id_categorie: 15 },
      { id: 109, nom: 'SECURITE LOGICIEL', id_categorie: 15 },
      { id: 110, nom: 'SAUVEGARDE ET RESTEAURATION', id_categorie: 16 },
      { id: 111, nom: 'VIRTUALISATION', id_categorie: 16 },
      { id: 112, nom: 'STOCKAGE', id_categorie: 16 },
      { id: 113, nom: 'ALIMENTATION DATA CENTER', id_categorie: 16 },
      { id: 114, nom: 'ONDULAIRE DATE CENTER', id_categorie: 16 },
      { id: 115, nom: 'DATA CENTER RACK', id_categorie: 16 },
      { id: 116, nom: 'GESTION DES ACCESS', id_categorie: 17 },
      { id: 117, nom: 'NAC', id_categorie: 17 },
      { id: 118, nom: 'SECURITE MESSAGERIE', id_categorie: 17 },
      { id: 119, nom: 'SECURITE DES POSTES', id_categorie: 17 },
      { id: 120, nom: 'SECURITE RESEAU', id_categorie: 17 },
      { id: 121, nom: 'INCIDENT DE SECURITE', id_categorie: 17 },
      { id: 122, nom: 'SECURITE CLOUD', id_categorie: 17 },
      { id: 123, nom: 'SECURITE LOGICIEL', id_categorie: 17 },
      { id: 124, nom: 'TELEPHONIE IP', id_categorie: 18 },
      { id: 125, nom: 'LES LIGNES ET LES COMPTES TEL', id_categorie: 18 },
      { id: 126, nom: 'CENTRE DES CONTACTS', id_categorie: 18 },
      { id: 127, nom: 'RESEAU VOIP', id_categorie: 18 },
      { id: 128, nom: 'GESTION DE CALENDRIER', id_categorie: 18 },
      { id: 129, nom: 'PEREPHIRIQUE', id_categorie: 19 },
      { id: 130, nom: 'CLAVIER', id_categorie: 19 },
      { id: 131, nom: 'SOURIS', id_categorie: 19 },
      { id: 132, nom: 'ALEMENTATION', id_categorie: 19 },
      { id: 133, nom: 'CASQUE', id_categorie: 19 },
      { id: 134, nom: 'EXTRA NET CLIENT', id_categorie: 20 },
    ];

    try {
      const [categoryResponse, subCategoryResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/sous-categories')
      ])
      setCategories(categoryResponse.data)
      setSubCategories(subCategoryResponse.data)
    } catch (error) {
      setCategories(hardcodedCategories)
      setSubCategories(hardcodedSubCategories)
      toast.error('Impossible de charger les catégories depuis le serveur; utilisation d’un fallback local.')
    }
  }

  const doAction = async (action, successMessage) => {
    setActionLoading(action)
    try {
      const { data } = await api.patch(`/tickets/${id}/${action}`)
      setTicket(data.ticket)
      toast.success(successMessage)
    } catch (error) {
      console.error('Action API error:', error)
      const status = error?.response?.status
      const apiMessage = error?.response?.data?.message
      const message = apiMessage || (status ? `Erreur ${status}` : error?.message) || 'Impossible d\'effectuer l\'action.'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCloseTicket = async () => {
    // Validation
    if (!closeForm.typologie || !closeForm.id_categorie || !closeForm.id_sous_categorie || !closeForm.impact || !closeForm.urgence || !closeForm.description.trim()) {
      toast.error('Tous les champs sont obligatoires.')
      return
    }

    const sousCategId = parseInt(closeForm.id_sous_categorie)
    if (isNaN(sousCategId)) {
      toast.error('Veuillez sélectionner une sous-catégorie valide.')
      return
    }

    setActionLoading('resoudre')
    try {
      const { data } = await api.patch(`/tickets/${id}/resoudre`, {
        typologie: closeForm.typologie,
        id_categorie: parseInt(closeForm.id_categorie, 10),
        id_sous_categorie: sousCategId,
        impact: closeForm.impact,
        urgence: closeForm.urgence,
        description: closeForm.description
      })
      setTicket(data.ticket)
      setShowCloseModal(false)
      setCloseForm({ typologie: '', id_categorie: '', id_sous_categorie: '', impact: '', urgence: '', description: '' })
      toast.success('Ticket clôturé !')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de clôturer le ticket.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateDemande = async () => {
    // Validation
    if (!demandeForm.email_prestataire || !demandeForm.objet || !demandeForm.description.trim() || !demandeForm.type_contrat) {
      toast.error('Les champs Email prestataire, Objet, Description et type de contrat sont obligatoires.')
      return
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(demandeForm.email_prestataire)) {
      toast.error('Veuillez entrer une adresse email valide.')
      return
    }

    // Validation copy_mail (si rempli)
    if (demandeForm.copy_mail.trim()) {
      const emails = demandeForm.copy_mail.split(',').map(e => e.trim())
      const allValid = emails.every(email => emailRegex.test(email))
      if (!allValid) {
        toast.error('Veuillez entrer des adresses email valides pour la copie (séparées par virgule).')
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('id_ticket', ticket.id_ticket)
      formData.append('email_prestataire', demandeForm.email_prestataire)
      formData.append('copy_mail', demandeForm.copy_mail)
      formData.append('objet', demandeForm.objet)
      formData.append('description', demandeForm.description)
      formData.append('type_contrat', demandeForm.type_contrat)
      if (demandeForm.piece_jointe) {
        formData.append('piece_jointe', demandeForm.piece_jointe)
      }

      await api.post('/demandes-achat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setTicket(prev => ({ ...prev, statut: 'en_attente' }))
      setShowDemandeModal(false)
      setDemandeForm({ email_prestataire: '', copy_mail: '', objet: '', description: '', type_contrat: 'hors_contrat', piece_jointe: null })
      toast.success('Declaration Niveau +2 créée et en attente de validation.')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de créer la déclaration.')
    }
  }

  useEffect(() => {
    fetchTicket()
    fetchCategories()
  }, [id])

  const formatCreatedAt = (ticket) => {
    if (!ticket?.date_creation) return '—'
    const dateOnly = ticket.date_creation.split('T')[0].split(' ')[0]
    if (ticket.heure_creation) {
      return new Date(`${dateOnly}T${ticket.heure_creation}`).toLocaleString('fr-FR')
    }
    return new Date(dateOnly).toLocaleDateString('fr-FR')
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

  if (loading) return <PageLoader />
  if (!ticket) return null

  const isCurrentTraiteur = ticket.traite_par === user?.id_utilisateur || ticket.id_traiteur === user?.id_utilisateur

  // Vérifier si ce traiteur peut résoudre ce ticket
  // Permis si : c'est un ticket de traiteur OU c'est le traiteur assigné
  const canResolveTicket = () => {
    if (!isRole('traiteur', 'admin')) return false

    const creatorRole = ticket.utilisateur?.role?.nom_role
    if (creatorRole === 'traiteur') {
      // Si créé par un traiteur, n'importe quel traiteur peut le résoudre
      return true
    }
    // Sinon, seulement le traiteur assigné
    return isCurrentTraiteur || (ticket.id_traiteur === null && ticket.traite_par === null)
  }

  const stepIndex = STATUT_ORDER[ticket.statut] ?? 0

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => navigate('/tickets')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors">
          <ArrowLeft size={16} /> Retour aux tickets
        </button>
        <button onClick={() => navigate(`/tickets/${id}/timeline`)} className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-700 transition-colors font-medium">
          <History size={16} /> Historique
        </button>
      </div>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-primary-500 font-bold text-lg">#{ticket.id_ticket}</span>
              <StatutBadge statut={ticket.statut} />
              <PrioriteBadge priorite={ticket.priorite} />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-3">{ticket.objet_ticket}</h1>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">{ticket.description}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-fit">
            {/* Traiteur: prendre en charge */}
            {isRole('traiteur', 'admin') && ticket.statut === 'ouvert' && (
              <button
                onClick={() => doAction('prendre-en-charge', 'Ticket pris en charge !')}
                disabled={!!actionLoading}
                className="btn-primary"
              >
                {actionLoading === 'prendre-en-charge' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={15} />}
                Prendre en charge
              </button>
            )}

            {/* Traiteur: actions sur tickets en cours */}
            {isRole('traiteur', 'admin') && isCurrentTraiteur && (
              <>
                {/* Bouton Declaration Niveau +2 (si en_cours) */}
                {ticket.statut === 'en_cours' && (
                  <button
                    onClick={() => setShowDemandeModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FileText size={15} />
                    Declaration Niveau +2
                  </button>
                )}

                {/* Bouton Mettre en attente (si en_cours) */}
                {ticket.statut === 'en_cours' && (
                  <button
                    onClick={() => doAction('mettre-en-attente', 'Ticket mis en attente')}
                    disabled={!!actionLoading}
                    className="btn-secondary"
                  >
                    {actionLoading === 'mettre-en-attente' ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Clock size={15} />}
                    Mettre en attente
                  </button>
                )}

                {/* Bouton Reprendre (si en_attente) */}
                {ticket.statut === 'en_attente' && (
                  <button
                    onClick={() => doAction('reprendre', 'Ticket repris en charge')}
                    disabled={!!actionLoading}
                    className="btn-secondary"
                  >
                    {actionLoading === 'reprendre' ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Play size={15} />}
                    Reprendre
                  </button>
                )}
              </>
            )}

            {/* Bouton Clôturer - accessible au traiteur assigné ou si ticket de traiteur */}
            {isRole('traiteur', 'admin') && canResolveTicket() && (ticket.statut === 'en_cours' || ticket.statut === 'en_attente') && (
              <button
                onClick={() => setShowCloseModal(true)}
                disabled={!!actionLoading}
                className="btn-primary"
              >
                {actionLoading === 'resoudre' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={15} />}
                Clôturer
              </button>
            )}

            {/* Bouton Rouvrir - traiteur/admin si ticket clôturé ET non confirmé par l'utilisateur */}
            {isRole('traiteur', 'admin') && ticket.statut === 'cloture' && !ticket.confirme_par_utilisateur && (
              <button
                onClick={() => doAction('rouvrir', 'Ticket rouvert avec succès !')}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'rouvrir'
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <RotateCcw size={15} />}
                Rouvrir le ticket
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {isRole('traiteur') && isTicketOverdue(ticket) && (
        <div className="card border border-red-200 bg-red-50 text-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <div>
              <p className="font-semibold">Alerte : ticket ouvert depuis plus de 48 heures</p>
              <p className="text-sm text-red-700">Ce ticket est prioritaire et doit être traité au plus vite.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-4">

          {/* Details */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Informations</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: User, label: 'Créateur', val: ticket.utilisateur?.nom },
                { icon: User, label: 'Traiteur', val: ticket.traiteur?.nom || 'Non assigné' },
                { icon: Tag, label: 'Catégorie', val: ticket.categorie?.nom },
                { icon: Tag, label: 'Sous-catégorie', val: getSousCategorieName(ticket.sousCategorie, ticket.id_sous_categorie, subCategories) },
                { icon: Calendar, label: 'Créé le', val: formatCreatedAt(ticket) },
                { icon: Calendar, label: 'Réouvert le', val: formatDateTime(ticket.date_ouverture_2) },
                { icon: Calendar, label: 'Clôturé le', val: formatDateTime(ticket.date_cloture) },
                { icon: Calendar, label: 'Reclôturé le', val: formatDateTime(ticket.date_cloture_2) },
              ].map(({ icon: Icon, label, val }, i) => (
                <div key={i}>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Icon size={12} /> {label}
                  </dt>
                  <dd className="font-semibold text-gray-800">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Rapport */}
          {ticket.rapport && (
            <div className="card border-l-4 border-green-400 space-y-4">
              {/* En-tête rapport */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <FileText size={18} className="text-green-500" /> Rapport de résolution
                  </h2>
                  <p className="text-sm text-gray-600">{ticket.rapport.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Généré le {new Date(ticket.rapport.date_generation).toLocaleDateString('fr-FR')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportDetails(prev => !prev)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-semibold whitespace-nowrap"
                >
                  {showReportDetails ? '▼ Masquer les détails' : '▶ Voir les détails'}
                </button>
              </div>

              {/* Détails du rapport (extensible) */}
              {showReportDetails && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Typologie</span>
                      <span className="font-semibold text-gray-800">{ticket.rapport.typologie || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Sous-catégorie</span>
                      <span className="font-semibold text-gray-800">{getSousCategorieName(ticket.rapport?.sousCategorie, ticket.rapport?.id_sous_categorie, subCategories)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Impact</span>
                      <span className="font-semibold text-gray-800">{ticket.rapport.impact ? (
                        ticket.rapport.impact === 'pas_impact' ? "Pas d'impact" :
                          ticket.rapport.impact === 'impact_individuel' ? "Impact individuel" :
                            ticket.rapport.impact === 'impact_general' ? "Impact général" :
                              ticket.rapport.impact
                      ) : '—'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Fermé le</span>
                      <span className="font-semibold text-gray-800">{ticket.rapport.date_fermeture ? new Date(ticket.rapport.date_fermeture).toLocaleDateString('fr-FR') : '—'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Notes du traiteur</span>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm">{ticket.rapport.notes_traiteur || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right: Timeline */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card h-fit">
          <h2 className="font-bold text-gray-900 mb-5">Progression</h2>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i <= stepIndex
              const current = i === stepIndex
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${current ? 'bg-primary-500 shadow-md shadow-primary-200 ring-4 ring-primary-100'
                        : done ? 'bg-green-500'
                          : 'bg-gray-200'
                        }`}
                    >
                      <step.icon size={14} className={done || current ? 'text-white' : 'text-gray-400'} />
                    </motion.div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 mb-1 transition-colors ${done && !current ? 'bg-green-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-2 pt-1">
                    <p className={`text-sm font-semibold ${current ? 'text-primary-600' : done ? 'text-green-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {isRole('traiteur', 'validateur', 'admin') && (ticket.demandeAchats || ticket.demande_achats) && (ticket.demandeAchats || ticket.demande_achats).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-orange-500" />
            Déclarations Niveau 2
          </h2>

          <div className="space-y-4">
            {(ticket.demandeAchats || ticket.demande_achats).map((demande, index) => (
              <div key={demande.id_demande} className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{demande.objet}</h3>
                    <p className="text-sm text-gray-600 mt-2">{demande.description}</p>
                  </div>
                  <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${demande.statut === 'validee' ? 'bg-green-100 text-green-700' : demande.statut === 'refusee' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {demande.statut === 'validee' ? 'Validée' : demande.statut === 'refusee' ? 'Refusée' : 'En attente'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="rounded-2xl bg-white p-4 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">Prestataire</p>
                    <p className="font-medium break-words">{demande.email_prestataire}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">Type de contrat</p>
                    <p className="font-medium capitalize">{demande.type_contrat === 'avec_contrat' ? 'Sur contrat' : 'Sur devis'}</p>
                  </div>
                  {demande.copy_mail && (
                    <div className="rounded-2xl bg-white p-4 border border-gray-100 md:col-span-2">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">CC</p>
                      <p className="font-medium break-words">{demande.copy_mail}</p>
                    </div>
                  )}
                </div>

                {demande.piece_jointe && (
                  <div className="mt-4">
                    <span className="text-gray-500 text-sm">Pièce jointe :</span>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/storage/${demande.piece_jointe}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100 transition-colors mt-2 text-sm"
                    >
                      <span>📎</span>
                      <span>Voir la pièce jointe</span>
                    </a>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Créée le {new Date(demande.created_at).toLocaleDateString('fr-FR')} à {new Date(demande.created_at).toLocaleTimeString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Close Ticket Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Clôturer le ticket</h2>
              <p className="text-sm text-gray-600 mb-6">Veuillez remplir tous les champs obligatoires avant de clôturer le ticket.</p>

              <div className="space-y-4">
                {/* Typologie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typologie</label>
                  <select
                    value={closeForm.typologie}
                    onChange={(e) => setCloseForm(prev => ({ ...prev, typologie: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Sélectionner une typologie</option>
                    <option value="Incident">Incident</option>
                    <option value="Demande">Demande</option>
                  </select>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={closeForm.id_categorie}
                    onChange={(e) => setCloseForm(prev => ({ ...prev, id_categorie: e.target.value, id_sous_categorie: '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Sous-catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sous-catégorie</label>
                  <select
                    value={closeForm.id_sous_categorie}
                    onChange={(e) => setCloseForm(prev => ({ ...prev, id_sous_categorie: e.target.value }))}
                    disabled={!closeForm.id_categorie}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {subCategories
                      .filter(sub => Number(sub.id_categorie) === Number(closeForm.id_categorie))
                      .map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.nom}</option>
                      ))}
                    {closeForm.id_categorie && subCategories.filter(sub => Number(sub.id_categorie) === Number(closeForm.id_categorie)).length === 0 && (
                      <option disabled value="">Aucune sous-catégorie disponible</option>
                    )}
                  </select>
                </div>

                {/* Impact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Impact</label>
                  <select
                    value={closeForm.impact}
                    onChange={(e) => setCloseForm(prev => ({ ...prev, impact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Sélectionner un impact</option>
                    <option value="pas_impact">Pas d'impact</option>
                    <option value="impact_individuel">Impact individuel</option>
                    <option value="impact_general">Impact général</option>
                  </select>
                </div>

                {/* Urgence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgence</label>
                  <select
                    value={closeForm.urgence}
                    onChange={(e) => setCloseForm(prev => ({ ...prev, urgence: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Sélectionner le niveau d'urgence</option>
                    <option value="urgent">Urgent</option>
                    <option value="non_urgent">Non urgent</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description </label>
                  <textarea
                    value={closeForm.description}
                    onChange={(e) => setCloseForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    placeholder="Décrivez la résolution du ticket..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCloseTicket}
                  disabled={actionLoading === 'resoudre'}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'resoudre' ? 'Clôture en cours...' : 'Clôturer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Declaration Niveau +2 Modal */}
      {showDemandeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Declaration Niveau +2</h2>
              <p className="text-sm text-gray-600 mb-6">Remplissez les informations du prestataire pour créer une déclaration niveau +2.</p>

              <div className="space-y-4">
                {/* Email Prestataire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📧 Email prestataire <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={demandeForm.email_prestataire}
                    onChange={(e) => setDemandeForm(prev => ({ ...prev, email_prestataire: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="fournisseur@dell.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Destinataire principal du mail</p>
                </div>

                {/* Copy Mail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📨 Copy mail (CC) <span className="text-gray-400 text-xs font-normal">(optionnel)</span></label>
                  <input
                    type="text"
                    value={demandeForm.copy_mail}
                    onChange={(e) => setDemandeForm(prev => ({ ...prev, copy_mail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="email1@chaabi.ma, email2@chaabi.ma"
                  />
                  <p className="text-xs text-gray-500 mt-1">Autres personnes en copie (séparé par virgule)</p>
                </div>

                {/* Type de contrat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat <span className="text-red-500">*</span></label>
                  <div className="flex flex-col gap-3">
                    <label className="inline-flex items-center gap-2 text-gray-700">
                      <input
                        type="radio"
                        name="type_contrat"
                        value="avec_contrat"
                        checked={demandeForm.type_contrat === 'avec_contrat'}
                        onChange={(e) => setDemandeForm(prev => ({ ...prev, type_contrat: e.target.value }))}
                        className="h-4 w-4 text-orange-600 border-gray-300"
                      />
                      Sur contrat
                    </label>
                    <label className="inline-flex items-center gap-2 text-gray-700">
                      <input
                        type="radio"
                        name="type_contrat"
                        value="hors_contrat"
                        checked={demandeForm.type_contrat === 'hors_contrat'}
                        onChange={(e) => setDemandeForm(prev => ({ ...prev, type_contrat: e.target.value }))}
                        className="h-4 w-4 text-orange-600 border-gray-300"
                      />
                      Sur devis
                    </label>
                  </div>
                </div>

                {/* Objet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objet <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={demandeForm.objet}
                    onChange={(e) => setDemandeForm(prev => ({ ...prev, objet: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Objet de la demande..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={demandeForm.description}
                    onChange={(e) => setDemandeForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="Décrivez votre demande d'achat..."
                  />
                </div>

                {/* Pièce Jointe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📎 Pièce jointe <span className="text-gray-400 text-xs font-normal">(optionnel)</span></label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setDemandeForm(prev => ({ ...prev, piece_jointe: e.target.files?.[0] || null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PDF, images ou documents (max 2MB)</p>
                  {demandeForm.piece_jointe && (
                    <p className="text-xs text-green-600 mt-2">✓ {demandeForm.piece_jointe.name}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDemandeModal(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateDemande}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
