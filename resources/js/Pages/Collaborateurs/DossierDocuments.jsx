import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileCheck,
    FilePlus2,
    Pencil,
    Upload,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function DossierDocuments({
    personnel,
    categories = [],
    documentsExistants = {},
    completude = { totalRequis: 0, totalFourni: 0, pourcentage: 0, estComplet: false },
    permissions = {
        peutUploaderNouveauxCollaborateur: false,
        peutModifierExistantsRh: false,
        peutGenererEntreprise: false,
        estRh: false,
    },
}) {
    const { flash, errors } = usePage().props;

    // Fichiers sélectionnés par le collaborateur pour les pièces non encore enregistrées
    const [selectedFiles, setSelectedFiles] = useState({});
    const [observations, setObservations] = useState({});
    const [processing, setProcessing] = useState(false);
    const [generatingId, setGeneratingId] = useState(null);

    // État pour la modification par un RH d'un document collaborateur déjà existant
    const [editingDocId, setEditingDocId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editObservation, setEditObservation] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    const handleFileChange = (idTypeDocument, placesRestantes, fileList) => {
        const max = Math.max(0, Number(placesRestantes || 0));
        const filesArray = Array.from(fileList || []).slice(0, max);

        setSelectedFiles((prev) => ({
            ...prev,
            [idTypeDocument]: filesArray,
        }));
    };

    const handleObservationChange = (idTypeDocument, value) => {
        setObservations((prev) => ({
            ...prev,
            [idTypeDocument]: value,
        }));
    };

    const handleSubmitCollaborateur = (e) => {
        e.preventDefault();
        if (!permissions.peutUploaderNouveauxCollaborateur) return;

        const formData = new FormData();

        Object.entries(selectedFiles).forEach(([idType, files]) => {
            if (Array.isArray(files)) {
                files.forEach((file, idx) => {
                    if (file) {
                        formData.append(`fichiers[${idType}][${idx}]`, file);
                    }
                });
            }
        });

        Object.entries(observations).forEach(([idType, obs]) => {
            if (obs !== undefined && obs !== null && obs !== '') {
                formData.append(`observations[${idType}]`, obs);
            }
        });

        setProcessing(true);
        router.post(route('collaborateurs.dossier.store', personnel.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedFiles({});
                setObservations({});
            },
            onFinish: () => setProcessing(false),
        });
    };

    const ouvrirEditionRh = (doc) => {
        setEditingDocId(doc.id);
        setEditFile(null);
        setEditObservation(doc.observation || '');
    };

    const annulerEditionRh = () => {
        setEditingDocId(null);
        setEditFile(null);
        setEditObservation('');
    };

    const validerEditionRh = (e, idDocument) => {
        e.preventDefault();
        if (!editFile) return;

        const formData = new FormData();
        formData.append('fichier', editFile);
        formData.append('observation', editObservation);

        setSavingEdit(true);
        router.post(
            route('collaborateurs.documents.modifier', {
                idPersonnel: personnel.id,
                idDocument,
            }),
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => annulerEditionRh(),
                onFinish: () => setSavingEdit(false),
            }
        );
    };

    const handleGenererEntreprise = (idTypeDocument) => {
        if (!permissions.peutGenererEntreprise) return;

        setGeneratingId(idTypeDocument);
        router.post(
            route('collaborateurs.dossier.generer', {
                idPersonnel: personnel.id,
                idTypeDocument,
            }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setGeneratingId(null),
            }
        );
    };

    const aAuMoinsUnNouveauFichier = Object.values(selectedFiles).some(
        (arr) => Array.isArray(arr) && arr.length > 0
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Dossier - ${personnel.prenom} ${personnel.nom}`} />

            <div className="max-w-5xl mx-auto space-y-6 pb-14">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
                    <div className="space-y-1">
                        <Link
                            href={permissions.estRh ? route('collaborateurs.index') : route('profile.edit')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-phaos-navy"
                        >
                            <ArrowLeft size={14} />
                            <span>
                                {permissions.estRh
                                    ? 'Retour à la liste des collaborateurs'
                                    : 'Retour à mon profil'}
                            </span>
                        </Link>

                        <h1 className="text-xl font-bold text-phaos-navy">
                            Dossier Numérique — {personnel.prenom} {personnel.nom}
                        </h1>
                        <p className="text-xs text-slate-500">
                            Matricule : <strong className="text-slate-700">{personnel.matricule || 'N/A'}</strong> —{' '}
                            {personnel.poste_actuel?.libelle || 'Poste non défini'} (
                            {personnel.departement?.libelle || 'Département non défini'})
                        </p>
                    </div>

                    {/* Complétude globale */}
                    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm min-w-[230px]">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-slate-600">Complétude globale</span>
                            <span
                                className={`font-bold ${
                                    completude.estComplet ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                            >
                                {completude.pourcentage}% ({completude.totalFourni}/{completude.totalRequis})
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${
                                    completude.estComplet ? 'bg-emerald-600' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, completude.pourcentage)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Messages Flash & Erreurs */}
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

                {Object.keys(errors || {}).length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs space-y-1">
                        <p className="font-bold">Veuillez corriger les erreurs suivantes :</p>
                        {Object.values(errors).map((err, i) => (
                            <p key={i}>• {err}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmitCollaborateur} className="space-y-6">
                    {categories.length === 0 ? (
                        <div className="phaos-card text-center py-8 text-xs text-slate-500">
                            Aucun type de document configuré pour cette vue.
                        </div>
                    ) : (
                        categories.map((categorie) => (
                            <div key={categorie.id} className="phaos-card space-y-4">
                                <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b border-slate-200 pb-2">
                                    {categorie.libelle}
                                </h2>

                                <div className="divide-y divide-slate-100">
                                    {(categorie.types_document || []).map((typeDoc) => {
                                        const docsFournis = documentsExistants[typeDoc.id] || [];
                                        const nbRequis = Math.max(1, Number(typeDoc.nombre_requis || 1));
                                        const nbFournis = docsFournis.length;
                                        const estPieceComplete = nbFournis >= nbRequis;
                                        const placesRestantes = Math.max(0, nbRequis - nbFournis);
                                        const estOrigineCollaborateur =
                                            String(typeDoc.origine || '').toLowerCase() === 'collaborateur';
                                        const estOrigineEntreprise =
                                            String(typeDoc.origine || '').toLowerCase() === 'entreprise';

                                        const fichiersEnAttente = selectedFiles[typeDoc.id] || [];

                                        return (
                                            <div
                                                key={typeDoc.id}
                                                className="py-4 first:pt-1 last:pb-1 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
                                            >
                                                {/* Détails du type de document + fichiers existants */}
                                                <div className="space-y-2 max-w-2xl">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-semibold text-sm text-slate-800">
                                                            {typeDoc.libelle}
                                                        </span>

                                                        {permissions.estRh && (
                                                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                                {estOrigineEntreprise ? 'Entreprise' : 'Collaborateur'}
                                                            </span>
                                                        )}

                                                        {typeDoc.est_obligatoire ? (
                                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                                                Obligatoire
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                                Facultatif
                                                            </span>
                                                        )}

                                                        {estPieceComplete ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 size={13} />
                                                                Disponible ({nbFournis}/{nbRequis})
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                                                <Clock size={13} />
                                                                En attente ({nbFournis}/{nbRequis})
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Fichiers déjà enregistrés : consultation pour tous + modification RH si origine 'collaborateur' */}
                                                    {docsFournis.length > 0 && (
                                                        <div className="space-y-2 pt-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {docsFournis.map((doc, idx) => (
                                                                    <div
                                                                        key={doc.id}
                                                                        className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-xs"
                                                                    >
                                                                        <a
                                                                            href={`/storage/${doc.chemin_fichier}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1.5 font-semibold text-[#004B87] hover:underline"
                                                                        >
                                                                            <FileCheck size={13} />
                                                                            <span>
                                                                                {docsFournis.length > 1
                                                                                    ? `Pièce #${idx + 1}`
                                                                                    : 'Consulter'}
                                                                            </span>
                                                                            <ExternalLink size={11} />
                                                                        </a>

                                                                        {permissions.peutModifierExistantsRh &&
                                                                            estOrigineCollaborateur && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => ouvrirEditionRh(doc)}
                                                                                    className="ml-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 border-l border-sky-200 pl-1.5"
                                                                                    title="Modifier ce fichier importé par le collaborateur"
                                                                                >
                                                                                    <Pencil size={11} />
                                                                                    <span>Modifier</span>
                                                                                </button>
                                                                            )}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Formulaire inline de modification d'un document collaborateur par le RH */}
                                                            {permissions.peutModifierExistantsRh &&
                                                                docsFournis.some((d) => d.id === editingDocId) && (
                                                                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2.5">
                                                                        <p className="text-xs font-bold text-amber-900">
                                                                            Remplacer le fichier importé par le collaborateur
                                                                        </p>
                                                                        <input
                                                                            type="file"
                                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                                            onChange={(e) =>
                                                                                setEditFile(e.target.files?.[0] || null)
                                                                            }
                                                                            className="block w-full text-xs text-slate-700"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Observation..."
                                                                            value={editObservation}
                                                                            onChange={(e) =>
                                                                                setEditObservation(e.target.value)
                                                                            }
                                                                            className="phaos-input text-xs py-1.5"
                                                                        />
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                disabled={!editFile || savingEdit}
                                                                                onClick={(e) =>
                                                                                    validerEditionRh(e, editingDocId)
                                                                                }
                                                                                className="phaos-btn-primary text-xs py-1.5 px-3"
                                                                            >
                                                                                {savingEdit
                                                                                    ? 'Mise à jour...'
                                                                                    : 'Valider le remplacement'}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={annulerEditionRh}
                                                                                className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-2 py-1"
                                                                            >
                                                                                Annuler
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions : uniquement pour les pièces restantes côté collaborateur, ou génération côté RH */}
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                    {permissions.peutUploaderNouveauxCollaborateur &&
                                                        estOrigineCollaborateur &&
                                                        placesRestantes > 0 && (
                                                            <div className="flex flex-col gap-2 min-w-[260px]">
                                                                <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-phaos-navy hover:bg-slate-50 cursor-pointer transition-colors">
                                                                    <Upload size={14} className="text-phaos-navy" />
                                                                    <span>
                                                                        {fichiersEnAttente.length > 0
                                                                            ? `${fichiersEnAttente.length} fichier(s) sélectionné(s)`
                                                                            : placesRestantes > 1
                                                                            ? `Ajouter jusqu'à ${placesRestantes} pièce(s)`
                                                                            : 'Téléverser la pièce manquante'}
                                                                    </span>
                                                                    <input
                                                                        type="file"
                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                        multiple={placesRestantes > 1}
                                                                        className="hidden"
                                                                        onChange={(e) =>
                                                                            handleFileChange(
                                                                                typeDoc.id,
                                                                                placesRestantes,
                                                                                e.target.files
                                                                            )
                                                                        }
                                                                    />
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    placeholder="Observation (optionnel)..."
                                                                    value={observations[typeDoc.id] || ''}
                                                                    onChange={(e) =>
                                                                        handleObservationChange(
                                                                            typeDoc.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="phaos-input text-xs py-1.5"
                                                                />
                                                            </div>
                                                        )}

                                                    {permissions.peutGenererEntreprise && estOrigineEntreprise && (
                                                        <button
                                                            type="button"
                                                            disabled={generatingId === typeDoc.id}
                                                            onClick={() => handleGenererEntreprise(typeDoc.id)}
                                                            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#004B87] text-white hover:bg-[#003766] disabled:opacity-50 transition-colors"
                                                        >
                                                            <FilePlus2 size={14} />
                                                            <span>
                                                                {generatingId === typeDoc.id
                                                                    ? 'Génération...'
                                                                    : nbFournis > 0
                                                                    ? 'Régénérer le document'
                                                                    : 'Générer le document'}
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Bouton d'enregistrement des nouveaux documents collaborateur */}
                    {permissions.peutUploaderNouveauxCollaborateur &&
                        categories.length > 0 &&
                        aAuMoinsUnNouveauFichier && (
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="phaos-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                                >
                                    <Upload size={15} />
                                    <span>
                                        {processing ? 'Enregistrement en cours...' : 'Enregistrer les nouvelles pièces'}
                                    </span>
                                </button>
                            </div>
                        )}
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
