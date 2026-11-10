import React from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <Head title="Connexion - PHAOS PEOPLE" />

            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">PHAOS PEOPLE</h1>
                    <p className="text-sm text-gray-500">Plateforme RH & Onboarding</p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Identifiant / Email pro
                        </label>
                        <input
                            type="text"
                            value={data.login}
                            onChange={(e) => setData('login', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            required
                        />
                        {errors.login && (
                            <span className="text-xs text-red-500 mt-1">{errors.login}</span>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            required
                        />
                        {errors.password && (
                            <span className="text-xs text-red-500 mt-1">{errors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
