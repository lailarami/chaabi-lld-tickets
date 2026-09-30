import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PRIORITES = [
  { value: 'faible', label: '🟢 Faible', desc: 'Impact limité, peut attendre' },
  { value: 'moyenne', label: '🔵 Moyenne', desc: 'Impact modéré' },
  { value: 'haute', label: '🟠 Haute', desc: 'Impact important' },
  { value: 'critique', label: '🔴 Critique', desc: 'Bloquant, action immédiate' },
]

const TYPOLOGIES = [
  { value: 'Incident', label: 'Incident', desc: 'Un problème ou dysfonctionnement' },
  { value: 'Demande', label: 'Demande', desc: 'Une demande de service ou information' },
]

const IMPACTS = [
  { value: 'pas_impact', label: 'Pas d’impact' },
  { value: 'impact_individuel', label: 'Impact individuel' },
  { value: 'impact_general', label: 'Impact général' },
]

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const { user, isRole } = useAuth()
  const [form, setForm] = useState({ objet_ticket: '', description: '', priorite: 'moyenne', typologie: 'Incident', id_categorie: '', id_sous_categorie: '', impact: '' })
  const [declarationForm, setDeclarationForm] = useState({ type_contrat: 'hors_contrat', email_prestataire: '', copy_mail: '', objet: '', description: '', piece_jointe: null })
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [allSubcategories, setAllSubcategories] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const setDeclaration = (key, val) => {
    setDeclarationForm(p => ({ ...p, [key]: val }))
  }

  const loadSubcategories = async (categorieId) => {
    if (!categorieId) {
      setSubcategories([])
      return
    }

    const filtered = allSubcategories.filter((sub) => String(sub.id_categorie) === String(categorieId))
    if (filtered.length) {
      setSubcategories(filtered)
      return
    }

    try {
      const { data } = await api.get(`/sous-categories?categorie=${categorieId}`)
      setSubcategories(data)
    } catch (error) {
      setSubcategories([])
    }
  }

  const handleCategoryChange = async (value) => {
    setForm(p => ({ ...p, id_categorie: value, id_sous_categorie: '' }))
    setErrors(p => ({ ...p, id_categorie: '', id_sous_categorie: '' }))
    await loadSubcategories(value)
  }

  const validate = () => {
    const errs = {}
    if (!form.objet_ticket.trim()) errs.objet_ticket = 'L\'objet est requis.'
    if (!form.description.trim()) errs.description = 'La description est requise.'
    if (!form.typologie) errs.typologie = 'Veuillez choisir une typologie.'
    if (!form.id_categorie) errs.id_categorie = 'Veuillez choisir une catégorie.'
    if (isRole('traiteur')) {
      if (!form.id_sous_categorie) errs.id_sous_categorie = 'Veuillez choisir une sous-catégorie.'
      if (!form.impact) errs.impact = 'Veuillez choisir l’impact.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const ticketPayload = { ...form }
      if (!ticketPayload.id_sous_categorie) {
        delete ticketPayload.id_sous_categorie
      }
      if (!ticketPayload.impact) {
        delete ticketPayload.impact
      }
      const { data } = await api.post('/tickets', ticketPayload)
      const ticketId = data.ticket.id_ticket
      let declarationMessage = ''
      const hasDeclaration = declarationForm.email_prestataire.trim() && declarationForm.objet.trim() && declarationForm.description.trim()

      if (isRole('traiteur') && hasDeclaration) {
        const declarationData = new FormData()
        declarationData.append('id_ticket', ticketId)
        declarationData.append('email_prestataire', declarationForm.email_prestataire)
        declarationData.append('copy_mail', declarationForm.copy_mail)
        declarationData.append('objet', declarationForm.objet)
        declarationData.append('description', declarationForm.description)
        declarationData.append('type_contrat', declarationForm.type_contrat)
        if (declarationForm.piece_jointe) {
          declarationData.append('piece_jointe', declarationForm.piece_jointe)
        }

        try {
          await api.post('/demandes-achat', declarationData, { headers: { 'Content-Type': 'multipart/form-data' } })
          declarationMessage = ' Déclaration Niveau +2 ajoutée.'
        } catch (error) {
          declarationMessage = ' Le ticket a été créé, mais la déclaration n’a pas pu être ajoutée.'
          toast.error('La déclaration Niveau +2 n’a pas pu être créée. Vérifiez les champs et réessayez.')
        }
      }

      toast.success(`Ticket créé avec succès !${declarationMessage}`)
      navigate(`/tickets/${ticketId}`)
    } catch (err) {
      const errs = err.response?.data?.errors || {}
      setErrors(errs)
      toast.error(err.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories')
        setCategories(data)
      } catch (error) {
        toast.error('Impossible de charger les catégories.')
      }
    }

    const fetchSubcategories = async () => {
      try {
        const { data } = await api.get('/sous-categories')
        setAllSubcategories(data)
      } catch (error) {
        setAllSubcategories([])
      }
    }

    const fetchContracts = async () => {
      try {
        const { data } = await api.get('/contrats')
        setContracts(data)
      } catch (error) {
        // ignore
      }
    }

    fetchCategories()
    fetchSubcategories()
    fetchContracts()
  }, [])

  useEffect(() => {
    if (!form.id_categorie || !allSubcategories.length) {
      return
    }
    setSubcategories(allSubcategories.filter((sub) => String(sub.id_categorie) === String(form.id_categorie)))
  }, [form.id_categorie, allSubcategories])

  const expiringContracts = contracts.filter((contrat) => {
    const dateFin = new Date(contrat.date_fin)
    const now = new Date()
    const limit = new Date(now)
    limit.setMonth(limit.getMonth() + 2)
    return dateFin <= limit
  })

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/tickets')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Retour aux tickets
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        {expiringContracts.length > 0 && (
          <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            <strong>Alerte contrat :</strong> {expiringContracts.length} contrat{expiringContracts.length > 1 ? 's' : ''} arrive{expiringContracts.length > 1 ? 'nt' : ' à'} échéance dans moins de 2 mois.
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Nouveau ticket</h1>
          <p className="text-gray-500 text-sm mt-1">Décrivez votre incident en détail pour une résolution rapide.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Priorité */}
          <div>
            <label className="label">Priorité <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {PRIORITES.map(p => (
                <label
                  key={p.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${form.priorite === p.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="priorite"
                    value={p.value}
                    checked={form.priorite === p.value}
                    onChange={() => set('priorite', p.value)}
                    className="mt-0.5 accent-primary-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>



          {/* Catégorie */}
          <div>
            <label className="label">Catégorie <span className="text-red-400">*</span></label>
            <select
              value={form.id_categorie}
              onChange={e => handleCategoryChange(e.target.value)}
              className={`input ${errors.id_categorie ? 'border-red-300 focus:ring-red-400' : ''}`}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((categorie) => (
                <option key={categorie.id_categorie} value={categorie.id_categorie}>{categorie.nom}</option>
              ))}
            </select>
            {errors.id_categorie && <p className="text-red-500 text-xs mt-1">{errors.id_categorie}</p>}
          </div>

          {isRole('traiteur') && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Sous-catégorie <span className="text-red-400">*</span></label>
                <select
                  value={form.id_sous_categorie}
                  onChange={e => set('id_sous_categorie', e.target.value)}
                  className={`input ${errors.id_sous_categorie ? 'border-red-300 focus:ring-red-400' : ''}`}
                  disabled={!subcategories.length}
                >
                  <option value="">Sélectionnez une sous-catégorie</option>
                  {subcategories.map((sous) => (
                    <option key={sous.id} value={sous.id}>{sous.nom}</option>
                  ))}
                </select>
                {errors.id_sous_categorie && <p className="text-red-500 text-xs mt-1">{errors.id_sous_categorie}</p>}
              </div>
              <div>
                <label className="label">Impact <span className="text-red-400">*</span></label>
                <select
                  value={form.impact}
                  onChange={e => set('impact', e.target.value)}
                  className={`input ${errors.impact ? 'border-red-300 focus:ring-red-400' : ''}`}
                >
                  <option value="">Sélectionnez l’impact</option>
                  {IMPACTS.map((impact) => (
                    <option key={impact.value} value={impact.value}>{impact.label}</option>
                  ))}
                </select>
                {errors.impact && <p className="text-red-500 text-xs mt-1">{errors.impact}</p>}
              </div>
            </div>
          )}

          {/* Typologie */}
          <div>
            <label className="label">Typologie <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {TYPOLOGIES.map(t => (
                <label
                  key={t.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${form.typologie === t.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="typologie"
                    value={t.value}
                    checked={form.typologie === t.value}
                    onChange={() => set('typologie', t.value)}
                    className="mt-0.5 accent-primary-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Objet */}
          <div>
            <label className="label">Objet du ticket <span className="text-red-400">*</span></label>
            <input
              className={`input ${errors.objet_ticket ? 'border-red-300 focus:ring-red-400' : ''}`}
              placeholder="Ex: Problème d'accès au réseau VPN"
              value={form.objet_ticket}
              onChange={e => set('objet_ticket', e.target.value)}
              maxLength={255}
            />
            {errors.objet_ticket && <p className="text-red-500 text-xs mt-1">{errors.objet_ticket}</p>}
            <p className="text-xs text-gray-400 mt-1">{form.objet_ticket.length}/255</p>
          </div>


          {/* Description */}
          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <textarea
              className={`input min-h-32 resize-y ${errors.description ? 'border-red-300 focus:ring-red-400' : ''}`}
              placeholder="Décrivez le problème en détail : quand cela a commencé, les étapes pour reproduire, l'impact..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {isRole('traiteur') && (
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Déclaration Niveau 2</h2>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Type de contrat</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setDeclaration('type_contrat', 'avec_contrat')}
                    className={`flex-1 min-w-[150px] rounded-xl border px-4 py-3 text-sm font-semibold transition ${declarationForm.type_contrat === 'avec_contrat'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Sur contrat
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeclaration('type_contrat', 'hors_contrat')}
                    className={`flex-1 min-w-[150px] rounded-xl border px-4 py-3 text-sm font-semibold transition ${declarationForm.type_contrat === 'hors_contrat'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Sur devis
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Email prestataire</label>
                  <input
                    type="email"
                    value={declarationForm.email_prestataire}
                    onChange={e => setDeclaration('email_prestataire', e.target.value)}
                    className="input"
                    placeholder="prestataire@exemple.com"
                  />
                </div>
                <div>
                  <label className="label">Copy mail (CC)</label>
                  <input
                    type="text"
                    value={declarationForm.copy_mail}
                    onChange={e => setDeclaration('copy_mail', e.target.value)}
                    className="input"
                    placeholder="cc1@chaabi.ma, cc2@chaabi.ma"
                  />
                </div>
                <div>
                  <label className="label">Objet déclaration</label>
                  <input
                    type="text"
                    value={declarationForm.objet}
                    onChange={e => setDeclaration('objet', e.target.value)}
                    className="input"
                    placeholder="Objet de la déclaration"
                  />
                </div>
                <div>
                  <label className="label">Description déclaration</label>
                  <textarea
                    value={declarationForm.description}
                    onChange={e => setDeclaration('description', e.target.value)}
                    className="input min-h-28 resize-y"
                    rows={3}
                    placeholder="Détails pour la déclaration niveau 2"
                  />
                </div>
                <div>
                  <label className="label">Pièce jointe (optionnel)</label>
                  <input
                    type="file"
                    onChange={e => setDeclaration('piece_jointe', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/tickets')} className="btn-secondary flex-1 justify-center">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </span>
              ) : (
                <><Send size={16} /> Créer le ticket</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
