import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
    // Récupération sécurisée des props globales d'Inertia
    const { auth } = usePage().props;
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
                    <Link
                        href="/profil"
                        className="px-4 py-2 bg-white text-[#004B87] font-semibold text-xs rounded-lg shadow-sm hover:bg-sky-50 transition-all shrink-0"
                    >
                        Accéder à mon profil
                    </Link>
                </div>

                {/* 2. Grille principale des cartes métier */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Bloc Formations */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Formations
                                </h3>
                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Formation du jour</span>
                                    <p className="text-sm font-semibold text-slate-800">Sensibilisation Transition Énergétique</p>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Formation à proximité</span>
                                    <p className="text-sm font-medium text-slate-600">Normes Qualité ISO — 15 Nov 2026</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/onboarding/formation"
                            className="mt-6 text-xs font-bold text-[#004B87] hover:text-[#00A3E0] flex items-center justify-between pt-3 border-t border-slate-100"
                        >
                            <span>Accéder aux formations</span>
                            <span>→</span>
                        </Link>
                    </div>

                    {/* Bloc Parcours Onboarding */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Parcours ONBOARDING
                                </h3>
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                                    Étape 3/5
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-[#00A3E0] h-2.5 rounded-full w-[60%]"></div>
                                </div>
                                <p className="text-xs text-slate-600">
                                    Progression globale : <strong className="text-slate-800">60% complété</strong>
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link
                                href="/onboarding/formation"
                                className="w-full py-2 bg-[#004B87] text-white text-center font-semibold text-xs rounded-lg hover:bg-sky-900 transition-colors"
                            >
                                Continuer l'onboarding
                            </Link>
                            <Link
                                href="/rh/documents-onboarding"
                                className="w-full py-1.5 text-slate-600 text-center font-medium text-xs hover:text-slate-900"
                            >
                                Consulter les documents
                            </Link>
                        </div>
                    </div>

                    {/* Bloc Absences & Congés */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Demandes d'absence
                                </h3>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                                <p className="text-xs font-medium text-emerald-800">
                                    Votre dernière demande d'absence a été validée par la Direction.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link
                                href="/absences"
                                className="w-full py-2 bg-slate-100 text-slate-700 text-center font-semibold text-xs rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Voir la liste de mes demandes
                            </Link>
                            <Link
                                href="/absences/creer"
                                className="text-xs text-center font-bold text-[#004B87] hover:underline"
                            >
                                Soumettre une nouvelle demande
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
