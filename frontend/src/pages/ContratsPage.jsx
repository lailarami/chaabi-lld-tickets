import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function ContratsPage() {
    const [contrats, setContrats] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ produit: '', type: 'licence', description: '', date_debut: '', date_fin: '' })
    const [filters, setFilters] = useState({ produit: '', type: '' })
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [selectedContratIds, setSelectedContratIds] = useState([])

    const fetchContrats = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/contrats')
            setContrats(data)
        } catch (error) {
            toast.error('Impossible de charger les contrats.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchContrats()
    }, [])

    const resetForm = () => {
        setForm({ produit: '', type: 'licence', description: '', date_debut: '', date_fin: '' })
        setEditingId(null)
    }

    const getContractTypeLabel = (contrat) => {
        const value = (contrat.type || contrat.licence || '').toString().toLowerCase()
        if (value === 'contrat') return 'Contrat'
        if (value === 'licence') return 'Licence'
        return contrat.type || contrat.licence || '—'
    }

    const getContractTypeValue = (contrat) => {
        const value = (contrat.type || contrat.licence || '').toString().toLowerCase()
        return value === 'contrat' ? 'contrat' : 'licence'
    }

    const handleSave = async () => {
        if (!form.produit.trim() || !form.type || !form.date_debut || !form.date_fin) {
            toast.error('Les champs Produit, Type, Date début et Date fin sont obligatoires.')
            return
        }

        setSubmitting(true)
        const payload = {
            produit: form.produit.trim(),
            type: form.type,
            licence: form.type,
            date_debut: form.date_debut,
            date_fin: form.date_fin,
        }

        if (form.description.trim()) {
            payload.description = form.description.trim()
        }

        try {
            if (editingId) {
                const { data } = await api.put(`/contrats/${editingId}`, payload)
                setContrats(prev => prev.map((contrat) => contrat.id === editingId ? data.contrat : contrat))
                toast.success('Contrat mis à jour avec succès.')
            } else {
                const { data } = await api.post('/contrats', payload)
                setContrats(prev => [data.contrat, ...prev])
                toast.success('Contrat créé avec succès.')
            }
            resetForm()
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Erreur lors de l’enregistrement du contrat.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (contrat) => {
        setEditingId(contrat.id)
        setForm({
            produit: contrat.produit || '',
            type: getContractTypeValue(contrat),
            description: contrat.description || '',
            date_debut: contrat.date_debut?.slice(0, 10) || '',
            date_fin: contrat.date_fin?.slice(0, 10) || '',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const matchesFilters = (contrat) => {
        const produitMatch = contrat.produit.toLowerCase().includes(filters.produit.toLowerCase())
        const typeValue = (contrat.type || contrat.licence || '').toString().toLowerCase()
        const typeMatch = filters.type.trim() === '' || typeValue.includes(filters.type.toLowerCase())
        return produitMatch && typeMatch
    }

    const filteredContrats = contrats.filter(matchesFilters)

    useEffect(() => {
        setSelectedContratIds(prev => prev.filter(id => filteredContrats.some(contrat => contrat.id === id)))
    }, [filteredContrats])

    const expiringContracts = filteredContrats.filter((contrat) => {
        const dateFin = new Date(contrat.date_fin)
        const now = new Date()
        const limit = new Date(now)
        limit.setMonth(limit.getMonth() + 2)
        return dateFin <= limit
    })

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const formatted = new Date(dateString).toLocaleDateString('fr-FR')
        return `\'${formatted}`
    }

    const isAllContratsSelected = filteredContrats.length > 0 && selectedContratIds.length === filteredContrats.length

    const toggleSelectAllContrats = () => {
        if (isAllContratsSelected) {
            setSelectedContratIds([])
            return
        }
        setSelectedContratIds(filteredContrats.map(contrat => contrat.id))
    }

    const toggleContratSelection = (id) => {
        setSelectedContratIds(prev => prev.includes(id)
            ? prev.filter(item => item !== id)
            : [...prev, id]
        )
    }

    const exportContratsToCsv = (contratsToExport, fileName) => {
        if (contratsToExport.length === 0) {
            toast.error('Aucun contrat à exporter.')
            return
        }

        const rows = [
            ['Produit', 'Type', 'Description', 'Date début', 'Date fin'],
            ...contratsToExport.map((contrat) => [
                contrat.produit,
                getContractTypeLabel(contrat),
                contrat.description || '',
                formatDate(contrat.date_debut),
                formatDate(contrat.date_fin),
            ]),
        ]

        const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\r\n')
        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportSelectedContrats = () => {
        if (selectedContratIds.length === 0) {
            toast.error('Veuillez sélectionner au moins un contrat à exporter.')
            return
        }
        const selectedContrats = filteredContrats.filter(contrat => selectedContratIds.includes(contrat.id))
        exportContratsToCsv(selectedContrats, `contrats_selection_export_${new Date().toISOString().split('T')[0]}.csv`)
    }

    const exportAllContrats = () => {
        exportContratsToCsv(filteredContrats, `contrats_export_${new Date().toISOString().split('T')[0]}.csv`)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Contrats</h1>
                    <p className="text-gray-600 mt-2">Gérez les contrats d'achat et de licence pour l'administration et les traiteurs.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? 'Modifier un contrat' : 'Ajouter un nouveau contrat'}</h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                            <input
                                value={form.produit}
                                onChange={(e) => setForm(prev => ({ ...prev, produit: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Produit"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, type: 'licence' }))}
                                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${form.type === 'licence'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Licence
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, type: 'contrat' }))}
                                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${form.type === 'contrat'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Contrat
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full min-h-[120px] resize-y px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Description du contrat"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                            <input
                                type="date"
                                value={form.date_debut}
                                onChange={(e) => setForm(prev => ({ ...prev, date_debut: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                            <input
                                type="date"
                                value={form.date_fin}
                                onChange={(e) => setForm(prev => ({ ...prev, date_fin: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 justify-end">
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-gray-700 rounded-lg border border-gray-200 px-5 py-2.5 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Plus size={16} />
                            {submitting ? (editingId ? 'Mise à jour...' : 'Création...') : (editingId ? 'Mettre à jour le contrat' : 'Créer le contrat')}
                        </button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Liste des contrats</h2>
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 md:justify-end w-full md:w-auto">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full md:w-auto md:order-1">
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Filtrer par produit</span>
                                    <input
                                        value={filters.produit}
                                        onChange={(e) => setFilters(prev => ({ ...prev, produit: e.target.value }))}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Produit"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Filtrer par type</span>
                                    <input
                                        value={filters.type}
                                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Licence ou Contrat"
                                    />
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2 md:order-2">
                                <button
                                    type="button"
                                    onClick={exportSelectedContrats}
                                    className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                                >
                                    Exporter sélection
                                </button>
                                <button
                                    type="button"
                                    onClick={exportAllContrats}
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                                >
                                    Exporter tous
                                </button>
                            </div>
                        </div>
                    </div>

                    {expiringContracts.length > 0 && (
                        <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                            <strong>Alerte contrat :</strong> {expiringContracts.length} contrat{expiringContracts.length > 1 ? 's' : ''} arrive{expiringContracts.length > 1 ? 'nt' : ' à'} échéance dans moins de 2 mois.
                            <div className="mt-3 space-y-2">
                                {expiringContracts.map((contrat) => (
                                    <div key={contrat.id} className="rounded-xl bg-white p-3 border border-orange-100 shadow-sm">
                                        <div className="flex flex-col gap-1 text-sm text-gray-700">
                                            <span><span className="font-semibold">Produit :</span> {contrat.produit}</span>
                                            <span><span className="font-semibold">Type :</span> {getContractTypeLabel(contrat)}</span>
                                            <span><span className="font-semibold">Fin :</span> {formatDate(contrat.date_fin)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-gray-600">Chargement des contrats...</div>
                    ) : contrats.length === 0 ? (
                        <div className="text-gray-600">Aucun contrat trouvé.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="border-b border-gray-200 px-4 py-3 text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={isAllContratsSelected}
                                                onChange={toggleSelectAllContrats}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-gray-600">Produit</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-gray-600">Type</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-gray-600">Description</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-gray-600">Date début</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-gray-600">Date fin</th>
                                        <th className="border-b border-gray-200 px-4 py-3 text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContrats.map((contrat) => (
                                        <tr key={contrat.id} className="hover:bg-gray-50">
                                            <td className="border-b border-gray-100 px-4 py-3 text-gray-900">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContratIds.includes(contrat.id)}
                                                    onChange={() => toggleContratSelection(contrat.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="border-b border-gray-100 px-4 py-3 text-gray-900">{contrat.produit}</td>
                                            <td className="border-b border-gray-100 px-4 py-3 text-gray-900">{getContractTypeLabel(contrat)}</td>
                                            <td className="border-b border-gray-100 px-4 py-3 text-gray-900">{contrat.description || '—'}</td>
                                            <td className="border-b border-gray-100 px-4 py-3 text-gray-900">{new Date(contrat.date_debut).toLocaleDateString('fr-FR')}</td>
                                            <td className="border-b border-gray-100 px-4 py-3 text-gray-900">{new Date(contrat.date_fin).toLocaleDateString('fr-FR')}</td>
                                            <td className="border-b border-gray-100 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                                <button
                                                    onClick={() => handleEdit(contrat)}
                                                    className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
                                                >
                                                    <Pencil size={16} /> Modifier
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
