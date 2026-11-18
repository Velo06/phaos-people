<?php

namespace App\Http\Controllers;

use App\Models\DemandeAbsence;
use App\Models\TypeAbsence;
use App\Models\TypePermission;
use App\Models\StatutAbsence;
use App\Models\Personnel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AbsenceController extends Controller
{
    public function create()
    {
        $user = auth()->user();

        return Inertia::render('Conges/DemandeAbsence', [
            'typesAbsence' => TypeAbsence::all(),
            'typesPermission' => TypePermission::all(),
            'collegues' => Personnel::where('id', '!=', $user->id_personnel)
                ->where('statut', 'actif')
                ->select('id', 'nom', 'prenom')
                ->get(),
            'reglesDelais' => config('conges.delais_prevenance'),
        ]);
    }

    public function store(Request $request)
    {
        $typeAbsence = TypeAbsence::findOrFail($request->id_type_absence);
        $typePermission = $request->id_type_permission
            ? TypePermission::find($request->id_type_permission)
            : null;

        // 1. Construction dynamique des règles de validation
        $rules = [
            'id_type_absence' => 'required|exists:type_absence,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'id_interim' => 'nullable|exists:personnel,id',
        ];

        if ($typeAbsence->code === 'CONGE') {
            $rules['motif'] = 'nullable|string';
            $rules['piece_jointe'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
        }
        elseif ($typeAbsence->code === 'PERMISSION') {
            $rules['id_type_permission'] = 'required|exists:type_permission,id';
            $rules['motif'] = 'required|string|min:5';
            $rules['piece_jointe'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';

            if ($typePermission && $typePermission->code === 'BANQUE_HEURE') {
                $rules['heure_debut'] = 'required|date_format:H:i';
                $rules['heure_fin'] = 'required|date_format:H:i|after:heure_debut';
            }
        }
        elseif ($typeAbsence->code === 'REGULARISATION') {
            $rules['id_type_permission'] = 'nullable|exists:type_permission,id';
            $rules['motif'] = 'required|string|min:5';
            $rules['piece_jointe'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['id_interim'] = 'required|exists:personnel,id';
        }

        $validated = $request->validate($rules);

        // 2. Calcul de la durée et vérification du délai (uniquement pour les congés)
        $debut = Carbon::parse($validated['date_debut']);
        $fin = Carbon::parse($validated['date_fin']);
        $nbJours = $debut->diffInDays($fin) + 1;

        if ($typeAbsence->code === 'CONGE') {
            $joursAvantDepart = Carbon::today()->diffInDays($debut, false);
            $regles = config('conges.delais_prevenance');

            foreach ($regles as $regle) {
                if ($nbJours <= $regle['max_jours']) {
                    if ($joursAvantDepart < $regle['preavis_jours']) {
                        throw ValidationException::withMessages([
                            'date_debut' => "Délai non respecté : il faut poser la demande au moins {$regle['label']}.",
                        ]);
                    }
                    break;
                }
            }
        }

        // 3. Enregistrement transactionnel
        DB::transaction(function () use ($request, $validated, $nbJours) {
            $cheminPj = null;
            if ($request->hasFile('piece_jointe')) {
                $cheminPj = $request->file('piece_jointe')->store('justificatifs_absences', 'public');
            }

            $statutInitial = StatutAbsence::where('code', 'EN_ATTENTE')->firstOrFail();
            $idPersonnel = auth()->user()->id_personnel;

            $demande = DemandeAbsence::create([
                'id_personnel' => $idPersonnel,
                'id_type_absence' => $validated['id_type_absence'],
                'id_type_permission' => $validated['id_type_permission'] ?? null,
                'date_debut' => $validated['date_debut'],
                'date_fin' => $validated['date_fin'],
                'heure_debut' => $validated['heure_debut'] ?? null,
                'heure_fin' => $validated['heure_fin'] ?? null,
                'nombre_jours' => $nbJours,
                'id_interim' => $validated['id_interim'] ?? null,
                'id_statut' => $statutInitial->id,
                'motif' => $validated['motif'] ?? null,
                'piece_jointe' => $cheminPj,
            ]);

            DB::table('historique_statut_demande_absence')->insert([
                'id_demande' => $demande->id,
                'id_statut' => $statutInitial->id,
                'date_heure' => now(),
                'id_responsable' => null,
            ]);
        });

        return back()->with('success', 'Votre demande d’absence a été enregistrée et transmise pour validation.');
    }
}
