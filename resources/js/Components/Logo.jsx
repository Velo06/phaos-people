import React from 'react';
import { Link } from '@inertiajs/react';

const Logo = React.memo(({ className = '', showText = true }) => {
    return (
        <Link
            href={route('dashboard')}
            className={`flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-1 transition-all ${className}`}
            aria-label="Retour au Tableau de Bord PHAOS PEOPLE"
        >
            <img src="/img/phaos.png" alt="PHAOS" className="w-6 h-6 object-contain"/>

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
