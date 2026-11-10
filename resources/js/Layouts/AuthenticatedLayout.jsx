import React from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Header from '@/Components/Header';

export default function AuthenticatedLayout({ user: propUser, children }) {
    // Récupération sécurisée via usePage si non passé en prop
    const { props } = usePage();
    const user = propUser || props?.auth?.user;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex antialiased">
            {/* Sidebar Fixe à Gauche avec Logo en haut à gauche */}
            <Sidebar authUser={user} />

            {/* Zone de contenu principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                <Header authUser={user} />
                <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
