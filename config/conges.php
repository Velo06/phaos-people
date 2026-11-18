<?php

return [
    // Paramètres d'acquisition annuelle
    'acquisition_mensuelle' => 2.5,
    'plafond_annuel' => 30,

    // Règles de délai de prévenance (en jours calendaires avant date_debut)
    'delais_prevenance' => [
        [
            'max_jours' => 1.99, // < 2 jours
            'preavis_jours' => 7, // 1 semaine à l'avance
            'label' => '1 semaine à l’avance pour un congé de moins de 2 jours',
        ],
        [
            'max_jours' => 5, // 2 à 5 jours
            'preavis_jours' => 30, // 1 mois à l'avance
            'label' => '1 mois à l’avance pour un congé de 2 à 5 jours',
        ],
        [
            'max_jours' => 15, // > 5 à 15 jours
            'preavis_jours' => 90, // 3 mois à l'avance
            'label' => '3 mois à l’avance pour un congé de 5 à 15 jours',
        ],
        [
            'max_jours' => 999, // + de 15 jours
            'preavis_jours' => 180, // 6 mois à l'avance
            'label' => '6 mois à l’avance pour un congé de plus de 15 jours',
        ],
    ],
];
