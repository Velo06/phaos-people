import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import '@/../css/collaborateur.css';

export default function CreationCollaborateur({
    departements = [],
    postes = [],
    chefs = [],
    roles = [],
    diplomesList: initialDiplomes = [],
    filieresList: initialFilieres = [],
    languesList: initialLangues = [],
    competencesList: initialCompetences = [],
    situationsMatrimoniales = [],
    typesContrat = []
}) {
    const [diplomesOptions, setDiplomesOptions] = useState(initialDiplomes);
    const [filieresOptions, setFilieresOptions] = useState(initialFilieres);
    const [languesOptions, setLanguesOptions] = useState(initialLangues);
    const [competencesOptions, setCompetencesOptions] = useState(initialCompetences);

    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        prenom: '',
        date_naissance: '',
        lieu_naissance: '',
        sexe: 'M',
        situation_matrimoniale: situationsMatrimoniales[0] || '',
        enfants_a_charge: 0,
        cin_numero: '',
        cin_date_delivrance: '',
        cin_lieu_delivrance: '',
        adresse_1: '',
        adresse_2: '',
        email_perso: '',
        email_pro: '',
        contact_perso: '',
        contact_pro: '',

        contacts_urgence: [
            { nom: '', relation: '', telephone: '' }
        ],

        id_departement: '',
        id_poste_actuel: '',
        id_chef_hierarchique: '',
        date_entree: '',
        type_contrat: typesContrat[0] || '',
        duree_contrat: '',
        date_fin_contrat: '',

        login: '',
        password: '',
        id_role: '',

        diplomes: [],
        competences: [],
        langues: []
    });

    // Gestion des contacts d'urgence (Lignes dynamiques)
    const addContactUrgenceRow = () => {
        setData('contacts_urgence', [
            ...data.contacts_urgence,
            { nom: '', relation: '', telephone: '' }
        ]);
    };

    const removeContactUrgenceRow = (index) => {
        const updated = [...data.contacts_urgence];
        updated.splice(index, 1);
        setData('contacts_urgence', updated);
    };

    const updateContactUrgence = (index, field, value) => {
        const updated = [...data.contacts_urgence];
        updated[index][field] = value;
        setData('contacts_urgence', updated);
    };

    // Gestion dynamique des autres sections (Diplômes, Compétences, Langues)
    const addDiplomeRow = () => setData('diplomes', [...data.diplomes, { id_diplome: '', etablissement: '', id_filiere: '', annee: new Date().getFullYear() }]);
    const addCompetenceRow = () => setData('competences', [...data.competences, { id_competence: '', niveau: 3.0 }]);
    const addLangueRow = () => setData('langues', [...data.langues, { id_langue: '', niveau: 3.0 }]);

    const removeRow = (listKey, index) => {
        const updated = [...data[listKey]];
        updated.splice(index, 1);
        setData(listKey, updated);
    };

    // Quick-Add AJAX pour le bouton "+"
    const handleQuickAdd = async (type, indexRow = null) => {
        let labelPrompt = "";
        if (type === 'diplome') labelPrompt = "Intitulé du nouveau diplôme :";
        if (type === 'filiere') labelPrompt = "Nom de la nouvelle filière :";
        if (type === 'langue') labelPrompt = "Nouvelle langue :";
        if (type === 'competence') labelPrompt = "Description de la compétence :";

        const val = prompt(labelPrompt);
        if (!val || !val.trim()) return;

        try {
            const res = await axios.post(`/rh/quick-add/${type}`, { value: val.trim() });
            const newItem = res.data;

            if (type === 'diplome') {
                setDiplomesOptions(prev => [...prev, newItem]);
                if (indexRow !== null) {
                    const updated = [...data.diplomes];
                    updated[indexRow].id_diplome = newItem.id;
                    setData('diplomes', updated);
                }
            } else if (type === 'filiere') {
                setFilieresOptions(prev => [...prev, newItem]);
                if (indexRow !== null) {
                    const updated = [...data.diplomes];
                    updated[indexRow].id_filiere = newItem.id;
                    setData('diplomes', updated);
                }
            } else if (type === 'langue') {
                setLanguesOptions(prev => [...prev, newItem]);
                if (indexRow !== null) {
                    const updated = [...data.langues];
                    updated[indexRow].id_langue = newItem.id;
                    setData('langues', updated);
                }
            } else if (type === 'competence') {
                setCompetencesOptions(prev => [...prev, newItem]);
                if (indexRow !== null) {
                    const updated = [...data.competences];
                    updated[indexRow].id_competence = newItem.id;
                    setData('competences', updated);
                }
            }
        } catch (err) {
            alert("Erreur lors de l'ajout rapide.");
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rh.collaborateur.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nouveau Collaborateur - PHAOS PEOPLE" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">Création du Dossier Collaborateur</h1>
                    <p className="text-xs text-slate-500">Génération automatique du matricule et enregistrement des accès.</p>
                </div>

                <form onSubmit={submit} className="space-y-6">

                    {/* 1. ÉTAT CIVIL */}
                    <div className="phaos-card space-y-4">
                        <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">1. État Civil & Identité</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="phaos-label">Nom</label>
                                <input type="text" className="phaos-input" value={data.nom} onChange={e => setData('nom', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Prénom(s)</label>
                                <input type="text" className="phaos-input" value={data.prenom} onChange={e => setData('prenom', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Sexe</label>
                                <select className="phaos-input" value={data.sexe} onChange={e => setData('sexe', e.target.value)}>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Date de Naissance</label>
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
                                    value={data.situation_matrimoniale}
                                    onChange={e => setData('situation_matrimoniale', e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {situationsMatrimoniales.map((sit, idx) => {
                                        const val = typeof sit === 'object' ? (sit.libelle || sit.nom || sit.id) : sit;
                                        return (
                                            <option key={idx} value={val}>
                                                {val}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="phaos-label">Personnes à charge</label>
                                <input type="number" min="0" className="phaos-input" value={data.enfants_a_charge} onChange={e => setData('enfants_a_charge', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">N° CIN</label>
                                <input type="text" className="phaos-input" value={data.cin_numero} onChange={e => setData('cin_numero', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Délivrée le</label>
                                <input type="date" className="phaos-input" value={data.cin_date_delivrance} onChange={e => setData('cin_date_delivrance', e.target.value)} />
                            </div>
                            <div className="md:col-span-3">
                                <label className="phaos-label">Lieu de délivrance CIN</label>
                                <input type="text" className="phaos-input" value={data.cin_lieu_delivrance} onChange={e => setData('cin_lieu_delivrance', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 2. COORDONNÉES & CONTACTS D'URGENCE */}
                    <div className="phaos-card space-y-4">
                        <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">2. Coordonnées</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="phaos-label">Adresse Principale (Adresse 1)</label>
                                <input type="text" className="phaos-input" value={data.adresse_1} onChange={e => setData('adresse_1', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Adresse Secondaire (Adresse 2)</label>
                                <input type="text" className="phaos-input" value={data.adresse_2} onChange={e => setData('adresse_2', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Email Personnel</label>
                                <input type="email" className="phaos-input" value={data.email_perso} onChange={e => setData('email_perso', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Email Professionnel</label>
                                <input type="email" className="phaos-input" value={data.email_pro} onChange={e => setData('email_pro', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Téléphone Personnel</label>
                                <input type="text" className="phaos-input" value={data.contact_perso} onChange={e => setData('contact_perso', e.target.value)} />
                            </div>
                            <div>
                                <label className="phaos-label">Téléphone Professionnel</label>
                                <input type="text" className="phaos-input" value={data.contact_pro} onChange={e => setData('contact_pro', e.target.value)} />
                            </div>
                        </div>

                        {/* Section Lignes Contacts d'Urgence */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="phaos-label text-phaos-navy font-bold">Contacts d'Urgence</label>
                                <button type="button" onClick={addContactUrgenceRow} className="text-xs font-bold text-phaos-navy hover:underline">
                                    + Ajouter un Contact d'Urgence
                                </button>
                            </div>

                            {data.contacts_urgence.map((contact, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                    <div className="md:col-span-4">
                                        <input
                                            type="text"
                                            className="phaos-input"
                                            placeholder="Nom & Prénom"
                                            value={contact.nom}
                                            onChange={e => updateContactUrgence(index, 'nom', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <input
                                            type="text"
                                            className="phaos-input"
                                            placeholder="Lien / Relation (ex: Frère, Épouse)"
                                            value={contact.relation}
                                            onChange={e => updateContactUrgence(index, 'relation', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            className="phaos-input"
                                            placeholder="Téléphone"
                                            value={contact.telephone}
                                            onChange={e => updateContactUrgence(index, 'telephone', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-1 text-center">
                                        {data.contacts_urgence.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeContactUrgenceRow(index)}
                                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                title="Supprimer la ligne"
                                            >
                                                ✕
                                            </button>
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
                                <label className="phaos-label">Département</label>
                                <select className="phaos-input" value={data.id_departement} onChange={e => setData('id_departement', e.target.value)} required>
                                    <option value="">Sélectionner...</option>
                                    {departements.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Poste Actuel</label>
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
                                <label className="phaos-label">Type de Contrat</label>
                                <select
                                    className="phaos-input"
                                    value={data.type_contrat}
                                    onChange={e => setData('type_contrat', e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {typesContrat.map((tc, idx) => {
                                        const val = typeof tc === 'object' ? (tc.libelle || tc.code || tc.id) : tc;
                                        return (
                                            <option key={idx} value={val}>
                                                {val}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="phaos-label">Date d'embauche</label>
                                <input type="date" className="phaos-input" value={data.date_entree} onChange={e => setData('date_entree', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Durée Contrat</label>
                                <input type="text" className="phaos-input" value={data.duree_contrat} onChange={e => setData('duree_contrat', e.target.value)} placeholder="ex: 6 mois" />
                            </div>
                            <div>
                                <label className="phaos-label">Date de Fin de Contrat</label>
                                <input type="date" className="phaos-input" value={data.date_fin_contrat} onChange={e => setData('date_fin_contrat', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 4. DIPLÔMES */}
                    <div className="phaos-card space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">4. Diplômes</h2>
                            <button type="button" onClick={addDiplomeRow} className="text-xs font-bold text-phaos-navy hover:underline">+ Ligne Diplôme</button>
                        </div>
                        {data.diplomes.map((dip, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                <div className="md:col-span-4 flex gap-1">
                                    <select className="phaos-input flex-1" value={dip.id_diplome} onChange={e => {
                                        const updated = [...data.diplomes];
                                        updated[index].id_diplome = e.target.value;
                                        setData('diplomes', updated);
                                    }}>
                                        <option value="">Diplôme...</option>
                                        {diplomesOptions.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('diplome', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Ajouter diplôme">+</button>
                                </div>
                                <div className="md:col-span-3">
                                    <input type="text" className="phaos-input" placeholder="Établissement" value={dip.etablissement} onChange={e => {
                                        const updated = [...data.diplomes];
                                        updated[index].etablissement = e.target.value;
                                        setData('diplomes', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-3 flex gap-1">
                                    <select className="phaos-input flex-1" value={dip.id_filiere} onChange={e => {
                                        const updated = [...data.diplomes];
                                        updated[index].id_filiere = e.target.value;
                                        setData('diplomes', updated);
                                    }}>
                                        <option value="">Filière...</option>
                                        {filieresOptions.map(f => <option key={f.id} value={f.id}>{f.libelle}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('filiere', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Ajouter filière">+</button>
                                </div>
                                <div className="md:col-span-1">
                                    <input type="number" className="phaos-input" placeholder="Année" value={dip.annee} onChange={e => {
                                        const updated = [...data.diplomes];
                                        updated[index].annee = e.target.value;
                                        setData('diplomes', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <button type="button" onClick={() => removeRow('diplomes', index)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
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
                        {data.competences.map((comp, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                <div className="md:col-span-8 flex gap-1">
                                    <select className="phaos-input flex-1" value={comp.id_competence} onChange={e => {
                                        const updated = [...data.competences];
                                        updated[index].id_competence = e.target.value;
                                        setData('competences', updated);
                                    }}>
                                        <option value="">Sélectionner compétence...</option>
                                        {competencesOptions.map(c => <option key={c.id} value={c.id}>{c.descri}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('competence', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Ajouter compétence">+</button>
                                </div>
                                <div className="md:col-span-3">
                                    <input type="number" step="0.1" min="1" max="5" className="phaos-input" placeholder="Niveau (1.0 à 5.0)" value={comp.niveau} onChange={e => {
                                        const updated = [...data.competences];
                                        updated[index].niveau = e.target.value;
                                        setData('competences', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <button type="button" onClick={() => removeRow('competences', index)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 6. LANGUES */}
                    <div className="phaos-card space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">6. Langues</h2>
                            <button type="button" onClick={addLangueRow} className="text-xs font-bold text-phaos-navy hover:underline">+ Ligne Langue</button>
                        </div>
                        {data.langues.map((lg, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                                <div className="md:col-span-8 flex gap-1">
                                    <select className="phaos-input flex-1" value={lg.id_langue} onChange={e => {
                                        const updated = [...data.langues];
                                        updated[index].id_langue = e.target.value;
                                        setData('langues', updated);
                                    }}>
                                        <option value="">Sélectionner langue...</option>
                                        {languesOptions.map(l => <option key={l.id} value={l.id}>{l.libelle}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleQuickAdd('langue', index)} className="px-2.5 bg-sky-100 text-[#004B87] font-bold rounded hover:bg-sky-200" title="Ajouter langue">+</button>
                                </div>
                                <div className="md:col-span-3">
                                    <input type="number" step="0.1" min="1" max="5" className="phaos-input" placeholder="Niveau (1.0 à 5.0)" value={lg.niveau} onChange={e => {
                                        const updated = [...data.langues];
                                        updated[index].niveau = e.target.value;
                                        setData('langues', updated);
                                    }} />
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <button type="button" onClick={() => removeRow('langues', index)} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 7. COMPTE SYSTEME */}
                    <div className="phaos-card space-y-4">
                        <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">7. Paramètres d'Accès Compte</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="phaos-label">Login</label>
                                <input type="text" className="phaos-input" value={data.login} onChange={e => setData('login', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Mot de Passe Initial</label>
                                <input type="password" className="phaos-input" value={data.password} onChange={e => setData('password', e.target.value)} required />
                            </div>
                            <div>
                                <label className="phaos-label">Rôle Système</label>
                                <select className="phaos-input" value={data.id_role} onChange={e => setData('id_role', e.target.value)} required>
                                    <option value="">Sélectionner...</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.libelle}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        {/* Bouton de soumission avec type="submit" explicite */}
                        <button type="submit" disabled={processing} className="phaos-btn-primary">
                            Enregistrer et Activer le Compte
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
