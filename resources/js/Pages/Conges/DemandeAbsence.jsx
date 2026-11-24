import React, { useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function DemandeAbsence({ typesAbsence, typesPermission, collegues, reglesDelais, soldeRestant = 0 }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        id_type_absence: '',
        id_type_permission: '',
        date_debut: '',
        date_fin: '',
        heure_debut: '',
        heure_fin: '',
        id_interim: '',
        motif: '',
        piece_jointe: null,
    });

    const selectedType = useMemo(
        () => typesAbsence.find(t => String(t.id) === String(data.id_type_absence)),
        [data.id_type_absence, typesAbsence]
    );

    const selectedPermission = useMemo(
        () => typesPermission.find(p => String(p.id) === String(data.id_type_permission)),
        [data.id_type_permission, typesPermission]
    );

    const isConge = selectedType?.code === 'CONGE';
    const isPermission = selectedType?.code === 'PERMISSION';
    const isRegularisation = selectedType?.code === 'REGULARISATION';
    const isBanqueHeure = isPermission && selectedPermission?.code === 'BANQUE_HEURE';

    // Calcul dynamique de la durée et vérification du délai côté client
    const { nbJours, delaiDepasse, soldeInsuffisant } = useMemo(() => {
        if (!data.date_debut || !data.date_fin || data.date_fin < data.date_debut) {
            return { nbJours: 0, delaiDepasse: false, soldeInsuffisant: false };
        }

        const debut = new Date(data.date_debut + 'T00:00:00');
        const fin = new Date(data.date_fin + 'T00:00:00');
        const diffTime = fin.getTime() - debut.getTime();
        const jours = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (!isConge) {
            return { nbJours: jours, delaiDepasse: false, soldeInsuffisant: false };
        }

        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);
        const joursAvantDepart = Math.floor((debut.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));

        let depasse = false;
        for (const regle of reglesDelais || []) {
            if (jours <= regle.max_jours) {
                if (joursAvantDepart < regle.preavis_jours) {
                    depasse = true;
                }
                break;
            }
        }

        return {
            nbJours: jours,
            delaiDepasse: depasse,
            soldeInsuffisant: jours > Number(soldeRestant),
        };
    }, [data.date_debut, data.date_fin, isConge, reglesDelais, soldeRestant]);

    // Validation globale du formulaire pour activer/désactiver le bouton
    const isFormValid = useMemo(() => {
        if (!data.id_type_absence || !data.date_debut || !data.date_fin) return false;
        if (data.date_fin < data.date_debut) return false;

        if (isConge && (delaiDepasse || soldeInsuffisant)) return false;

        if (isPermission) {
            if (!data.id_type_permission || !data.motif?.trim() || !data.piece_jointe) return false;
            if (isBanqueHeure && (!data.heure_debut || !data.heure_fin || data.heure_fin <= data.heure_debut)) {
                return false;
            }
        }

        if (isRegularisation) {
            if (!data.id_interim || !data.motif?.trim() || !data.piece_jointe) return false;
        }

        return true;
    }, [data, isConge, isPermission, isRegularisation, isBanqueHeure, delaiDepasse, soldeInsuffisant]);

    const submit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        post(route('conges.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Demande d'Absence / Congé - PHAOS PEOPLE" />

            <div className="max-w-3xl mx-auto space-y-6 pb-12">
                {/* En-tête + Solde de congés */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-xl font-bold text-phaos-navy">Nouvelle Demande d'Absence</h1>
                        <p className="text-xs text-slate-500">Sélectionnez le type d'absence et renseignez les informations requises.</p>
                    </div>

                    <div className="bg-gradient-to-r from-[#004B87] to-[#0077B6] text-white px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-3">
                        <div>
                            <span className="block text-[10px] uppercase tracking-wider text-sky-100">Solde congés restant</span>
                            <span className="text-lg font-extrabold">{soldeRestant} <span className="text-xs font-normal">jour(s)</span></span>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Alerte blocante si délai dépassé */}
                {delaiDepasse && (
                    <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-bold flex items-center justify-between">
                        <span>Délai dépassé : la date choisie ne respecte pas le préavis requis pour une durée de {nbJours} jour(s).</span>
                    </div>
                )}

                {/* Alerte si solde insuffisant */}
                {soldeInsuffisant && !delaiDepasse && (
                    <div className="p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg text-sm font-semibold">
                        Solde insuffisant : vous demandez {nbJours} jour(s) alors que votre solde est de {soldeRestant} jour(s).
                    </div>
                )}

                {/* Rappel des délais de prévenance */}
                {isConge && (
                    <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 space-y-1">
                        <div className="font-bold uppercase tracking-wider text-sky-700">Règles de délai de prévenance (Congés) :</div>
                        <ul className="list-disc pl-4 space-y-0.5">
                            {reglesDelais?.map((r, idx) => (
                                <li key={idx}>{r.label}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={submit} className="phaos-card space-y-5">
                    {/* Type d'absence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="phaos-label">Type d'absence *</label>
                            <select
                                className="phaos-input"
                                value={data.id_type_absence}
                                onChange={e => {
                                    setData({
                                        ...data,
                                        id_type_absence: e.target.value,
                                        id_type_permission: '',
                                        heure_debut: '',
                                        heure_fin: '',
                                    });
                                }}
                                required
                            >
                                <option value="">-- Sélectionner --</option>
                                {typesAbsence.map(t => (
                                    <option key={t.id} value={t.id}>{t.libelle}</option>
                                ))}
                            </select>
                            {errors.id_type_absence && <span className="text-xs text-red-500">{errors.id_type_absence}</span>}
                        </div>

                        {(isPermission || isRegularisation) && (
                            <div>
                                <label className="phaos-label">
                                    Type de permission {isPermission ? '*' : '(Optionnel)'}
                                </label>
                                <select
                                    className="phaos-input"
                                    value={data.id_type_permission}
                                    onChange={e => setData('id_type_permission', e.target.value)}
                                    required={isPermission}
                                >
                                    <option value="">-- Choisir le motif de permission --</option>
                                    {typesPermission.map(tp => (
                                        <option key={tp.id} value={tp.id}>{tp.libelle}</option>
                                    ))}
                                </select>
                                {errors.id_type_permission && <span className="text-xs text-red-500">{errors.id_type_permission}</span>}
                            </div>
                        )}
                    </div>

                    {/* Dates début et fin */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="phaos-label">Date de début *</label>
                            <input
                                type="date"
                                className="phaos-input"
                                value={data.date_debut}
                                onChange={e => setData('date_debut', e.target.value)}
                                required
                            />
                            {errors.date_debut && <span className="text-xs text-red-500 mt-1 block font-semibold">{errors.date_debut}</span>}
                        </div>

                        <div>
                            <label className="phaos-label">Date de fin *</label>
                            <input
                                type="date"
                                className="phaos-input"
                                value={data.date_fin}
                                onChange={e => setData('date_fin', e.target.value)}
                                required
                            />
                            {nbJours > 0 && (
                                <span className="text-xs text-slate-500 mt-1 block">
                                    Durée calculée : <strong>{nbJours} jour(s)</strong>
                                </span>
                            )}
                            {errors.date_fin && <span className="text-xs text-red-500 mt-1 block">{errors.date_fin}</span>}
                        </div>
                    </div>

                    {/* Heures début et fin si Banque d'heure */}
                    {isBanqueHeure && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                            <div>
                                <label className="phaos-label">Heure de début *</label>
                                <input
                                    type="time"
                                    className="phaos-input"
                                    value={data.heure_debut}
                                    onChange={e => setData('heure_debut', e.target.value)}
                                    required
                                />
                                {errors.heure_debut && <span className="text-xs text-red-500">{errors.heure_debut}</span>}
                            </div>

                            <div>
                                <label className="phaos-label">Heure de fin *</label>
                                <input
                                    type="time"
                                    className="phaos-input"
                                    value={data.heure_fin}
                                    onChange={e => setData('heure_fin', e.target.value)}
                                    required
                                />
                                {errors.heure_fin && <span className="text-xs text-red-500">{errors.heure_fin}</span>}
                            </div>
                        </div>
                    )}

                    {/* Intérim */}
                    <div>
                        <label className="phaos-label">
                            Collègue assurant l'intérim {isRegularisation ? '*' : '(Optionnel)'}
                        </label>
                        <select
                            className="phaos-input"
                            value={data.id_interim}
                            onChange={e => setData('id_interim', e.target.value)}
                            required={isRegularisation}
                        >
                            <option value="">-- Aucun intérimaire désigné --</option>
                            {collegues.map(c => (
                                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                            ))}
                        </select>
                        {errors.id_interim && <span className="text-xs text-red-500">{errors.id_interim}</span>}
                    </div>

                    {/* Motif */}
                    {!isConge && (
                        <div>
                            <label className="phaos-label">Motif détaillé *</label>
                            <textarea
                                rows="3"
                                className="phaos-input"
                                value={data.motif}
                                onChange={e => setData('motif', e.target.value)}
                                placeholder="Expliquez la raison de votre demande..."
                                required
                            />
                            {errors.motif && <span className="text-xs text-red-500">{errors.motif}</span>}
                        </div>
                    )}

                    {/* Pièce justificative */}
                    {!isConge && (
                        <div>
                            <label className="phaos-label">Pièce justificative (PDF, JPG, PNG - max 5 Mo) *</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="phaos-input text-xs"
                                onChange={e => setData('piece_jointe', e.target.files[0])}
                                required
                            />
                            {errors.piece_jointe && <span className="text-xs text-red-500">{errors.piece_jointe}</span>}
                        </div>
                    )}

                    <div className="flex justify-end pt-3 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={processing || !isFormValid}
                            className={`phaos-btn-primary transition-all duration-200 ${
                                processing || !isFormValid
                                    ? 'opacity-40 cursor-not-allowed pointer-events-none'
                                    : 'hover:opacity-95'
                            }`}
                        >
                            {processing ? 'Envoi en cours...' : 'Soumettre la demande'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
