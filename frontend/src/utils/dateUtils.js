export const parseDateValue = (value) => {
    if (!value) return null
    const raw = String(value).trim()
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
    const timeAtMidnightPattern = /^\d{4}-\d{2}-\d{2}[ T]00:00:00(\.0+)?(Z)?$/

    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return null

    return {
        date,
        dateOnly: dateOnlyPattern.test(raw) || timeAtMidnightPattern.test(raw),
    }
}

export const formatDate = (value) => {
    const parsed = parseDateValue(value)
    if (!parsed) return '—'
    return parsed.date.toLocaleDateString('fr-FR')
}

export const formatDateTime = (value) => {
    const parsed = parseDateValue(value)
    if (!parsed) return '—'
    return parsed.dateOnly
        ? parsed.date.toLocaleDateString('fr-FR')
        : parsed.date.toLocaleString('fr-FR')
}
