<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $utilisateur = Utilisateur::with('role')
            ->where('email', $request->email)
            ->first();

        if (!$utilisateur || !Hash::check($request->password, $utilisateur->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Vérifier que l'utilisateur est actif
        if (!$utilisateur->actif) {
            throw ValidationException::withMessages([
                'email' => ['Votre compte a été désactivé. Contactez l\'administrateur.'],
            ]);
        }

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token,
            'utilisateur' => [
                'id_utilisateur' => $utilisateur->id_utilisateur,
                'nom' => $utilisateur->nom,
                'email' => $utilisateur->email,
                'role' => $utilisateur->role?->nom_role,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'id_utilisateur' => $user->id_utilisateur,
            'nom' => $user->nom,
            'email' => $user->email,
            'role' => $user->role?->nom_role,
        ]);
    }

    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|unique:utilisateur,email,' . $user->id_utilisateur . ',id_utilisateur',
            'password' => 'sometimes|string|min:6',
        ]);

        $data = ['email' => $request->email];
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        $user->load('role');

        return response()->json([
            'id_utilisateur' => $user->id_utilisateur,
            'nom' => $user->nom,
            'email' => $user->email,
            'role' => $user->role?->nom_role,
        ]);
    }
}
