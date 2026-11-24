import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';
import axios from 'axios';
import {
    Eye,
    EyeOff,
} from 'lucide-react';

export default function CreationCollaborateur({
    departements = [],
    postes = [],
    chefs = [],
    roles = [],
    diplomesList: initialdiplome = [],
    filieresList: initialfiliere = [],
    languesList: initiallangue = [],
    competencesList: initialcompetence = [],
    situationsMatrimoniales = [],
    typesContrat = [],
    mdp = null
}) {
    const { flash } = usePage().props;

    // États locaux pour mise à jour instantanée après ajout rapide (+)
    const [diplomeOptions, setdiplomeOptions] = useState(initialdiplome);
    const [filiereOptions, setfiliereOptions] = useState(initialfiliere);
    const [langueOptions, setlangueOptions] = useState(initiallangue);
    const [competenceOptions, setcompetenceOptions] = useState(initialcompetence);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        prenom: '',
        date_naissance: '',
        lieu_naissance: '',
        sexe: 'M',
        id_situation_matrimoiniale: situationsMatrimoniales[0]?.id || '',
        nbr_pers_charge: 0,
        CIN: '',
        faite_le: '',
        faite_a: '',
        adresse_principale: '',
        adresse_2: '',
        email: '',
        email_pro: '',
        contact: '',
        contact_pro: '',

        contact_urgence: [
            { nom: '', relation: '', telephone: '' }
        ],

        id_departement: '',
        id_poste_actuel: '',
        id_chef_hierarchique: '',
        date_entree: '',
        id_type_contrat: typesContrat[0]?.id || '',
        duree_contrat: '',
        date_fin: '',

        login: '',
        mdp: mdp,
        id_role: '',

        diplome: [],
        competence: [],
        langue: []
    });

    // --- GESTION CONTACTS D'URGENCE ---
    const addContactUrgenceRow = () => {
        setData('contact_urgence', [
            ...data.contact_urgence,
            { nom: '', relation: '', telephone: '' }
        ]);
    };

    const removeContactUrgenceRow = (index) => {
        const updated = [...data.contact_urgence];
        updated.splice(index, 1);
        setData('contact_urgence', updated);
    };

    const updateContactUrgence = (index, field, value) => {
        const updated = [...data.contact_urgence];
        updated[index][field] = value;
        setData('contact_urgence', updated);
    };

    // --- GESTION LIGNES DYNAMIQUES (DIPLÔMES, COMPÉTENCES, langue) ---
    const addDiplomeRow = () => setData('diplome', [...data.diplome, { id_diplome: '', etablissement: '', id_filiere: '', annee: new Date().getFullYear() }]);
    const addCompetenceRow = () => setData('competence', [...data.competence, { id_competence: '', niveau: 3.0 }]);
    const addLangueRow = () => setData('langue', [...data.langue, { id_langue: '', niveau: 3.0 }]);

    const removeRow = (listKey, index) => {
        const updated = [...data[listKey]];
        updated.splice(index, 1);
        setData(listKey, updated);
    };

    // --- AJOUT RAPIDE EN BDD + SÉLECTION IMMÉDIATE (+) ---
    const handleQuickAdd = async (type, indexRow) => {
        const prompts = {
            diplome: "Intitulé du nouveau diplôme :",
            filiere: "Nom de la nouvelle filière :",
            langue: "Nom de la nouvelle langue :",
            competence: "Description de la compétence :"
        };

        const val = window.prompt(prompts[type]);
        if (!val || !val.trim()) return;

        try {
            // Utilisation de axios (embarque automatiquement le X-CSRF-TOKEN de Laravel)
            const res = await axios.post(`/rh/quick-add/${type}`, { value: val.trim() });
            const newItem = res.data;

            if (type === 'diplome') {
                setdiplomeOptions(prev => [...prev, newItem]);
                const updated = [...data.diplome];
                updated[indexRow].id_diplome = newItem.id;
                setData('diplome', updated);
            } else if (type === 'filiere') {
                setfiliereOptions(prev => [...prev, newItem]);
                const updated = [...data.diplome];
                updated[indexRow].id_filiere = newItem.id;
                setData('diplome', updated);
            } else if (type === 'langue') {
                setlangueOptions(prev => [...prev, newItem]);
                const updated = [...data.langue];
                updated[indexRow].id_langue = newItem.id;
                setData('langue', updated);
            } else if (type === 'competence') {
                setcompetenceOptions(prev => [...prev, newItem]);
                const updated = [...data.competence];
                updated[indexRow].id_competence = newItem.id;
                setData('competence', updated);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erreur lors de l'ajout rapide en base de données.");
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rh.collaborateur.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nouveau Collaborateur - PHAOS PEOPLE" />

            <div className="max-w-5xl mx-auto space-y-6 pb-10">
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">Création du Compte Collaborateur</h1>
                    <p className="text-xs text-slate-500">Le matricule est généré automatiquement. Le compte sera soumis à validation de la Direction.</p>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs space-y-1">
                        <p className="font-bold">Veuillez corriger les erreurs suivantes :</p>
                        <ul className="list-disc pl-4">
                            {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">

                    {/* 1. ÉTAT CIVIL */}
                    <div className="phaos-card space-y-4">
                        <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">1. État Civil & Identité</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="phaos-label">Nom *</label>
                                <input type="text" className="phaos-input" value={data.nom} onChange={e => setData('nom', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Prénom(s) *</label>
                                <input type="text" className="phaos-input" value={data.prenom} onChange={e => setData('prenom', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Sexe *</label>
                                <select className="phaos-input" value={data.sexe} onChange={e => setData('sexe', e.target.value)}>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Date de Naissance *</label>
                                <input type="date" className="phaos-input" value={data.date_naissance} onChange={e => setData('date_naissance', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Lieu de Naissance</label>
                                <input type="text" className="phaos-input" value={data.lieu_naissance} onChange={e => setData('lieu_naissance', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Situation Matrimoniale</label>
                                <select
                                    className="phaos-input"
                                    value={data.id_situation_matrimoiniale}
                                    onChange={e => setData('id_situation_matrimoiniale', e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {situationsMatrimoniales.map((sit) => (
                                        <option key={sit.id} value={sit.id}>{sit.libelle}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Personnes à charge</label>
                                <input type="number" min="0" className="phaos-input" value={data.nbr_pers_charge} onChange={e => setData('nbr_pers_charge', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">N° CIN</label>
                                <input type="text" className="phaos-input" value={data.CIN} onChange={e => setData('CIN', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Délivrée le</label>
                                <input type="date" className="phaos-input" value={data.faite_le} onChange={e => setData('faite_le', e.target.value)} />
                            </div>
                            <div className="md:col-span-3">
                                <label className="phaos-label">Lieu de délivrance CIN</label>
                                <input type="text" className="phaos-input" value={data.faite_a} onChange={e => setData('faite_a', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 2. COORDONNÉES & CONTACTS D'URGENCE */}
                    <div className="phaos-card space-y-4">
                        <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">2. Coordonnées & Contacts d'Urgence</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="phaos-label">Adresse Principale (Adresse 1)</label>
                                <input type="text" className="phaos-input" value={data.adresse_principale} onChange={e => setData('adresse_principale', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Adresse Secondaire (Adresse 2)</label>
                                <input type="text" className="phaos-input" value={data.adresse_2} onChange={e => setData('adresse_2', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Email Personnel</label>
                                <input type="email" className="phaos-input" value={data.email} onChange={e => setData('email', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Email Professionnel *</label>
                                <input type="email" className="phaos-input" value={data.email_pro} onChange={e => setData('email_pro', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Téléphone Personnel</label>
                                <input type="text" className="phaos-input" value={data.contact} onChange={e => setData('contact', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Téléphone Professionnel</label>
                                <input type="text" className="phaos-input" value={data.contact_pro} onChange={e => setData('contact_pro', e.target.value)} />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="phaos-label text-phaos-navy font-bold mb-0">Contacts d'Urgence</label>
                                <button type="button" onClick={addContactUrgenceRow} className="text-xs font-bold text-phaos-navy hover:underline">
                                    + Ajouter un Contact d'Urgence
                                </button>
                            </div>

                            {data.contact_urgence.map((contact, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                    <div className="md:col-span-4">
                                        <input type="text" className="phaos-input" placeholder="Nom & Prénom" value={contact.nom} onChange={e => updateContactUrgence(index, 'nom', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-4">
                                        <input type="text" className="phaos-input" placeholder="Lien / Relation (ex: Frère, Épouse)" value={contact.relation} onChange={e => updateContactUrgence(index, 'relation', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <input type="text" className="phaos-input" placeholder="Téléphone" value={contact.telephone} onChange={e => updateContactUrgence(index, 'telephone', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1 text-center">
                                        {data.contact_urgence.length > 1 && (
                                            <button type="button" onClick={() => removeContactUrgenceRow(index)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. POSTES & CONTRAT INITIAL */}
                    <div className="phaos-card space-y-4">
                        <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">3. Postes & Contrat Initial</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="phaos-label">Département *</label>
                                <select className="phaos-input" value={data.id_departement} onChange={e => setData('id_departement', e.target.value)} required>
                                    <option value="">Sélectionner...</option>
                                    {departements.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Poste Actuel *</label>
                                <select className="phaos-input" value={data.id_poste_actuel} onChange={e => setData('id_poste_actuel', e.target.value)} required>
                                    <option value="">Sélectionner...</option>
                                    {postes.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Chef Hiérarchique (N+1)</label>
                                <select className="phaos-input" value={data.id_chef_hierarchique} onChange={e => setData('id_chef_hierarchique', e.target.value)}>
                                    <option value="">Aucun</option>
                                    {chefs.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Type de Contrat *</label>
                                <select className="phaos-input" value={data.id_type_contrat} onChange={e => setData('id_type_contrat', e.target.value)} required>
                                    <option value="">Sélectionner...</option>
                                    {typesContrat.map((tc) => (
                                        <option key={tc.id} value={tc.id}>{tc.libelle}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Date d'embauche *</label>
                                <input type="date" className="phaos-input" value={data.date_entree} onChange={e => setData('date_entree', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Durée Contrat</label>
                                <input type="text" className="phaos-input" value={data.duree_contrat} onChange={e => setData('duree_contrat', e.target.value)} placeholder="ex: 6 mois" />
                            </div>
                            <div>
                                <label className="phaos-label">Date de Fin de Contrat</label>
                                <input type="date" className="phaos-input" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 4. DIPLÔMES */}
                    <div className="phaos-card space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">4. Diplômes</h2>
                            <button type="button" onClick={addDiplomeRow} className="text-xs font-bold text-phaos-navy hover:underline">+ Ligne Diplôme</button>
                        </div>
                        {data.diplome.map((dip, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                <div className="md:col-span-4 flex gap-1">
                                    <select className="phaos-input flex-1" value={dip.id_diplome} onChange={e => {
                                        const updated = [...data.diplome];
                                        updated[index].id_diplome = e.target.value;
                                        setData('diplome', updated);
                                    }}>
                                        <option value="">Diplôme...</option>
                                        {diplomeOptions.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('diplome', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Créer un diplôme">+</button>
                                </div>
                                <div className="md:col-span-3">
                                    <input type="text" className="phaos-input" placeholder="Établissement" value={dip.etablissement} onChange={e => {
                                        const updated = [...data.diplome];
                                        updated[index].etablissement = e.target.value;
                                        setData('diplome', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-3 flex gap-1">
                                    <select className="phaos-input flex-1" value={dip.id_filiere} onChange={e => {
                                        const updated = [...data.diplome];
                                        updated[index].id_filiere = e.target.value;
                                        setData('diplome', updated);
                                    }}>
                                        <option value="">Filière...</option>
                                        {filiereOptions.map(f => <option key={f.id} value={f.id}>{f.libelle}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('filiere', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Créer une filière">+</button>
                                </div>
                                <div className="md:col-span-1">
                                    <input type="number" className="phaos-input" placeholder="Année" value={dip.annee} onChange={e => {
                                        const updated = [...data.diplome];
                                        updated[index].annee = e.target.value;
                                        setData('diplome', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <button type="button" onClick={() => removeRow('diplome', index)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 5. COMPÉTENCES */}
                    <div className="phaos-card space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">5. Compétences</h2>
                            <button type="button" onClick={addCompetenceRow} className="text-xs font-bold text-phaos-navy hover:underline">+ Ligne Compétence</button>
                        </div>
                        {data.competence.map((comp, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                <div className="md:col-span-8 flex gap-1">
                                    <select className="phaos-input flex-1" value={comp.id_competence} onChange={e => {
                                        const updated = [...data.competence];
                                        updated[index].id_competence = e.target.value;
                                        setData('competence', updated);
                                    }}>
                                        <option value="">Sélectionner compétence...</option>
                                        {competenceOptions.map(c => <option key={c.id} value={c.id}>{c.descri}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('competence', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Créer une compétence">+</button>
                                </div>
                                <div className="md:col-span-3">
                                    <input type="number" step="0.1" min="1" max="5" className="phaos-input" placeholder="Niveau (1.0 à 5.0)" value={comp.niveau} onChange={e => {
                                        const updated = [...data.competence];
                                        updated[index].niveau = e.target.value;
                                        setData('competence', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <button type="button" onClick={() => removeRow('competence', index)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 6. langue */}
                    <div className="phaos-card space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">6. langue</h2>
                            <button type="button" onClick={addLangueRow} className="text-xs font-bold text-phaos-navy hover:underline">+ Ligne Langue</button>
                        </div>
                        {data.langue.map((lg, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                <div className="md:col-span-8 flex gap-1">
                                    <select className="phaos-input flex-1" value={lg.id_langue} onChange={e => {
                                        const updated = [...data.langue];
                                        updated[index].id_langue = e.target.value;
                                        setData('langue', updated);
                                    }}>
                                        <option value="">Sélectionner langue...</option>
                                        {langueOptions.map(l => <option key={l.id} value={l.id}>{l.libelle}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('langue', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Créer une langue">+</button>
                                </div>
                                <div className="md:col-span-3">
                                    <input type="number" step="0.1" min="1" max="5" className="phaos-input" placeholder="Niveau (1.0 à 5.0)" value={lg.niveau} onChange={e => {
                                        const updated = [...data.langue];
                                        updated[index].niveau = e.target.value;
                                        setData('langue', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <button type="button" onClick={() => removeRow('langue', index)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 7. COMPTE SYSTEME */}
                    <div className="phaos-card space-y-4">
                        <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                            7. Paramètres d'Accès Compte
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="phaos-label">Login *</label>
                                <input
                                    type="text"
                                    className="phaos-input"
                                    value={data.login}
                                    onChange={e => setData('login', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="phaos-label">Mot de Passe Initial *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="phaos-input pr-10"
                                        value={data.mdp}
                                        onChange={(e) => setData('mdp', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
                                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="phaos-label">Rôle Système *</label>
                                <select
                                    className="phaos-input"
                                    value={data.id_role}
                                    onChange={e => setData('id_role', e.target.value)}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="submit" disabled={processing} className="phaos-btn-primary">
                            Enregistrer et Soumettre à Validation
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
