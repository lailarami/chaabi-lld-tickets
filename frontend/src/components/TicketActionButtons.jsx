import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Clock, Mail, CheckCircle, Lock, History, AlertCircle } from 'lucide-react'
import api from '../services/api'
import Modal from './common/Modal'

export default function TicketActionButtons({ ticket, onStatusChange }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(null)
  const [formData, setFormData] = useState({ description: '', sujet: '', contenu: '' })
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState({
    sousCategorie: '',
    typologie: '',
    actionType: '',
    notes: ''
  })
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [resolveForm, setResolveForm] = useState({
    typologie: '',
    id_categorie: '',
    id_sous_categorie: '',
    impact: '',
    description: ''
  })
  const [closeForm, setCloseForm] = useState({
    typologie: '',
    id_categorie: '',
    id_sous_categorie: '',
    impact: '',
    description: ''
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [categoryResponse, subCategoryResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/sous-categories')
        ])
        setCategories(categoryResponse.data)
        setSubCategories(subCategoryResponse.data)
      } catch (error) {
        setCategories([])
        setSubCategories([])
        toast.error('Impossible de charger les catégories depuis le serveur.')
      }
    }

    fetchCategories()
  }, [])

  const handleAction = async (action, payload) => {
    setLoading(true)
    try {
      const response = await api.post(`/tickets/${ticket.id_ticket}/${action}`, payload)
      toast.success(response.data.message)
      setFormData({ description: '', sujet: '', contenu: '' })
      setShowModal(null)
      onStatusChange?.(response.data.ticket)
    } catch (error) {
      console.error(`Erreur ${action}:`, error.response?.data || error.message)
      toast.error(error.response?.data?.message || `Erreur lors de l'action`)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const response = await api.get(`/tickets/${ticket.id_ticket}/history`)
      setHistory(response.data)
      setShowHistory(true)
    } catch (error) {
      console.error('Erreur historique:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Erreur lors du chargement de l\'historique')
    }
  }

  const handleMarkPending = () => {
    if (!formData.description) {
      toast.error('Veuillez fournir une description')
      return
    }
    handleAction('mark-pending', { description: formData.description })
  }

  const handleSendEmail = () => {
    if (!formData.sujet || !formData.contenu) {
      toast.error('Veuillez remplir le sujet et le contenu')
      return
    }
    handleAction('send-email', { sujet: formData.sujet, contenu: formData.contenu })
  }

  const handleResolveImmediate = () => {
    if (!resolveForm.typologie || !resolveForm.id_sous_categorie || !resolveForm.impact || !resolveForm.description) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    handleAction('resoudre', resolveForm)
  }

  const handleCloseTicket = () => {
    if (!closeForm.typologie || !closeForm.id_sous_categorie || !closeForm.impact || !closeForm.description) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    handleAction('resoudre', closeForm) // Using resoudre since it handles en_attente to cloture
  }

  const handleAnalysisSubmit = async () => {
    if (!analysis.sousCategorie || !analysis.typologie || !analysis.actionType) {
      toast.error('Veuillez remplir tous les champs d\'analyse')
      return
    }

    setLoading(true)
    try {
      // Mettre à jour le ticket avec l'analyse
      await api.put(`/tickets/${ticket.id_ticket}`, {
        niveau: 2,
        type_action: analysis.actionType,
        notes_traiteur: analysis.notes
      })

      // Selon le type d'action, effectuer l'action appropriée
      if (analysis.actionType === 'ENVOI_EMAIL') {
        await handleAction('send-email', {
          sujet: `Action requise: ${analysis.sousCategorie}`,
          contenu: `Suite à l'analyse du ticket "${ticket.objet_ticket}", nous avons identifié le problème comme ${analysis.sousCategorie} (${analysis.typologie}).\n\n${analysis.notes}`
        })
      } else if (analysis.actionType === 'INTERVENTION_FOURNISSEUR') {
        await handleAction('mark-pending', {
          description: `Analyse: ${analysis.sousCategorie} (${analysis.typologie}). ${analysis.notes}`
        })
      } else if (analysis.actionType === 'RESOLUTION_IMMEDIATE') {
        await handleAction('resolve-immediate', {
          description: `Résolu: ${analysis.sousCategorie} (${analysis.typologie}). ${analysis.notes}`
        })
      }

      setShowAnalysis(false)
      toast.success('Analyse enregistrée et action effectuée')
    } catch (error) {
      toast.error('Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const isResolved = ticket.statut === 'cloture'
  const canAnalyze = ticket.statut === 'en_cours' && ticket.niveau === 1

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canAnalyze && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnalysis(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            <AlertCircle size={18} /> Analyser (Niveau 2)
          </motion.button>
        )}

        {ticket.statut === 'en_cours' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal('pending')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              <Clock size={18} /> En Attente
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal('email')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <Mail size={18} /> Email
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal('resolve')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <CheckCircle size={18} /> Résoudre
            </motion.button>
          </>
        )}

        {ticket.statut === 'en_attente' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal('close')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            <Lock size={18} /> Clôturer
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadHistory}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          <History size={18} /> Historique
        </motion.button>
      </div>

      {/* Modals */}
      {showModal === 'pending' && (
        <Modal title="Marquer en attente" onClose={() => setShowModal(null)}>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description de l'attente (ex: En attente de fournisseur)"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32"
          />
          <button
            onClick={handleMarkPending}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Confirmer'}
          </button>
        </Modal>
      )}

      {showModal === 'email' && (
        <Modal title="Envoyer un email" onClose={() => setShowModal(null)}>
          <input
            type="text"
            value={formData.sujet}
            onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
            placeholder="Sujet du mail"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          />
          <textarea
            value={formData.contenu}
            onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
            placeholder="Contenu du mail"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32"
          />
          <button
            onClick={handleSendEmail}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </Modal>
      )}

      {showModal === 'resolve' && (
        <Modal title="Résoudre le ticket" onClose={() => setShowModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typologie</label>
              <select
                value={resolveForm.typologie}
                onChange={(e) => setResolveForm({ ...resolveForm, typologie: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                <option value="Incident">Incident</option>
                <option value="Demande">Demande</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={resolveForm.id_categorie}
                onChange={(e) => {
                  setResolveForm({ ...resolveForm, id_categorie: e.target.value, id_sous_categorie: '' })
                }}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                {categories.map(cat => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
              <select
                value={resolveForm.id_sous_categorie}
                onChange={(e) => setResolveForm({ ...resolveForm, id_sous_categorie: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
                disabled={!resolveForm.id_categorie}
              >
                <option value="">Sélectionner...</option>
                {subCategories
                  .filter(sub => sub.id_categorie == resolveForm.id_categorie)
                  .map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.nom}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <select
                value={resolveForm.impact}
                onChange={(e) => setResolveForm({ ...resolveForm, impact: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                <option value="pas_impact">PAS D'IMPACT</option>
                <option value="impact_individuel">IMPACT INDIVIDUEL</option>
                <option value="impact_general">IMPACT GÉNÉRAL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description de la résolution</label>
              <textarea
                value={resolveForm.description}
                onChange={(e) => setResolveForm({ ...resolveForm, description: e.target.value })}
                placeholder="Décrivez la résolution apportée..."
                className="w-full border border-gray-300 rounded-lg p-3 h-32"
              />
            </div>

            <button
              onClick={handleResolveImmediate}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Résolution en cours...' : 'Résoudre le ticket'}
            </button>
          </div>
        </Modal>
      )}

      {showModal === 'close' && (
        <Modal title="Clôturer le ticket" onClose={() => setShowModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typologie</label>
              <select
                value={closeForm.typologie}
                onChange={(e) => setCloseForm({ ...closeForm, typologie: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                <option value="Incident">Incident</option>
                <option value="Demande">Demande</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={closeForm.id_categorie}
                onChange={(e) => {
                  setCloseForm({ ...closeForm, id_categorie: e.target.value, id_sous_categorie: '' })
                }}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                {categories.map(cat => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
              <select
                value={closeForm.id_sous_categorie}
                onChange={(e) => setCloseForm({ ...closeForm, id_sous_categorie: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
                disabled={!closeForm.id_categorie}
              >
                <option value="">Sélectionner...</option>
                {subCategories
                  .filter(sub => sub.id_categorie == closeForm.id_categorie)
                  .map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.nom}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <select
                value={closeForm.impact}
                onChange={(e) => setCloseForm({ ...closeForm, impact: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                <option value="pas_impact">PAS D'IMPACT</option>
                <option value="impact_individuel">IMPACT INDIVIDUEL</option>
                <option value="impact_general">IMPACT GÉNÉRAL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description de clôture</label>
              <textarea
                value={closeForm.description}
                onChange={(e) => setCloseForm({ ...closeForm, description: e.target.value })}
                placeholder="Décrivez la clôture..."
                className="w-full border border-gray-300 rounded-lg p-3 h-32"
              />
            </div>

            <button
              onClick={handleCloseTicket}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Clôture en cours...' : 'Clôturer le ticket'}
            </button>
          </div>
        </Modal>
      )}

      {showAnalysis && (
        <Modal title="Analyse du ticket (Niveau 2)" onClose={() => setShowAnalysis(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sous-catégorie du problème
              </label>
              <select
                value={analysis.sousCategorie}
                onChange={(e) => setAnalysis({ ...analysis, sousCategorie: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                <option value="Ordinateur">Ordinateur</option>
                <option value="Imprimante">Imprimante</option>
                <option value="Clavier">Clavier</option>
                <option value="Souris">Souris</option>
                <option value="Écran">Écran</option>
                <option value="Connexion perdue">Connexion perdue</option>
                <option value="Performance lente">Performance lente</option>
                <option value="Erreur de données">Erreur de données</option>
                <option value="Connexion internet">Connexion internet</option>
                <option value="WiFi défaillant">WiFi défaillant</option>
                <option value="VPN">VPN</option>
                <option value="Logiciel métier">Logiciel métier</option>
                <option value="Application web">Application web</option>
                <option value="Erreur applicative">Erreur applicative</option>
                <option value="Email Outlook">Email Outlook</option>
                <option value="Connexion lente">Connexion lente</option>
                <option value="Accès bloqué">Accès bloqué</option>
                <option value="Authentification">Authentification</option>
                <option value="Permissions">Permissions</option>
                <option value="Installation">Installation</option>
                <option value="Mise à jour">Mise à jour</option>
                <option value="Licence">Licence</option>
                <option value="Serveur">Serveur</option>
                <option value="Stockage">Stockage</option>
                <option value="Antivirus">Antivirus</option>
                <option value="Firewall">Firewall</option>
                <option value="Téléphone IP">Téléphone IP</option>
                <option value="Call center">Call center</option>
                <option value="Clé USB">Clé USB</option>
                <option value="Disque dur externe">Disque dur externe</option>
                <option value="Accès portail">Accès portail</option>
                <option value="Performance">Performance</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typologie
              </label>
              <select
                value={analysis.typologie}
                onChange={(e) => setAnalysis({ ...analysis, typologie: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                <option value="Incident">Incident</option>
                <option value="Demande">Demande</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action à effectuer
              </label>
              <select
                value={analysis.actionType}
                onChange={(e) => setAnalysis({ ...analysis, actionType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Sélectionner...</option>
                <option value="RESOLUTION_IMMEDIATE">Résolution immédiate</option>
                <option value="ENVOI_EMAIL">Envoyer email à l'utilisateur</option>
                <option value="INTERVENTION_FOURNISSEUR">Intervention fournisseur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes détaillées
              </label>
              <textarea
                value={analysis.notes}
                onChange={(e) => setAnalysis({ ...analysis, notes: e.target.value })}
                placeholder="Décrivez l'analyse et la solution proposée..."
                className="w-full border border-gray-300 rounded-lg p-3 h-32"
              />
            </div>

            <button
              onClick={handleAnalysisSubmit}
              disabled={loading}
              className="w-full bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Analyse en cours...' : 'Valider l\'analyse'}
            </button>
          </div>
        </Modal>
      )}

      {showHistory && (
        <HistoryModal
          history={history}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  )
}

function HistoryModal({ history, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Historique du ticket</h2>

        {history?.actions?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-lg">Actions</h3>
            <div className="space-y-3">
              {history.actions.map((action) => (
                <div key={action.id} className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="font-medium">{action.type_action}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(action.date_action).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {history?.emails?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-lg">Emails envoyés</h3>
            <div className="space-y-3">
              {history.emails.map((email) => (
                <div key={email.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium">{email.sujet}</p>
                  <p className="text-sm text-gray-600">À: {email.destinataire}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(email.date_envoi).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 mt-4"
        >
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
