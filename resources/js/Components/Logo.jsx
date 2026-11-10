import React from 'react';
import { Link } from '@inertiajs/react';

const Logo = React.memo(({ className = '', showText = true }) => {
    return (
        <Link
            href={route('dashboard')}
            className={`flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-1 transition-all ${className}`}
            aria-label="Retour au Tableau de Bord PHAOS PEOPLE"
        >
            {/* Symbole SVG Stylisé représentant l'Énergie & le Conseil (PHAOS) */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004B87] to-[#00A3E0] flex items-center justify-center shadow-md shadow-sky-900/20 group-hover:scale-105 transition-transform duration-200">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-6 h-6 text-white stroke-current stroke-[2.5]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className="text-lg font-black tracking-wider text-[#004B87] leading-tight">
                        PHAOS
                    </span>
                    <span className="text-[10px] font-semibold tracking-widest text-sky-600 uppercase leading-none">
                        PEOPLE
                    </span>
                </div>
            )}
        </Link>
    );
});

Logo.displayName = 'Logo';
export default Logo;
