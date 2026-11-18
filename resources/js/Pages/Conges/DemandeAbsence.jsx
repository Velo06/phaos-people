import React, { useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function DemandeAbsence({ typesAbsence, typesPermission, collegues, reglesDelais }) {
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

    const isFormValid = useMemo(() => {
        // 1. Champs communs obligatoires
        if (!data.id_type_absence || !data.date_debut || !data.date_fin) {
            return false;
        }

        // Vérification cohérence des dates
        if (data.date_fin < data.date_debut) {
            return false;
        }

        // 2. Règles spécifiques si PERMISSION
        if (isPermission) {
            if (!data.id_type_permission || !data.motif?.trim() || !data.piece_jointe) {
                return false;
            }
            // Si Banque d'heures
            if (isBanqueHeure) {
                if (!data.heure_debut || !data.heure_fin || data.heure_fin <= data.heure_debut) {
                    return false;
                }
            }
        }

        // 3. Règles spécifiques si REGULARISATION
        if (isRegularisation) {
            if (!data.id_interim || !data.motif?.trim() || !data.piece_jointe) {
                return false;
            }
        }

        return true;
    }, [data, isPermission, isRegularisation, isBanqueHeure]);

    const submit = (e) => {
        e.preventDefault();
        post(route('conges.store'), {
            forceFormData: true, // Indispensable pour l'upload de la pièce jointe
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Demande d'Absence / Congé - PHAOS PEOPLE" />

            <div className="max-w-3xl mx-auto space-y-6 pb-12">
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">Nouvelle Demande d'Absence</h1>
                    <p className="text-xs text-slate-500">Sélectionnez le type d'absence et renseignez les informations requises.</p>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Rappel des délais de prévenance pour les congés */}
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

                        {/* Choix Type de permission (visible si Permission ou Régularisation) */}
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
                            {errors.date_debut && <span className="text-xs text-red-500 mt-1 block">{errors.date_debut}</span>}
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

                    {/* Motif (masqué ou optionnel pour Congé, obligatoire pour Permission et Régularisation) */}
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

                    {/* Pièce justificative (masquée pour Congé, obligatoire pour Permission et Régularisation) */}
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
