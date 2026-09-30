import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Clock, CheckCircle, Lock, AlertCircle } from 'lucide-react'

export default function TicketStatistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/statistics/tickets')
      setStats(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">Erreur lors du chargement</div>
  }

  const isTrateur = stats.userRole === 'traiteur'
  const title = isTrateur ? 'Mes Statistiques' : 'Statistiques Globales'

  const statItems = [
    {
      label: 'Ouverts',
      count: stats.statistiques?.ouvert?.count ?? 0,
      percentage: stats.statistiques?.ouvert?.percentage ?? 0,
      icon: AlertCircle,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      label: 'En Attente',
      count: stats.statistiques?.en_attente?.count ?? 0,
      percentage: stats.statistiques?.en_attente?.percentage ?? 0,
      icon: Clock,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-100',
      textColor: 'text-orange-700',
    },
    {
      label: 'En Cours',
      count: stats.statistiques?.en_cours?.count ?? 0,
      percentage: stats.statistiques?.en_cours?.percentage ?? 0,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
    },
    {
      label: 'Clôturés',
      count: stats.statistiques?.clotures?.count ?? 0,
      percentage: stats.statistiques?.clotures?.percentage ?? 0,
      icon: Lock,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">Total: {stats.total} ticket{stats.total !== 1 ? 's' : ''}</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${item.lightColor} rounded-lg p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${item.textColor}`}>{item.label}</h3>
                <div className={`${item.color} p-3 rounded-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{item.count}</p>
                <p className={`text-sm font-medium ${item.textColor}`}>{item.percentage}% du total</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Total Tickets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-primary-50 rounded-lg p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-primary-700 mb-2">Total Tickets</h3>
        <p className="text-4xl font-bold text-primary-900">{stats.total}</p>
      </motion.div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-sm font-semibold text-gray-600">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full ${item.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pie Chart Simulation */}
      <PieChart stats={stats} statItems={statItems} />
    </div>
  )
}

function PieChart({ stats, statItems }) {
  const displayedItems = statItems.filter((item) => item.count > 0)
  const displayedTotal = displayedItems.reduce((sum, item) => sum + item.count, 0)
  let cumulativePercentage = 0

  const segments = displayedItems.map((item) => {
    const startPercentage = cumulativePercentage
    const percentage = displayedTotal > 0 ? (item.count / displayedTotal) * 100 : 0
    cumulativePercentage += percentage

    return {
      ...item,
      startPercentage,
      percentage,
    }
  })

  if (displayedTotal === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-6 text-gray-800">Répartition des Tickets</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          Aucun ticket disponible
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-lg p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Répartition des Tickets</h3>
      <div className="flex items-center justify-between">
        {/* Pie Chart SVG */}
        <svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="25" />
          {segments.map((segment, index) => {
            const radius = 80
            const circumference = 2 * Math.PI * radius
            const strokeDashoffset = circumference - (segment.percentage / 100) * circumference
            const rotation = (segment.startPercentage / 100) * 360

            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={
                  segment.color === 'bg-orange-500'
                    ? '#f97316'
                    : segment.color === 'bg-blue-500'
                      ? '#3b82f6'
                      : segment.color === 'bg-green-500'
                        ? '#22c55e'
                        : '#a855f7'
                }
                strokeWidth="25"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                transform={`rotate(${rotation} 100 100)`}
              />
            )
          })}
        </svg>

        {/* Legend */}
        <div className="flex-1 ml-8 space-y-3">
          {segments.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full flex-shrink-0 ${item.color === 'bg-orange-500'
                    ? 'bg-orange-500'
                    : item.color === 'bg-blue-500'
                      ? 'bg-blue-500'
                      : item.color === 'bg-green-500'
                        ? 'bg-green-500'
                        : 'bg-purple-500'
                  }`}
              />
              <span className="ml-3 text-sm text-gray-700">
                {item.label}: {item.count} ({Math.round(item.percentage)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
