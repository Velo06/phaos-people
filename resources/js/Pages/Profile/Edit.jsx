import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    FolderOpen,
    User,
    Phone,
    Briefcase,
    GraduationCap,
    ShieldCheck,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

const ONGLETS = [
    { id: 'identite', label: 'Identité', icon: User },
    { id: 'contacts', label: 'Contacts & urgence', icon: Phone },
    { id: 'carriere', label: 'Carrière & contrats', icon: Briefcase },
    { id: 'qualifications', label: 'Diplômes, compétences & langues', icon: GraduationCap },
    { id: 'compte', label: 'Compte & sécurité', icon: ShieldCheck },
];

export default function Edit({ user }) {
    const { flash } = usePage().props;
    const personnel = user?.personnel || {};

    const [activeTab, setActiveTab] = useState('identite');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('fr-FR');
    };

    const renderField = (label, value) => (
        <div>
            <span className="block text-slate-400 text-xs">{label}</span>
            <span className="font-medium text-slate-700">{value || '—'}</span>
        </div>
    );

    const contactsUrgence = personnel.contacts_urgence || [];
    const contrats = personnel.historique_contrats || [];
    const postes = personnel.historique_postes || [];
    const diplomes = personnel.diplomes || [];
    const competences = personnel.competences || [];
    const langues = personnel.langues || [];

    return (
        <AuthenticatedLayout>
            <Head title="Mon Profil - PHAOS PEOPLE" />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                {/* En-tête + accès rapide Mon dossier */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-phaos-navy">
                            {personnel.prenom && personnel.nom
                                ? `${personnel.prenom} ${personnel.nom}`
                                : 'Paramètres du Profil'}
                        </h1>
                        <p className="text-xs text-slate-500">
                            Matricule : <strong className="text-slate-700">{personnel.matricule || 'N/A'}</strong> —{' '}
                            {personnel.poste_actuel?.libelle || user.role?.libelle || 'Collaborateur'}
                        </p>
                    </div>

                    {user.id_personnel && (
                        <Link
                            href={route('collaborateurs.dossier.show', user.id_personnel)}
                            className="phaos-btn-primary inline-flex items-center gap-2 text-xs font-bold self-start sm:self-auto"
                        >
                            <FolderOpen size={16} />
                            <span>Mon dossier</span>
                        </Link>
                    )}
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Barre d'onglets */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    {ONGLETS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    isActive
                                        ? 'bg-white text-phaos-navy shadow-sm border border-slate-200/80'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                }`}
                            >
                                <Icon size={15} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ONGLET 1 : IDENTITÉ */}
                {activeTab === 'identite' && (
                    <div className="phaos-card space-y-6">
                        <div>
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2 mb-4">
                                État Civil & Situation Familiale
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {renderField('Nom', personnel.nom)}
                                {renderField('Prénom(s)', personnel.prenom)}
                                {renderField(
                                    'Sexe',
                                    personnel.sexe === 'M' ? 'Masculin' : personnel.sexe === 'F' ? 'Féminin' : '—'
                                )}
                                {renderField('Date de naissance', formatDate(personnel.date_naissance))}
                                {renderField('Lieu de naissance', personnel.lieu_naissance)}
                                {renderField(
                                    'Situation matrimoniale',
                                    personnel.situation_matrimoniale?.libelle
                                )}
                                {renderField(
                                    'Personnes à charge',
                                    personnel.nbr_pers_charge !== null && personnel.nbr_pers_charge !== undefined
                                        ? String(personnel.nbr_pers_charge)
                                        : '0'
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2 mb-4">
                                Pièce d'Identité (CIN)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {renderField('Numéro CIN', personnel.cin || personnel.CIN)}
                                {renderField('Fait à', personnel.faite_a)}
                                {renderField('Fait le', formatDate(personnel.faite_le))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ONGLET 2 : CONTACTS & URGENCE */}
                {activeTab === 'contacts' && (
                    <div className="space-y-6">
                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Coordonnées Personnelles & Professionnelles
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {renderField('Téléphone personnel', personnel.contact)}
                                {renderField('Email personnel', personnel.email)}
                                {renderField('Téléphone professionnel', personnel.contact_pro)}
                                {renderField('Email professionnel', personnel.email_pro)}
                                {renderField('Adresse principale', personnel.adresse_principale)}
                                {renderField('Adresse secondaire', personnel.adresse_secondaire)}
                            </div>
                        </div>

                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Contacts d'Urgence
                            </h2>
                            {contactsUrgence.length === 0 ? (
                                <p className="text-xs text-slate-500">Aucun contact d'urgence enregistré.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                                                <th className="py-2 pr-4">Nom complet</th>
                                                <th className="py-2 pr-4">Lien / Relation</th>
                                                <th className="py-2">Téléphone</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {contactsUrgence.map((cu) => (
                                                <tr key={cu.id}>
                                                    <td className="py-2.5 pr-4 font-medium text-slate-700">{cu.nom}</td>
                                                    <td className="py-2.5 pr-4 text-slate-600">{cu.relation}</td>
                                                    <td className="py-2.5 font-medium text-slate-700">{cu.contact}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ONGLET 3 : CARRIÈRE & CONTRATS */}
                {activeTab === 'carriere' && (
                    <div className="space-y-6">
                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Affectation Actuelle
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {renderField('Matricule', personnel.matricule)}
                                {renderField('Poste actuel', personnel.poste_actuel?.libelle)}
                                {renderField('Département', personnel.departement?.libelle)}
                                {renderField(
                                    'Supérieur hiérarchique',
                                    personnel.chef_hierarchique
                                        ? `${personnel.chef_hierarchique.prenom} ${personnel.chef_hierarchique.nom}`
                                        : '—'
                                )}
                                {renderField("Date d'entrée", formatDate(personnel.date_entree))}
                                <div>
                                    <span className="block text-slate-400 text-xs">Statut</span>
                                    <span
                                        className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                                            personnel.statut === 'actif'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}
                                    >
                                        {personnel.statut || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Historique des Contrats
                            </h2>
                            {contrats.length === 0 ? (
                                <p className="text-xs text-slate-500">Aucun contrat enregistré.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                                                <th className="py-2 pr-4">Type de contrat</th>
                                                <th className="py-2 pr-4">Durée (mois)</th>
                                                <th className="py-2 pr-4">Date début</th>
                                                <th className="py-2">Date fin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {contrats.map((c) => (
                                                <tr key={c.id}>
                                                    <td className="py-2.5 pr-4 font-medium text-slate-700">
                                                        {c.type_contrat?.libelle || '—'}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-slate-600">
                                                        {c.duree_contrat ? `${c.duree_contrat} mois` : 'Indéterminée'}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-slate-600">
                                                        {formatDate(c.date_debut)}
                                                    </td>
                                                    <td className="py-2.5 text-slate-600">
                                                        {c.date_fin ? formatDate(c.date_fin) : 'En cours'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Historique des Postes
                            </h2>
                            {postes.length === 0 ? (
                                <p className="text-xs text-slate-500">Aucun historique de poste enregistré.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                                                <th className="py-2 pr-4">Poste occupé</th>
                                                <th className="py-2 pr-4">Date début</th>
                                                <th className="py-2">Date fin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {postes.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="py-2.5 pr-4 font-medium text-slate-700">
                                                        {p.poste?.libelle || '—'}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-slate-600">
                                                        {formatDate(p.date_debut)}
                                                    </td>
                                                    <td className="py-2.5 text-slate-600">
                                                        {p.date_fin ? formatDate(p.date_fin) : 'Actuel'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ONGLET 4 : DIPLÔMES, COMPÉTENCES & LANGUES */}
                {activeTab === 'qualifications' && (
                    <div className="space-y-6">
                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Formation & Diplômes
                            </h2>
                            {diplomes.length === 0 ? (
                                <p className="text-xs text-slate-500">Aucun diplôme enregistré.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                                                <th className="py-2 pr-4">Diplôme</th>
                                                <th className="py-2 pr-4">Filière</th>
                                                <th className="py-2 pr-4">Établissement</th>
                                                <th className="py-2">Année</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {diplomes.map((d) => (
                                                <tr key={d.id}>
                                                    <td className="py-2.5 pr-4 font-medium text-slate-700">
                                                        {d.diplome?.libelle || '—'}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-slate-600">
                                                        {d.filiere?.libelle || '—'}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-slate-600">{d.etablissement}</td>
                                                    <td className="py-2.5 font-medium text-slate-700">{d.annee}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Compétences */}
                            <div className="phaos-card space-y-4">
                                <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                    Compétences
                                </h2>
                                {competences.length === 0 ? (
                                    <p className="text-xs text-slate-500">Aucune compétence enregistrée.</p>
                                ) : (
                                    <ul className="divide-y divide-slate-100 text-sm">
                                        {competences.map((comp) => (
                                            <li key={comp.id} className="py-2.5 flex items-center justify-between">
                                                <span className="font-medium text-slate-700">
                                                    {comp.competence?.descri || '—'}
                                                </span>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-phaos-navy">
                                                    Niveau {comp.niveau}/5
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Langues */}
                            <div className="phaos-card space-y-4">
                                <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                    Langues
                                </h2>
                                {langues.length === 0 ? (
                                    <p className="text-xs text-slate-500">Aucune langue enregistrée.</p>
                                ) : (
                                    <ul className="divide-y divide-slate-100 text-sm">
                                        {langues.map((lang) => (
                                            <li key={lang.id} className="py-2.5 flex items-center justify-between">
                                                <span className="font-medium text-slate-700">
                                                    {lang.langue?.libelle || '—'}
                                                </span>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-phaos-navy">
                                                    Niveau {lang.niveau}/5
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ONGLET 5 : COMPTE & SÉCURITÉ */}
                {activeTab === 'compte' && (
                    <div className="space-y-6">
                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Informations du Compte Système
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {renderField('Login système', user.login)}
                                {renderField('Rôle attribué', user.role?.libelle || 'Collaborateur')}
                                {renderField('Date de création du compte', formatDate(user.date_creation))}
                                {renderField(
                                    'Date de validation',
                                    user.date_validation ? formatDate(user.date_validation) : 'En attente'
                                )}
                            </div>
                        </div>

                        <div className="phaos-card space-y-4">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                                Modifier le Mot de Passe
                            </h2>

                            <form onSubmit={submit} className="space-y-4 max-w-xl">
                                <div>
                                    <label className="phaos-label">Mot de passe actuel</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            className="phaos-input pr-10"
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
                                            aria-label={showCurrentPassword ? 'Masquer' : 'Afficher'}
                                        >
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.current_password && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.current_password}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="phaos-label">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            className="phaos-input pr-10"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
                                            aria-label={showNewPassword ? 'Masquer' : 'Afficher'}
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="phaos-label">Confirmer le nouveau mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className="phaos-input pr-10"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
                                            aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={processing} className="phaos-btn-primary">
                                        {processing ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
