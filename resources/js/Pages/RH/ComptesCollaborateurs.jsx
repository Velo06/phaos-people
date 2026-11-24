import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    FolderOpen,
    Search,
    Users,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function ComptesCollaborateurs({
    comptes = [],
    stats = { total: 0, valides: 0, en_attente: 0 },
    filters = { search: '', validation: 'tous' },
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [validation, setValidation] = useState(filters.validation || 'tous');

    const appliquerFiltres = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('rh.comptes.index'),
            { search, validation },
            { preserveState: true, preserveScroll: true }
        );
    };

    const changerFiltreValidation = (valeur) => {
        setValidation(valeur);
        router.get(
            route('rh.comptes.index'),
            { search, validation: valeur },
            { preserveState: true, preserveScroll: true }
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('fr-FR');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Suivi des comptes collaborateurs - PHAOS PEOPLE" />

            <div className="max-w-6xl mx-auto space-y-6 pb-12">
                {/* En-tête */}
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">
                        Suivi des Comptes Collaborateurs
                    </h1>
                    <p className="text-xs text-slate-500">
                        Vérifiez l'état de validation des comptes par la direction et accédez aux dossiers.
                    </p>
                </div>

                <Link
                    href={route('rh.collaborateur.creer')}
                    className="phaos-btn-primary inline-flex items-center gap-2 text-xs font-bold self-start sm:self-auto"
                >
                    <FolderOpen size={16} />
                    <span>Nouveau compte</span>
                </Link>

                {/* Cartes de suivi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="phaos-card flex items-center justify-between">
                        <div>
                            <span className="block text-xs text-slate-500">Total des comptes</span>
                            <span className="text-2xl font-bold text-phaos-navy">{stats.total}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-sky-50 text-[#004B87]">
                            <Users size={20} />
                        </div>
                    </div>

                    <div className="phaos-card flex items-center justify-between">
                        <div>
                            <span className="block text-xs text-slate-500">Validés par la direction</span>
                            <span className="text-2xl font-bold text-emerald-700">{stats.valides}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>

                    <div className="phaos-card flex items-center justify-between">
                        <div>
                            <span className="block text-xs text-slate-500">En attente de validation</span>
                            <span className="text-2xl font-bold text-amber-700">{stats.en_attente}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="phaos-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'tous', label: 'Tous' },
                            { key: 'valide', label: 'Validés' },
                            { key: 'en_attente', label: 'Pas encore validés' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => changerFiltreValidation(item.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    validation === item.key
                                        ? 'bg-[#004B87] text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={appliquerFiltres} className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nom, prénom, matricule, login..."
                                className="phaos-input pl-9 text-xs py-2 w-64"
                            />
                        </div>
                        <button type="submit" className="phaos-btn-primary text-xs py-2 px-4">
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Liste des comptes */}
                <div className="phaos-card overflow-x-auto">
                    {comptes.length === 0 ? (
                        <p className="py-8 text-center text-xs text-slate-500">
                            Aucun compte collaborateur trouvé pour ces critères.
                        </p>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                                    <th className="py-3 pr-3">Collaborateur</th>
                                    <th className="py-3 pr-3">Poste & Département</th>
                                    <th className="py-3 pr-3">Login & Rôle</th>
                                    <th className="py-3 pr-3">Créé le</th>
                                    <th className="py-3 pr-3">Validation Direction</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {comptes.map((compte) => (
                                    <tr key={compte.id} className="hover:bg-slate-50/70">
                                        <td className="py-3 pr-3">
                                            <div className="font-semibold text-slate-800">
                                                {compte.prenom} {compte.nom}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                Matricule : <strong>{compte.matricule}</strong>
                                            </div>
                                        </td>

                                        <td className="py-3 pr-3">
                                            <div className="font-medium text-slate-700">{compte.poste}</div>
                                            <div className="text-[11px] text-slate-500">{compte.departement}</div>
                                        </td>

                                        <td className="py-3 pr-3">
                                            <div className="font-mono text-slate-800">{compte.login}</div>
                                            <div className="text-[11px] text-slate-500">{compte.role}</div>
                                        </td>

                                        <td className="py-3 pr-3 text-slate-600">
                                            {formatDate(compte.date_creation)}
                                        </td>

                                        <td className="py-3 pr-3">
                                            {compte.est_valide ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 size={13} />
                                                    Validé le {formatDate(compte.date_validation)}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock size={13} />
                                                    Pas encore validé
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
