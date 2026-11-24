import React, { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import {
    FolderTree,
    FolderOpen,
    FileStack,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function ParametrageDocuments({ categories = [], typesDocuments = [] }) {
    const { flash, errors } = usePage().props;

    const [activeTab, setActiveTab] = useState('types');

    // État formulaire Catégorie
    const [editingCategorie, setEditingCategorie] = useState(null);
    const [catLibelle, setCatLibelle] = useState('');
    const [savingCat, setSavingCat] = useState(false);

    // État formulaire Type de Document
    const [editingType, setEditingType] = useState(null);
    const [typeForm, setTypeForm] = useState({
        id_categorie_document: categories[0]?.id || '',
        libelle: '',
        origine: 'collaborateur',
        est_obligatoire: true,
        nombre_requis: 1,
    });
    const [savingType, setSavingType] = useState(false);

    // ==================== CATÉGORIES ====================

    const resetCategorieForm = () => {
        setEditingCategorie(null);
        setCatLibelle('');
    };

    const startEditCategorie = (cat) => {
        setEditingCategorie(cat);
        setCatLibelle(cat.libelle || '');
    };

    const submitCategorie = (e) => {
        e.preventDefault();
        if (!catLibelle.trim()) return;

        setSavingCat(true);

        if (editingCategorie) {
            router.put(
                route('rh.categories-documents.update', editingCategorie.id),
                { libelle: catLibelle },
                {
                    preserveScroll: true,
                    onSuccess: () => resetCategorieForm(),
                    onFinish: () => setSavingCat(false),
                }
            );
        } else {
            router.post(
                route('rh.categories-documents.store'),
                { libelle: catLibelle },
                {
                    preserveScroll: true,
                    onSuccess: () => resetCategorieForm(),
                    onFinish: () => setSavingCat(false),
                }
            );
        }
    };

    const deleteCategorie = (cat) => {
        if (!confirm(`Supprimer la catégorie « ${cat.libelle} » ?`)) return;
        router.delete(route('rh.categories-documents.destroy', cat.id), {
            preserveScroll: true,
        });
    };

    // ==================== TYPES DE DOCUMENTS ====================

    const resetTypeForm = () => {
        setEditingType(null);
        setTypeForm({
            id_categorie_document: categories[0]?.id || '',
            libelle: '',
            origine: 'collaborateur',
            est_obligatoire: true,
            nombre_requis: 1,
        });
    };

    const startEditType = (typeDoc) => {
        setEditingType(typeDoc);
        setTypeForm({
            id_categorie_document: typeDoc.id_categorie_document || '',
            libelle: typeDoc.libelle || '',
            origine: typeDoc.origine || 'collaborateur',
            est_obligatoire: Boolean(typeDoc.est_obligatoire),
            nombre_requis: Number(typeDoc.nombre_requis || 1),
        });
    };

    const submitType = (e) => {
        e.preventDefault();
        if (!typeForm.libelle.trim() || !typeForm.id_categorie_document) return;

        setSavingType(true);

        if (editingType) {
            router.put(route('rh.types-documents.update', editingType.id), typeForm, {
                preserveScroll: true,
                onSuccess: () => resetTypeForm(),
                onFinish: () => setSavingType(false),
            });
        } else {
            router.post(route('rh.types-documents.store'), typeForm, {
                preserveScroll: true,
                onSuccess: () => resetTypeForm(),
                onFinish: () => setSavingType(false),
            });
        }
    };

    const deleteType = (typeDoc) => {
        if (!confirm(`Supprimer le type de document « ${typeDoc.libelle} » ?`)) return;
        router.delete(route('rh.types-documents.destroy', typeDoc.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Paramétrage des documents - PHAOS PEOPLE" />

            <div className="max-w-6xl mx-auto space-y-6 pb-12">
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">
                        Paramétrage des Catégories & Types de Documents
                    </h1>
                    <p className="text-xs text-slate-500">
                        Configurez les catégories, les pièces attendues des collaborateurs et les documents d'engagement entreprise.
                    </p>
                </div>

                <Link
                    href={route('rh.modeles-documents.index')}
                    className="phaos-btn-primary inline-flex items-center gap-2 text-xs font-bold self-start sm:self-auto"
                >
                    <FolderOpen size={16} />
                    <span>Mod&egrave;les documents</span>
                </Link>

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
                        {Object.values(errors).map((err, i) => (
                            <p key={i}>• {err}</p>
                        ))}
                    </div>
                )}

                {/* Onglets */}
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab('types')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'types'
                                ? 'bg-white text-phaos-navy shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <FileStack size={15} />
                        <span>Types de documents ({typesDocuments.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('categories')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'categories'
                                ? 'bg-white text-phaos-navy shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <FolderTree size={15} />
                        <span>Catégories ({categories.length})</span>
                    </button>
                </div>

                {/* ==================== ONGLET TYPES DE DOCUMENTS ==================== */}
                {activeTab === 'types' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Formulaire Ajout / Modification Type */}
                        <form onSubmit={submitType} className="phaos-card space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">
                                    {editingType ? 'Modifier un type de document' : 'Nouveau type de document'}
                                </h2>
                                {editingType && (
                                    <button
                                        type="button"
                                        onClick={resetTypeForm}
                                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                                    >
                                        <X size={14} /> Annuler
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="phaos-label">Catégorie</label>
                                <select
                                    className="phaos-input text-xs"
                                    value={typeForm.id_categorie_document}
                                    onChange={(e) =>
                                        setTypeForm({ ...typeForm, id_categorie_document: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">-- Choisir une catégorie --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="phaos-label">Libellé du document</label>
                                <input
                                    type="text"
                                    className="phaos-input text-xs"
                                    placeholder="Ex. Certificat de résidence, Contrat de travail..."
                                    value={typeForm.libelle}
                                    onChange={(e) => setTypeForm({ ...typeForm, libelle: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="phaos-label">Origine</label>
                                <select
                                    className="phaos-input text-xs"
                                    value={typeForm.origine}
                                    onChange={(e) => setTypeForm({ ...typeForm, origine: e.target.value })}
                                >
                                    <option value="collaborateur">Collaborateur (téléversé)</option>
                                    <option value="entreprise">Entreprise (généré RH)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="phaos-label">Nombre de pièces requis</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        className="phaos-input text-xs"
                                        value={typeForm.nombre_requis}
                                        onChange={(e) =>
                                            setTypeForm({
                                                ...typeForm,
                                                nombre_requis: Math.max(1, Number(e.target.value || 1)),
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="flex flex-col justify-end pb-1">
                                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(typeForm.est_obligatoire)}
                                            onChange={(e) =>
                                                setTypeForm({ ...typeForm, est_obligatoire: e.target.checked })
                                            }
                                            className="rounded border-slate-300"
                                        />
                                        <span>Obligatoire</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={savingType}
                                className="phaos-btn-primary w-full inline-flex items-center justify-center gap-2 text-xs font-bold"
                            >
                                <Plus size={15} />
                                <span>
                                    {savingType
                                        ? 'Enregistrement...'
                                        : editingType
                                        ? 'Mettre à jour le type'
                                        : 'Ajouter le type'}
                                </span>
                            </button>
                        </form>

                        {/* Liste des types */}
                        <div className="lg:col-span-2 phaos-card overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                                        <th className="py-2.5 pr-3">Document</th>
                                        <th className="py-2.5 pr-3">Catégorie</th>
                                        <th className="py-2.5 pr-3">Origine</th>
                                        <th className="py-2.5 pr-3">Exigence</th>
                                        <th className="py-2.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {typesDocuments.map((t) => (
                                        <tr key={t.id}>
                                            <td className="py-3 pr-3 font-semibold text-slate-800">{t.libelle}</td>
                                            <td className="py-3 pr-3 text-slate-600">{t.categorie?.libelle || '—'}</td>
                                            <td className="py-3 pr-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        t.origine === 'entreprise'
                                                            ? 'bg-sky-50 text-[#004B87]'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {t.origine}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-3 text-slate-600">
                                                {t.est_obligatoire ? 'Obligatoire' : 'Facultatif'} •{' '}
                                                <strong>{t.nombre_requis || 1}</strong> pièce(s)
                                            </td>
                                            <td className="py-3 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditType(t)}
                                                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold mr-3"
                                                >
                                                    <Pencil size={13} /> Modifier
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteType(t)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                                                >
                                                    <Trash2 size={13} /> Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ==================== ONGLET CATÉGORIES ==================== */}
                {activeTab === 'categories' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <form onSubmit={submitCategorie} className="phaos-card space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider">
                                    {editingCategorie ? 'Modifier une catégorie' : 'Nouvelle catégorie'}
                                </h2>
                                {editingCategorie && (
                                    <button
                                        type="button"
                                        onClick={resetCategorieForm}
                                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                                    >
                                        <X size={14} /> Annuler
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="phaos-label">Libellé de la catégorie</label>
                                <input
                                    type="text"
                                    className="phaos-input text-xs"
                                    placeholder="Ex. Pièces d'identité, Contrats & Engagement..."
                                    value={catLibelle}
                                    onChange={(e) => setCatLibelle(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={savingCat}
                                className="phaos-btn-primary w-full inline-flex items-center justify-center gap-2 text-xs font-bold"
                            >
                                <Plus size={15} />
                                <span>
                                    {savingCat
                                        ? 'Enregistrement...'
                                        : editingCategorie
                                        ? 'Mettre à jour la catégorie'
                                        : 'Ajouter la catégorie'}
                                </span>
                            </button>
                        </form>

                        <div className="lg:col-span-2 phaos-card overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                                        <th className="py-2.5 pr-3">Catégorie</th>
                                        <th className="py-2.5 pr-3">Types associés</th>
                                        <th className="py-2.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {categories.map((cat) => (
                                        <tr key={cat.id}>
                                            <td className="py-3 pr-3 font-semibold text-slate-800">{cat.libelle}</td>
                                            <td className="py-3 pr-3 text-slate-600">
                                                {cat.types_document_count ?? 0} type(s)
                                            </td>
                                            <td className="py-3 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditCategorie(cat)}
                                                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold mr-3"
                                                >
                                                    <Pencil size={13} /> Modifier
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCategorie(cat)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                                                >
                                                    <Trash2 size={13} /> Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
