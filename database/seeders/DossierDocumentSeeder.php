<?php

namespace Database\Seeders;

use App\Models\CategorieDocument;
use App\Models\TypeDocument;
use Illuminate\Database\Seeder;

class DossierDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $donnees = [
            'Pièces administratives' => [
                [
                    'libelle' => 'CIN légalisée',
                    'est_obligatoire' => true,
                    'origine' => 'collaborateur',
                ],
                [
                    'libelle' => "Photos d'identité",
                    'est_obligatoire' => true,
                    'origine' => 'collaborateur',
                    'nombre_requis' => 2,
                ],
                [
                    'libelle' => 'Certificat de résidence',
                    'est_obligatoire' => true,
                    'origine' => 'collaborateur',
                ],
                [
                    'libelle' => 'RIB',
                    'est_obligatoire' => false,
                    'origine' => 'collaborateur',
                ],
            ],
            'Pièces académiques' => [
                [
                    'libelle' => 'Relevés de notes',
                    'est_obligatoire' => true,
                    'origine' => 'collaborateur',
                ],
                [
                    'libelle' => 'Dernier diplôme',
                    'est_obligatoire' => false,
                    'origine' => 'collaborateur',
                ],
                [
                    'libelle' => 'Diplôme du Baccalauréat',
                    'est_obligatoire' => true,
                    'origine' => 'collaborateur',
                ],
                [
                    'libelle' => 'Attestation de stage',
                    'est_obligatoire' => false,
                    'origine' => 'collaborateur',
                ],
            ],
            "Documents d'engagement" => [
                [
                    'libelle' => 'Fiche de poste',
                    'est_obligatoire' => true,
                    'origine' => 'entreprise',
                ],
                [
                    'libelle' => 'Fiche collaborateur',
                    'est_obligatoire' => true,
                    'origine' => 'entreprise',
                ],
                [
                    'libelle' => 'Contrat / convention',
                    'est_obligatoire' => true,
                    'origine' => 'entreprise',
                ],
                [
                    'libelle' => "Documents d'engagement internes",
                    'est_obligatoire' => true,
                    'origine' => 'entreprise',
                ],
            ],
        ];

        foreach ($donnees as $libelleCategorie => $types) {
            $categorie = CategorieDocument::updateOrCreate(
                ['libelle' => $libelleCategorie],
                ['libelle' => $libelleCategorie]
            );

            foreach ($types as $type) {
                TypeDocument::updateOrCreate(
                    [
                        'id_categorie' => $categorie->id,
                        'libelle' => $type['libelle'],
                    ],
                    [
                        'est_obligatoire' => $type['est_obligatoire'],
                        'origine' => $type['origine'],
                        'nombre_requis' => $type['nombre_requis'] ?? 1,
                    ]
                );
            }
        }
    }
}
