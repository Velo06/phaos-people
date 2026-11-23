import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function DossierDocuments({
    personnel,
    categories = [],
    documentsExistants = {},
    completude = {
        totalRequis: 0,
        totalFourni: 0,
        pourcentage: 0,
        estComplet: false,
    },
    permissions = {
        peutUploaderCollaborateur: false,
        peutGenererEntreprise: false,
        estRh: false,
    },
}) {
    const { flash } = usePage().props;

    const [fichiersParType, setFichiersParType] = useState({});
    const [observationsParType, setObservationsParType] = useState({});
    const [processing, setProcessing] = useState(false);
    const [erreurLocale, setErreurLocale] = useState('');

    // Helper pour lire les documents existants quel que soit le type de clé (1 ou "1")
    const getDocsExistant = (idType) => {
        if (!documentsExistants) return [];
        return documentsExistants[idType] || documentsExistants[String(idType)] || [];
    };

    const handleFileChange = (idType, fileList, maxFiles) => {
        setErreurLocale('');
        const limit = Math.max(1, Number(maxFiles) || 1);
        const selectedFiles = Array.from(fileList || []).slice(0, limit);

        setFichiersParType((prev) => ({
            ...prev,
            [idType]: selectedFiles,
        }));
    };

    const handleObsChange = (idType, value) => {
        setObservationsParType((prev) => ({
            ...prev,
            [idType]: value,
        }));
    };

    const handleGenererEntreprise = (idType) => {
        setProcessing(true);
        router.post(
            route('collaborateurs.dossier.generer', {
                idPersonnel: personnel.id,
                idTypeDocument: idType,
            }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    const submit = (e) => {
        e.preventDefault();
        if (!permissions.peutUploaderCollaborateur) return;

        const formData = new FormData();
        let aAuMoinsUnFichier = false;

        Object.entries(fichiersParType).forEach(([idType, files]) => {
            if (Array.isArray(files) && files.length > 0) {
                files.forEach((file, index) => {
                    formData.append(`fichiers[${idType}][${index}]`, file);
                    aAuMoinsUnFichier = true;
                });
            }
        });

        Object.entries(observationsParType).forEach(([idType, obs]) => {
            if (obs !== undefined) {
                formData.append(`observations[${idType}]`, obs ?? '');
            }
        });

        const aAuMoinsUneObs = Object.keys(observationsParType).length > 0;

        if (!aAuMoinsUnFichier && !aAuMoinsUneObs) {
            setErreurLocale('Veuillez sélectionner au moins un fichier ou saisir une observation avant d\'enregistrer.');
            return;
        }

        setProcessing(true);
        setErreurLocale('');

        router.post(route('collaborateurs.dossier.store', personnel.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Vider la sélection locale après enregistrement réussi pour afficher les fichiers enregistrés en base
                setFichiersParType({});
            },
            onError: (errs) => {
                const premierMessage = Object.values(errs || {})[0];
                setErreurLocale(premierMessage || 'Erreur lors de l\'enregistrement des documents.');
            },
            onFinish: () => setProcessing(false),
        });
    };

    // Calcul temps réel de la complétude : prend les props serveur + les fichiers sélectionnés en attente d'envoi
    const statsAffichage = useMemo(() => {
        let totalRequis = 0;
        let totalFourni = 0;

        categories.forEach((cat) => {
            (cat.types_document || []).forEach((typeDoc) => {
                if (Boolean(typeDoc.est_obligatoire)) {
                    const requis = Math.max(1, Number(typeDoc.nombre_requis) || 1);
                    const existantsCount = getDocsExistant(typeDoc.id).length;
                    const selectionCount = (fichiersParType[typeDoc.id] || []).length;

                    // Si de nouveaux fichiers sont sélectionnés, ils remplaceront l'existant à l'enregistrement
                    const effectif = selectionCount > 0 ? selectionCount : existantsCount;

                    totalRequis += requis;
                    totalFourni += Math.min(effectif, requis);
                }
            });
        });

        // Si categories est filtré (ex: RH ne voit que 'entreprise'), on garde la complétude globale du serveur si disponible
        if (completude && typeof completude.totalRequis === 'number' && completude.totalRequis > 0 && permissions.estRh) {
            return completude;
        }

        const pourcentage = totalRequis > 0 ? Math.round((totalFourni / totalRequis) * 100) : 100;

        return {
            totalRequis,
            totalFourni,
            pourcentage,
            estComplet: totalRequis > 0 && totalFourni >= totalRequis,
        };
    }, [categories, documentsExistants, fichiersParType, completude, permissions.estRh]);

    return (
        <AuthenticatedLayout>
            <Head title={`Dossier - ${personnel.prenom || ''} ${personnel.nom || ''}`} />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                {/* En-tête & Suivi global de complétude */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-phaos-navy">
                            {permissions.estRh
                                ? `Documents Entreprise : ${personnel.prenom} ${personnel.nom}`
                                : `Mon Dossier : ${personnel.prenom} ${personnel.nom}`}
                        </h1>
                        <p className="text-xs text-slate-500">
                            Matricule :{' '}
                            <strong className="text-slate-700">{personnel.matricule || 'Non attribué'}</strong> — Poste :{' '}
                            <strong className="text-slate-700">{personnel.poste_actuel?.libelle || 'N/A'}</strong>
                        </p>
                    </div>

                    <div
                        className={`px-4 py-2.5 rounded-xl border text-right ${
                            statsAffichage.estComplet
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                    >
                        <div className="text-xs font-extrabold">
                            Complétude : {statsAffichage.pourcentage}% ({statsAffichage.totalFourni}/{statsAffichage.totalRequis})
                        </div>
                        <div className="text-[11px] font-medium">
                            {statsAffichage.estComplet ? 'Dossier complet' : 'Pièces obligatoires en attente'}
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {(flash?.error || erreurLocale) && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                        {erreurLocale || flash?.error}
                    </div>
                )}

                {categories.length === 0 ? (
                    <div className="phaos-card text-center py-8 text-sm text-slate-500">
                        Aucune pièce à afficher dans ce périmètre.
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-6">
                        {categories.map((categorie) => (
                            <div key={categorie.id} className="phaos-card space-y-4">
                                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-phaos-navy uppercase tracking-wider">
                                        {categorie.libelle}
                                    </h2>
                                    <span className="text-xs text-slate-400">
                                        {(categorie.types_document || []).length} pièce(s)
                                    </span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {(categorie.types_document || []).map((typeDoc) => {
                                        const docsExistant = getDocsExistant(typeDoc.id);
                                        const isEntreprise = typeDoc.origine === 'entreprise';
                                        const nombreRequis = Math.max(1, Number(typeDoc.nombre_requis) || 1);
                                        const isMultiple = nombreRequis > 1;
                                        const estComplet = docsExistant.length >= nombreRequis;
                                        const fichiersSelectionnes = fichiersParType[typeDoc.id] || [];

                                        return (
                                            <div
                                                key={typeDoc.id}
                                                className="py-4 first:pt-1 last:pb-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center"
                                            >
                                                {/* Colonne 1 : Libellé & statut */}
                                                <div className="md:col-span-5 space-y-1.5">
                                                    <div className="flex items-center flex-wrap gap-1.5">
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {typeDoc.libelle}
                                                        </span>

                                                        {isMultiple && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded">
                                                                {nombreRequis} fichiers
                                                            </span>
                                                        )}

                                                        {Boolean(typeDoc.est_obligatoire) && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                                                                Obligatoire
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-xs space-y-1">
                                                        {docsExistant.length > 0 ? (
                                                            <div className="space-y-1">
                                                                <span
                                                                    className={`font-medium block ${
                                                                        estComplet ? 'text-emerald-600' : 'text-amber-600'
                                                                    }`}
                                                                >
                                                                    {estComplet
                                                                        ? `✓ Disponible (${docsExistant.length}/${nombreRequis})`
                                                                        : `• En cours (${docsExistant.length}/${nombreRequis})`}
                                                                </span>

                                                                <div className="flex flex-wrap gap-2">
                                                                    {docsExistant.map((doc, idx) => (
                                                                        <a
                                                                            key={doc.id}
                                                                            href={`/storage/${doc.chemin_fichier}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="underline text-sky-700 hover:text-sky-900 font-semibold"
                                                                        >
                                                                            {isMultiple ? `Pièce #${idx + 1}` : 'Consulter'}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-amber-600 font-medium">
                                                                {isEntreprise
                                                                    ? '• Non généré'
                                                                    : `• Non téléversé (${nombreRequis} requis)`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Colonne 2 : Génération RH ou Téléversement Collaborateur */}
                                                <div className="md:col-span-4 space-y-1.5">
                                                    {isEntreprise && permissions.peutGenererEntreprise && (
                                                        <button
                                                            type="button"
                                                            disabled={processing}
                                                            onClick={() => handleGenererEntreprise(typeDoc.id)}
                                                            className="w-full px-3 py-1.5 bg-sky-50 text-[#004B87] border border-sky-200 rounded text-xs font-bold hover:bg-sky-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {docsExistant.length > 0
                                                                ? 'Régénérer le document'
                                                                : 'Générer le document'}
                                                        </button>
                                                    )}

                                                    {!isEntreprise && permissions.peutUploaderCollaborateur && (
                                                        <div>
                                                            <input
                                                                type="file"
                                                                multiple={isMultiple}
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) =>
                                                                    handleFileChange(typeDoc.id, e.target.files, nombreRequis)
                                                                }
                                                                className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#004B87]/10 file:text-[#004B87] hover:file:bg-[#004B87]/20"
                                                            />
                                                            {fichiersSelectionnes.length > 0 && (
                                                                <span className="text-[11px] text-sky-700 font-medium mt-1 block">
                                                                    {fichiersSelectionnes.length} / {nombreRequis} sélectionné(s)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Colonne 3 : Observation */}
                                                <div className="md:col-span-3">
                                                    {!isEntreprise && permissions.peutUploaderCollaborateur ? (
                                                        <input
                                                            type="text"
                                                            placeholder="Remarque..."
                                                            defaultValue={docsExistant[0]?.observation || ''}
                                                            onChange={(e) => handleObsChange(typeDoc.id, e.target.value)}
                                                            className="phaos-input text-xs py-1.5"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-slate-500 block">
                                                            {docsExistant[0]?.observation || '—'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {permissions.peutUploaderCollaborateur && (
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={processing} className="phaos-btn-primary">
                                    {processing ? 'Enregistrement...' : 'Enregistrer mes documents'}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
