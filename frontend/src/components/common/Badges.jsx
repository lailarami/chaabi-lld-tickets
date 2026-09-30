export const STATUT_CONFIG = {
  ouvert:    { label: 'Ouvert',      color: 'bg-blue-100 text-blue-700' },
  en_cours:  { label: 'En cours',    color: 'bg-yellow-100 text-yellow-700' },
  en_attente: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
  cloture:   { label: 'Clôturé',     color: 'bg-green-100 text-green-700' },
}

export const PRIORITE_CONFIG = {
  faible:    { label: 'Faible',    color: 'bg-gray-100 text-gray-600' },
  moyenne:   { label: 'Moyenne',   color: 'bg-blue-100 text-blue-600' },
  haute:     { label: 'Haute',     color: 'bg-orange-100 text-orange-600' },
  critique:  { label: 'Critique',  color: 'bg-red-100 text-red-700' },
}

export function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || { label: statut, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`badge ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export function PrioriteBadge({ priorite }) {
  const cfg = PRIORITE_CONFIG[priorite] || { label: priorite, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`badge ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}
