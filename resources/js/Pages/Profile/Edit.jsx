import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '@/../css/collaborateur.css';

export default function Edit({ user }) {
    const { flash } = usePage().props;

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

    return (
        <AuthenticatedLayout>
            <Head title="Mon Profil - PHAOS PEOPLE" />

            <div className="max-w-3xl mx-auto space-y-6 pb-10">
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-phaos-navy">Paramètres du Profil</h1>
                    <p className="text-xs text-slate-500">Gérez vos informations de compte et modifiez votre mot de passe initial.</p>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <Link
                    href={route('collaborateurs.dossier.show', user.id)}
                    className="phaos-btn-primary inline-flex items-center gap-2 text-xs font-bold"
                >
                    <span>Mon dossier</span>
                </Link>

                {/* Informations de base (Lecture seule) */}
                <div className="phaos-card space-y-4">
                    <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                        Informations du Compte
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-400 text-xs">Nom complet</span>
                            <span className="font-medium text-slate-700">
                                {user.personnel ? `${user.personnel.prenom} ${user.personnel.nom}` : 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs">Login système</span>
                            <span className="font-medium text-slate-700">{user.login}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs">Rôle</span>
                            <span className="font-medium text-slate-700">{user.role?.libelle || 'Collaborateur'}</span>
                        </div>
                    </div>
                </div>

                {/* Formulaire Modification Mot de Passe */}
                <div className="phaos-card space-y-4">
                    <h2 className="text-xs font-bold text-phaos-navy uppercase tracking-wider border-b pb-2">
                        Modifier le Mot de Passe
                    </h2>

                    <form onSubmit={submit} className="space-y-4">

                        {/* Mot de passe actuel */}
                        <div>
                            <label className="phaos-label">Mot de passe actuel</label>

                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    className="phaos-input pr-10"
                                    value={data.current_password}
                                    onChange={e => setData('current_password', e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
                                    aria-label={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {errors.current_password && (
                                <span className="text-xs text-red-500 mt-1 block">{errors.current_password}</span>
                            )}
                        </div>

                        {/* Nouveau mot de passe */}
                        <div>
                            <label className="phaos-label">Nouveau mot de passe</label>

                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    className="phaos-input pr-10"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
                                    aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {errors.password && (
                                <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>
                            )}
                        </div>

                        {/* Confirmation du mot de passe */}
                        <div>
                            <label className="phaos-label">Confirmer le nouveau mot de passe</label>

                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="phaos-input pr-10"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
                                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="phaos-btn-primary"
                            >
                                {processing ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
