import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function Index({ collaborateurs = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('collaborateurs.index'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Portail RH - Liste des collaborateurs" />

            <div className="max-w-6xl mx-auto space-y-6 pb-12">
                {/* En-tête */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-phaos-navy">
                            Portail RH — Collaborateurs
                        </h1>
                        <p className="text-xs text-slate-500">
                            {collaborateurs.length} collaborateur(s) enregistré(s)
                        </p>
                    </div>

                    {/* Barre de recherche */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nom, prénom ou matricule..."
                            className="phaos-input text-xs py-2 w-64"
                        />
                        <button type="submit" className="phaos-btn-primary text-xs py-2 px-4">
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Tableau des collaborateurs */}
                <div className="phaos-card overflow-x-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                                <th className="py-3 px-4">Matricule</th>
                                <th className="py-3 px-4">Collaborateur</th>
                                <th className="py-3 px-4">Poste & Département</th>
                                <th className="py-3 px-4">Complétude dossier</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {collaborateurs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-xs text-slate-500">
                                        Aucun collaborateur trouvé.
                                    </td>
                                </tr>
                            ) : (
                                collaborateurs.map((collab) => (
                                    <tr key={collab.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 text-xs font-mono font-semibold text-slate-700">
                                            {collab.matricule || '—'}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <div className="font-semibold text-slate-800">
                                                {collab.nom} {collab.prenom}
                                            </div>
                                            {collab.email && (
                                                <div className="text-xs text-slate-400">{collab.email}</div>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <div className="text-xs font-medium text-slate-700">
                                                {collab.poste}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                {collab.departement}
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                        collab.completude.estComplet
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}
                                                >
                                                    {collab.completude.totalFourni}/
                                                    {collab.completude.totalRequis}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <Link
                                                href={route('collaborateurs.dossier.show', collab.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-[#004B87]/10 text-[#004B87] hover:bg-[#004B87] hover:text-white rounded text-xs font-bold transition-colors"
                                            >
                                                Ouvrir le dossier
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
