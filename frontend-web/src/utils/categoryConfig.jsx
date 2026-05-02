import React from 'react';
import { Radio, ShieldCheck, Globe, Search } from 'lucide-react';

// ─── Config par catégorie ─────────────────────────────────────────────────────
export const CATEGORY_CONFIG = {
    SOC: {
        label: 'Opérations SOC',
        tagline: 'Centre de surveillance continue 24/7 avec réponse aux incidents en temps réel.',
        features: [
            'Monitoring 24/7 par des analystes certifiés',
            'Corrélation d\'événements multi-sources (SIEM)',
            'Réponse aux incidents < 15 minutes',
            'Reporting mensuel détaillé',
        ],
        icon: (size = 28) => <Radio size={size} />,
        accentColor: '#3B82F6',
        textClass: 'text-blue-400',
        bgGradient: 'from-blue-900/40 to-blue-900/5',
        border: 'border-blue-500/30',
        hoverBorder: 'hover:border-blue-500/40',
        glow: 'hover:shadow-[0_10px_40px_rgba(59,130,246,0.12)]',
        headerGradient: 'from-blue-950/70 via-[#0B0E14]/90 to-transparent',
        badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    EDR: {
        label: 'Détection EDR',
        tagline: 'Protection avancée des endpoints contre les menaces zero-day et ransomwares.',
        features: [
            'Détection comportementale en temps réel',
            'Isolation automatique des endpoints infectés',
            'Analyse forensique post-incident',
            'Compatible Windows, macOS, Linux',
        ],
        icon: (size = 28) => <ShieldCheck size={size} />,
        accentColor: '#00F0FF',
        textClass: 'text-cyna-cyan',
        bgGradient: 'from-cyan-900/40 to-cyan-900/5',
        border: 'border-cyan-500/30',
        hoverBorder: 'hover:border-cyna-cyan/40',
        glow: 'hover:shadow-[0_10px_40px_rgba(0,240,255,0.1)]',
        headerGradient: 'from-cyan-950/70 via-[#0B0E14]/90 to-transparent',
        badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    XDR: {
        label: 'Réponse XDR',
        tagline: 'Visibilité unifiée sur l\'ensemble de votre infrastructure hybride.',
        features: [
            'Corrélation cross-couches (réseau, cloud, endpoint)',
            'Détection des menaces APT et latérales',
            'Orchestration automatique de la réponse',
            'Intégration native avec vos outils existants',
        ],
        icon: (size = 28) => <Globe size={size} />,
        accentColor: '#A855F7',
        textClass: 'text-purple-400',
        bgGradient: 'from-purple-900/40 to-purple-900/5',
        border: 'border-purple-500/30',
        hoverBorder: 'hover:border-purple-500/40',
        glow: 'hover:shadow-[0_10px_40px_rgba(168,85,247,0.1)]',
        headerGradient: 'from-purple-950/70 via-[#0B0E14]/90 to-transparent',
        badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    AUDIT: {
        label: 'Audit & Pentest',
        tagline: 'Évaluation proactive de vos vulnérabilités par nos experts certifiés OSCP.',
        features: [
            'Tests d\'intrusion boîte noire / grise / blanche',
            'Audit de configuration et durcissement',
            'Rapport exécutif + technique détaillé',
            'Plan de remédiation priorisé (CVSS)',
        ],
        icon: (size = 28) => <Search size={size} />,
        accentColor: '#10B981',
        textClass: 'text-emerald-400',
        bgGradient: 'from-emerald-900/40 to-emerald-900/5',
        border: 'border-emerald-500/30',
        hoverBorder: 'hover:border-emerald-500/40',
        glow: 'hover:shadow-[0_10px_40px_rgba(52,211,153,0.1)]',
        headerGradient: 'from-emerald-950/70 via-[#0B0E14]/90 to-transparent',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
};

const DEFAULT = {
    label: 'Solution CYNA',
    tagline: 'Solutions de cybersécurité de niveau entreprise.',
    features: ['Protection avancée', 'Support 24/7', 'Mises à jour continues', 'Conformité garantie'],
    icon: (size = 28) => <ShieldCheck size={size} />,
    accentColor: '#00F0FF',
    textClass: 'text-cyna-cyan',
    bgGradient: 'from-slate-900/40 to-slate-900/5',
    border: 'border-white/10',
    hoverBorder: 'hover:border-cyna-cyan/30',
    glow: 'hover:shadow-[0_10px_40px_rgba(0,240,255,0.08)]',
    headerGradient: 'from-slate-900/60 via-[#0B0E14]/90 to-transparent',
    badgeBg: 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan/20',
};

export const getCategoryConfig = (category) => {
    if (!category) return DEFAULT;
    return CATEGORY_CONFIG[category.toString().toUpperCase()] || DEFAULT;
};
