import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, FileText, Upload } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function ModelesDocuments({ typesDocuments = [], variablesDisponibles = [] }) {
    const { flash, errors } = usePage().props;
    const [filesByType, setFilesByType] = useState({});
    const [uploadingId, setUploadingId] = useState(null);

    const handleFileChange = (idType, file) => {
        setFilesByType((prev) => ({
            ...prev,
            [idType]: file || null,
        }));
    };

    const handleUpload = (e, idType) => {
        e.preventDefault();
        const file = filesByType[idType];
        if (!file) return;

        const formData = new FormData();
        formData.append('modele', file);

        setUploadingId(idType);
        router.post(route('rh.modeles-documents.store', idType), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFilesByType((prev) => ({ ...prev, [idType]: null }));
            },
            onFinish: () => setUploadingId(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Modèles de documents entreprise - PHAOS PEOPLE" />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">
                        Modèles de Documents Entreprise (.docx)
                    </h1>
                    <p className="text-xs text-slate-500">
                        Importez ou mettez à jour les fichiers Word modèles utilisés lors de la génération des pièces RH.
                    </p>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                {errors?.modele && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                        {errors.modele}
                    </div>
                )}

                {/* Aide-mémoire variables */}
                <div className="phaos-card space-y-2">
                    <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">
                        Balises disponibles dans vos fichiers .docx
                    </h2>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {variablesDisponibles.map((tag) => (
                            <code
                                key={tag}
                                className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-mono border border-slate-200"
                            >
                                {tag}
                            </code>
                        ))}
                    </div>
                </div>

                {/* Liste des types de documents entreprise */}
                <div className="phaos-card divide-y divide-slate-100">
                    {typesDocuments.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-500">
                            Aucun type de document d'origine entreprise trouvé.
                        </p>
                    ) : (
                        typesDocuments.map((typeDoc) => {
                            const modele = typeDoc.modele_entreprise;
                            const fichierSelectionne = filesByType[typeDoc.id];

                            return (
                                <div
                                    key={typeDoc.id}
                                    className="py-4 first:pt-1 last:pb-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-phaos-navy" />
                                            <span className="font-semibold text-sm text-slate-800">
                                                {typeDoc.libelle}
                                            </span>
                                        </div>

                                        {modele ? (
                                            <p className="text-xs text-emerald-700 font-medium">
                                                Modèle actif : <strong>{modele.nom_fichier_original}</strong>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-amber-700 font-medium">
                                                Aucun modèle .docx importé pour le moment
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {modele && (
                                            <a
                                                href={route('rh.modeles-documents.telecharger', typeDoc.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            >
                                                <Download size={14} />
                                                <span>Télécharger le modèle</span>
                                            </a>
                                        )}

                                        <form
                                            onSubmit={(e) => handleUpload(e, typeDoc.id)}
                                            className="flex flex-wrap items-center gap-2"
                                        >
                                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                                <Upload size={14} />
                                                <span>
                                                    {fichierSelectionne ? fichierSelectionne.name : 'Choisir .docx'}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept=".docx"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        handleFileChange(typeDoc.id, e.target.files?.[0] || null)
                                                    }
                                                />
                                            </label>

                                            <button
                                                type="submit"
                                                disabled={!fichierSelectionne || uploadingId === typeDoc.id}
                                                className="phaos-btn-primary text-xs py-2 px-3.5 disabled:opacity-50"
                                            >
                                                {uploadingId === typeDoc.id ? 'Envoi...' : 'Enregistrer'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
