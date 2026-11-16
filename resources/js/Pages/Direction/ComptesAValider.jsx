import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function ComptesAValider({ utilisateursEnAttente = [] }) {
    const { flash } = usePage().props;

    const handleValider = (id) => {
        if (confirm("Voulez-vous vraiment valider ce compte et activer ce collaborateur ?")) {
            router.post(route('direction.comptes.valider', id), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Validation des Comptes - Direction" />

            <div className="max-w-6xl mx-auto space-y-6 pb-10">
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">Comptes en attente de validation</h1>
                    <p className="text-xs text-slate-500">Validez les accès des nouveaux collaborateurs retenus pour activer leur dossier.</p>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="phaos-card overflow-hidden p-0">
                    {utilisateursEnAttente.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                            Aucun compte en attente de validation pour le moment.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3">Matricule & Nom</th>
                                        <th className="p-3">Poste / Département</th>
                                        <th className="p-3">Login / Rôle</th>
                                        <th className="p-3">Date de demande</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {utilisateursEnAttente.map((u) => {
                                        const p = u.personnel;
                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/50">
                                                <td className="p-3">
                                                    <div className="font-bold text-slate-800">
                                                        {p ? `${p.prenom} ${p.nom}` : 'Dossier incomplet'}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {p ? p.matricule : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-slate-700">{p?.poste_actuel?.libelle || 'N/A'}</div>
                                                    <div className="text-xs text-slate-400">{p?.departement?.libelle || 'N/A'}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-slate-700 font-mono text-xs">{u.login}</div>
                                                    <div className="text-xs text-sky-600 font-semibold">{u.role?.libelle}</div>
                                                </td>
                                                <td className="p-3 text-xs text-slate-500">
                                                    {new Date(u.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleValider(u.id)}
                                                        className="px-3 py-1.5 bg-[#004B87] text-white rounded text-xs font-bold hover:bg-[#003663] transition-colors shadow-sm"
                                                    >
                                                        Valider le Compte
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
