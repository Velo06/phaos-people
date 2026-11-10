import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
    // Récupération sécurisée des props globales d'Inertia
    const page = usePage();
    console.log("PAGEEE", page)
    const props = page?.props || {};
    const auth = props.auth || {};
    const user = auth?.user;
    const personnel = user?.personnel;

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Tableau de bord - PHAOS PEOPLE" />

            <div className="space-y-6">
                {/* 1. En-tête de bienvenue */}
                <div className="bg-gradient-to-r from-[#004B87] to-[#00A3E0] rounded-xl p-6 text-white shadow-md shadow-sky-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">
                            BIENVENUE DANS VOTRE ESPACE {user?.role?.toUpperCase() || 'COLLABORATEUR'}
                        </h2>
                        <p className="text-sky-100 text-sm mt-1">
                            {personnel ? `${personnel.prenom} ${personnel.nom}` : user?.login} — {personnel?.email_pro || 'Adresse email'}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
