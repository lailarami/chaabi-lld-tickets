import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, X, Loader } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'

export default function TicketConfirmationModal({ open, ticket, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [confirmText, setConfirmText] = useState('')

    const handleConfirm = async () => {
        if (confirmText !== ticket?.id_ticket.toString()) {
            toast.error(`Veuillez saisir le numéro de ticket: ${ticket?.id_ticket}`)
            return
        }

        setLoading(true)
        try {
            const { data } = await api.patch(`/tickets/${ticket.id_ticket}/confirmer-cloture`)
            toast.success('Clôture du ticket confirmée avec succès!')
            setConfirmText('')
            onSuccess && onSuccess(data.ticket)
            onClose()
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Erreur lors de la confirmation.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-6 py-4 flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Confirmer la clôture du ticket</h2>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        Êtes-vous sûr que ce ticket est résolu ?
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5 space-y-4">
                            {/* Ticket Info */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs font-semibold uppercase">N° Ticket</p>
                                        <p className="text-gray-900 font-bold mt-1">#{ticket?.id_ticket}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-semibold uppercase">Statut</p>
                                        <p className="text-gray-900 font-bold mt-1 inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                            Clôturé
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-gray-500 text-xs font-semibold uppercase">Objet</p>
                                    <p className="text-gray-900 mt-1 line-clamp-2">{ticket?.objet_ticket}</p>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800">
                                    Cette action est définitive. Veuillez confirmer que le problème a été complètement résolu.
                                </p>
                            </div>

                            {/* Confirmation Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Pour confirmer, saisissez le numéro de ticket
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder={`Ex: ${ticket?.id_ticket}`}
                                        disabled={loading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        onKeyPress={(e) => e.key === 'Enter' && !loading && handleConfirm()}
                                    />
                                    {confirmText === ticket?.id_ticket.toString() && (
                                        <CheckCircle className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Sachez que vous confirmez la clôture de ce ticket
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-gray-700 font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading || confirmText !== ticket?.id_ticket.toString()}
                                className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Confirmation en cours...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Confirmer la clôture
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
