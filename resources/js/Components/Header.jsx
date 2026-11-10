import React from 'react';
import { Link } from '@inertiajs/react';

const Header = React.memo(({ authUser }) => {
    const personnel = authUser?.personnel;

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
            {/* Titre dynamique / Fil d'Ariane */}
            <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-800">
                    Espace RH & Collaboration
                </h1>
            </div>

            {/* Menu Utilisateur Haut Droit (Adresse email & profil) */}
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-800">
                        {personnel ? `${personnel.prenom} ${personnel.nom}` : authUser?.login}
                    </div>
                    <div className="text-[11px] text-slate-500">
                        {personnel?.email_pro || 'Adresse email'}
                    </div>
                </div>

                <div className="relative group">
                    <button className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-sky-500 focus:outline-none transition-all">
                        <div className="w-8 h-8 rounded-full bg-[#004B87] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {personnel?.prenom?.[0] || 'U'}
                        </div>
                    </button>

                    {/* Menu déroulant Déconnexion */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 hidden group-hover:block transition-all">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            Se déconnecter
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';
export default Header;
