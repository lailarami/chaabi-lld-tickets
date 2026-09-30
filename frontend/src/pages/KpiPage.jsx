import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import api from '../services/api'
import { PageLoader } from '../components/common/Loader'

const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const COLORS_CLOSURE = ['#10B981', '#EF4444']
const COLORS_IMPACT = ['#3B82F6', '#9CA3AF']
const COLORS_CATEGORIES = ['#2563EB', '#9333EA', '#F97316', '#14B8A6', '#E11D48', '#0F766E']

export default function KpiPage({ hideHeader = false }) {
    const navigate = useNavigate()
    const currentYear = new Date().getFullYear()
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(currentYear)
    const [kpi, setKpi] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchKpi = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/kpi', { params: { month, year } })
            setKpi(data)
        } catch (err) {
            console.error(err)
            const errorMessage = err.response?.data?.message || err.response?.statusText || err.message || 'Impossible de charger les KPI.'
            toast.error(`Impossible de charger les KPI : ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchKpi()
    }, [month, year])

    const closureData = kpi ? [
        { name: 'Clôturés', value: kpi.clotures },
        { name: 'Non clôturés', value: kpi.non_clotures },
    ] : []

    const impactData = kpi ? [
        { name: 'indisponible de service', value: kpi.impact_avec },
        { name: 'disponible (pas d\'impact)', value: kpi.impact_sans },
    ] : []

    const qualityCards = kpi ? [
        {
            title: 'Clôturés première fois',
            value: kpi.closed_first_time,
            description: 'Clôtures sans réouverture',
            color: 'bg-emerald-50 text-emerald-700',
        },
        {
            title: 'Clôturés après réouverture',
            value: kpi.closed_after_reopen,
            description: 'Deuxième clôture après réouverture',
            color: 'bg-amber-50 text-amber-700',
        },
        {
            title: 'Escalades N+2',
            value: kpi.escalades_n2,
            description: 'Tickets avec déclaration N+2',
            color: 'bg-rose-50 text-rose-700',
        },
    ] : []

    const performanceCards = kpi ? [
        {
            title: 'Temps moyen prise en charge',
            value: kpi.avg_handle_hours,
            unit: 'h',
            description: 'Délai moyen entre création du ticket et prise en charge',
            color: 'bg-indigo-50 text-indigo-700',
        },
        {
            title: 'Temps moyen de résolution',
            value: kpi.avg_resolution_hours,
            unit: 'h',
            description: 'Délai moyen entre prise en charge et clôture',
            color: 'bg-violet-50 text-violet-700',
        },
    ] : []

    const availabilityData = kpi ? [
        {
            label: 'Tickets impactés / critique',
            value: kpi.tickets_impactes_ou_critiques,
            description: 'Tickets avec impact ou priorité critique',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            unit: '',
        },
        {
            label: 'Disponibilité de service',
            value: kpi.disponibilite_generale,
            description: kpi.total === 0 ? 'Aucun ticket ce mois' : 'Taux disponibilité',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            unit: '%',
        },
    ] : []

    const categoryData = kpi?.categories || []

    // Prepare daily counts map for calendar display
    const dailyMap = {}
    if (kpi?.daily) {
        if (Array.isArray(kpi.daily)) {
            kpi.daily.forEach(d => { dailyMap[d.day] = d.count })
        } else {
            Object.assign(dailyMap, kpi.daily)
        }
    }

    const daysInMonth = new Date(year, month, 0).getDate()
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const todayDate = new Date()
    const isCurrentMonthView = (todayDate.getFullYear() === year && (todayDate.getMonth() + 1) === month)

    const [showCalendar, setShowCalendar] = useState(false)

    const handleCalendarClick = () => {
        // Toggle calendar visibility (no navigation)
        setShowCalendar(s => !s)
    }

    const handleDayClick = (day) => {
        // Navigate to tickets list filtered by day/month/year
        navigate(`/tickets?day=${day}&month=${month}&year=${year}`)
    }

    const handleViewNonClosed = () => {
        navigate('/tickets?statut=non_cloture')
    }

    const handleViewImpact = () => {
        navigate('/tickets?impact=has_impact')
    }

    const handleViewPending = () => {
        navigate('/tickets?statut=en_attente')
    }

    const pendingPercentage = kpi?.pourcentage_en_attente ?? 0
    const pendingTotalNonClosed = kpi?.non_clotures ?? 0
    const pendingTickets = kpi?.en_attente ?? 0
    const pendingRadius = 88
    const pendingCircumference = 2 * Math.PI * pendingRadius
    const pendingOffset = pendingCircumference - (pendingPercentage / 100) * pendingCircumference

    if (loading && !kpi) return <PageLoader />

    return (
        <div className="animate-fade-in space-y-6">
            {!hideHeader && (
                <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">KPI Tickets</h1>
                            <p className="text-gray-500 mt-1">Rétablissement et disponibilité des services pour le mois sélectionné.</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft size={16} /> Retour
                        </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Sélectionner le mois</h2>
                            <p className="text-sm text-gray-500">Affiche les KPI sur les tickets créés durant le mois choisi.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="bg-transparent text-sm font-medium text-gray-800 outline-none"
                                >
                                    {MONTHS.map((label, index) => (
                                        <option key={index} value={index + 1}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="bg-transparent text-sm font-medium text-gray-800 outline-none"
                                >
                                    {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {!hideHeader && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Volume</p>
                            <p className="mt-1 text-sm text-gray-500">Total du mois et aujourd'hui</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleCalendarClick}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                            >
                                <CalendarDays size={16} />
                                <span>Voir tickets du mois</span>
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-sm text-gray-500">Total ce mois</p>
                                <p className="text-2xl font-extrabold text-gray-900">{kpi ? kpi.total : '—'}</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-sm text-gray-500">Aujourd'hui</p>
                                <p className="text-2xl font-extrabold text-gray-900">{kpi ? (kpi.today ?? 0) : '—'}</p>
                            </div>
                            {kpi && (
                                <>
                                    <div className="rounded-xl border border-gray-200 bg-amber-50 px-4 py-3">
                                        <p className="text-sm text-amber-600">Urgent</p>
                                        <p className="text-2xl font-extrabold text-amber-800">{kpi.urgence_urgent ?? 0}</p>
                                        <p className="text-xs text-amber-600">{kpi.pourcentage_urgence ?? 0}%</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3">
                                        <p className="text-sm text-slate-500">Non urgent</p>
                                        <p className="text-2xl font-extrabold text-slate-900">{kpi.urgence_non_urgent ?? 0}</p>
                                        <p className="text-xs text-slate-500">{kpi.pourcentage_non_urgence ?? 0}%</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="w-full md:w-auto">
                            {showCalendar ? (
                                <div>
                                    <div className="text-sm text-gray-600 mb-2">Calendrier — {MONTHS[month - 1]} {year}</div>
                                    <div className="grid grid-cols-7 gap-1 text-xs">
                                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                            <div key={i} className="text-center text-gray-400">{d}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 mt-2">
                                        {daysArray.map(day => {
                                            const count = dailyMap[day] ?? 0
                                            const isToday = isCurrentMonthView && day === todayDate.getDate()
                                            return (
                                                <motion.div
                                                    key={day}
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ duration: 0.12 }}
                                                    onClick={() => handleDayClick(day)}
                                                    className={`cursor-pointer min-h-[56px] rounded-md border p-2 flex flex-col items-start justify-between ${isToday ? 'border-primary-600 bg-primary-50' : count > 0 ? 'border-transparent bg-blue-50' : 'border-transparent bg-gray-50'} hover:shadow-sm`}
                                                >
                                                    <div className="text-xs font-medium text-gray-700">{day}</div>
                                                    <div className="text-xs text-gray-500">{count} ticket{count > 1 ? 's' : ''}</div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400">Cliquez sur le bouton pour afficher le calendrier</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Catégories des tickets</p>
                        <p className="mt-1 text-sm text-gray-500">Répartition des tickets par catégorie pour le mois sélectionné.</p>
                    </div>
                </div>

                <div className="h-[320px] w-full">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={70} />
                                <YAxis />
                                <Tooltip formatter={(value) => [value, 'Tickets']} />
                                <Bar dataKey="value" fill="#4F46E5">
                                    {categoryData.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS_CATEGORIES[index % COLORS_CATEGORIES.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="grid h-full place-items-center text-sm text-gray-400">Aucune donnée de catégories disponible.</div>
                    )}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Performance</p>
                        <p className="mt-1 text-sm text-gray-500">Temps moyen de prise en charge et temps moyen de résolution des tickets.</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-700 grid place-items-center">
                        <CalendarDays size={18} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {performanceCards.map((card) => (
                        <div key={card.title} className={`rounded-3xl border border-gray-200 p-5 ${card.color}`}>
                            <p className="text-sm font-semibold uppercase tracking-wide">{card.title}</p>
                            <p className="mt-4 text-4xl font-extrabold text-slate-900">
                                {card.value == null ? `0${card.unit}` : `${card.value}${card.unit}`}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Qualité de résolution</p>
                        <p className="mt-1 text-sm text-gray-500">Premières clôtures, clôtures après réouverture et tickets escaladés N+2.</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-700 grid place-items-center">
                        <CalendarDays size={18} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {qualityCards.map((card) => (
                        <div key={card.title} className={`rounded-3xl border border-gray-200 p-5 ${card.color}`}>
                            <p className="text-sm font-semibold uppercase tracking-wide">{card.title}</p>
                            <p className="mt-4 text-3xl font-extrabold text-slate-900">{card.value == null ? 0 : card.value}</p>
                            <p className="mt-3 text-sm text-slate-600">{card.description}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Disponibilité de service</p>
                        <p className="mt-1 text-sm text-gray-500">Taux de disponibilité calculé sur les tickets sans impact et les tickets impactés.</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-700 grid place-items-center">
                        <CalendarDays size={18} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {availabilityData.map((item) => (
                        <div key={item.label} className={`rounded-3xl border border-gray-200 p-5 ${item.bg}`}>
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{item.label}</p>
                            <p className={`mt-4 text-4xl font-extrabold ${item.text}`}>
                                {item.value === null || item.value === undefined ? 'N/A' : `${item.value}${item.unit ?? ''}`}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {kpi && kpi.total > 0 && kpi.en_attente > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tickets en attente</p>
                            <p className="mt-1 text-sm text-gray-500">Tickets nécessitant une action</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-700 grid place-items-center">
                            <CalendarDays size={18} />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-5">
                        <div className="relative flex items-center justify-center">
                            <div className="relative h-56 w-56">
                                <svg viewBox="0 0 200 200" className="h-full w-full">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r={pendingRadius}
                                        fill="none"
                                        stroke="#E5E7EB"
                                        strokeWidth="18"
                                    />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r={pendingRadius}
                                        fill="none"
                                        stroke="#F97316"
                                        strokeWidth="18"
                                        strokeDasharray={pendingCircumference}
                                        strokeDashoffset={pendingOffset}
                                        strokeLinecap="round"
                                        transform="rotate(-90 100 100)"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                    <p className="text-4xl font-extrabold text-gray-900">{kpi ? `${pendingPercentage.toFixed(1)}%` : '0%'}</p>
                                    <p className="text-sm text-gray-500 uppercase tracking-[0.15em]">non clôturés en attente</p>
                                    <p className="mt-2 text-xs text-gray-500">{kpi ? `${pendingTickets} / ${pendingTotalNonClosed} tickets` : '0 / 0 tickets'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 text-center">
                            <p className="text-sm text-gray-600">{kpi.en_attente} / {kpi.total} tickets en attente</p>
                            <button
                                onClick={handleViewPending}
                                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
                            >
                                Voir tickets en attente
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
