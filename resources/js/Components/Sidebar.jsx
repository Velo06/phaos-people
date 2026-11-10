import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Logo from '@/Components/Logo';

const Sidebar = React.memo(({ authUser }) => {
    const { url } = usePage();
    const role = authUser?.role || 'Collaborateur';

    // Helper pour les liens actifs
    const isActive = (path) => url.startsWith(path);

    const getLinkClass = (path) => `
        flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150
        ${isActive(path)
            ? 'bg-[#004B87] text-white shadow-sm shadow-sky-900/20 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }
    `;

    return (
        <aside
            className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between shrink-0 select-none"
            aria-label="Navigation principale"
        >
            <div className="p-4">
                {/* Logo PHAOS PEOPLE en Haut à Gauche */}
                <div className="pb-6 pt-2 border-b border-slate-100 mb-4 px-2">
                    <Logo />
                </div>

                {/* Section rôle dynamique */}
                <div className="px-3 py-1.5 mb-3 rounded bg-sky-50 border border-sky-100 text-center">
                    <span className="text-[11px] font-bold tracking-wider text-[#004B87] uppercase">
                        ESPACE {role.toUpperCase()}
                    </span>
                </div>

                {/* Arborescence de Navigation d'après la maquette */}
                <nav className="space-y-1" aria-label="Menu latéral">
                    <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        <span>Tableau de bord</span>
                    </Link>

                    <Link href="/profil" className={getLinkClass('/profil')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <span>Profil</span>
                    </Link>

                    {/* Section Onboarding & Academy */}
                    <div className="pt-2">
                        <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            ONBOARDING
                        </div>
                        <Link href="/onboarding/formation" className={getLinkClass('/onboarding/formation')}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                            <span>Formation</span>
                        </Link>
                    </div>

                    {/* Section Congés */}
                    <div className="pt-2">
                        <Link href="/absences" className={getLinkClass('/absences')}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            <span>Demande d'absence</span>
                        </Link>
                    </div>

                    {/* Liens spécifiques aux Chefs N+1, RH & Direction */}
                    {(role === 'Chef Hiérarchique' || role === 'RH' || role === 'Direction' || role === 'Administrateur Système') && (
                        <div className="pt-3 border-t border-slate-100 mt-3">
                            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                MANAGEMENT & SUIVI
                            </div>
                            <Link href="/management/suivi-onboarding" className={getLinkClass('/management/suivi-onboarding')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"/></svg>
                                <span>Suivi Onboarding</span>
                            </Link>
                            <Link href="/management/validation-absences" className={getLinkClass('/management/validation-absences')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>Demandes à valider</span>
                            </Link>
                        </div>
                    )}

                    {/* Liens spécifiques RH & Direction */}
                    {(role === 'RH' || role === 'Direction' || role === 'Administrateur Système') && (
                        <div className="pt-2">
                            <Link href="/rh/dossiers" className={getLinkClass('/rh/dossiers')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                                <span>Dossiers Collaborateurs</span>
                            </Link>
                            <Link href="/rh/documents-onboarding" className={getLinkClass('/rh/documents-onboarding')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                <span>Docs Onboarding</span>
                            </Link>
                            <Link href="/rh/collaborateur/creer" className={getLinkClass('/rh/collaborateur/creer')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                                <span>Comptes Collaborateurs</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>

            {/* Pied de Sidebar : Widget Aide ? conforme à la maquette */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                    onClick={() => alert('Support RH & Technique : contact@phaos.mg')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-sky-500 hover:text-[#004B87] transition-all"
                >
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Aide ?
                    </span>
                    <span className="text-slate-400">⌘H</span>
                </button>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
