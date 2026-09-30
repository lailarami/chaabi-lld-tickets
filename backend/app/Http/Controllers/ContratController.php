<?php

namespace App\Http\Controllers;

use App\Models\Contrat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ContratController extends Controller
{
    private function prepareContratData(Request $request): array
    {
        $request->validate([
            'produit' => 'required|string|max:150',
            'type' => 'required_without:licence|string|in:licence,contrat',
            'licence' => 'required_without:type|string|max:150',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
        ]);

        $type = $request->input('type', $request->input('licence'));

        $data = [
            'produit' => $request->produit,
            'licence' => $type,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
        ];

        if ($request->filled('description') && Schema::hasColumn('contrats', 'description')) {
            $data['description'] = $request->description;
        }

        return $data;
    }

    public function index(): JsonResponse
    {
        $contrats = Contrat::orderBy('date_debut', 'desc')->get();
        return response()->json($contrats);
    }

    public function store(Request $request): JsonResponse
    {
        $contrat = Contrat::create($this->prepareContratData($request));

        return response()->json([
            'message' => 'Contrat créé avec succès.',
            'contrat' => $contrat,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $contrat = Contrat::findOrFail($id);
        $contrat->update($this->prepareContratData($request));

        return response()->json([
            'message' => 'Contrat mis à jour avec succès.',
            'contrat' => $contrat,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $contrat = Contrat::findOrFail($id);
        $contrat->delete();

        return response()->json(['message' => 'Contrat supprimé avec succès.']);
    }

    public function clearAll(): JsonResponse
    {
        Contrat::query()->delete();

        return response()->json(['message' => 'Tous les contrats ont été supprimés avec succès.']);
    }
}
