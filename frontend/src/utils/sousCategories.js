export const SOUS_CATEGORIES_MAP = {
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
    134: 'EXTRA NET CLIENT',
}

export const getSousCategorieName = (sousCategorie, idSousCategorie, subCategories = []) => {
    if (sousCategorie && typeof sousCategorie === 'object' && sousCategorie.nom) {
        return sousCategorie.nom
    }

    const parsedId = Number(idSousCategorie)
    if (!Number.isNaN(parsedId)) {
        const match = Array.isArray(subCategories)
            ? subCategories.find(sub => Number(sub.id) === parsedId)
            : null
        if (match?.nom) {
            return match.nom
        }
    }

    if (idSousCategorie && SOUS_CATEGORIES_MAP[idSousCategorie]) {
        return SOUS_CATEGORIES_MAP[idSousCategorie]
    }

    return '—'
}

export const filterSubcategoriesByCategorie = (subCategories, categorieId) => {
    if (!Array.isArray(subCategories)) return []
    return subCategories.filter(sub => String(sub.id_categorie) === String(categorieId))
}
