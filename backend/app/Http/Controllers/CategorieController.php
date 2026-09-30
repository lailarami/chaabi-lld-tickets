<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\JsonResponse;

class CategorieController extends Controller
{
    public function index(): JsonResponse
    {
        $cats = Categorie::orderBy('nom')->get();
        if ($cats->isEmpty()) {
            $cats = collect([
                (object) ['id_categorie' => 8, 'nom' => 'MATERIEL info'],
                (object) ['id_categorie' => 9, 'nom' => 'BASE DE DONNEES'],
                (object) ['id_categorie' => 10, 'nom' => 'RÉSEAU et connexion'],
                (object) ['id_categorie' => 11, 'nom' => 'APPLICATION'],
                (object) ['id_categorie' => 12, 'nom' => 'MESSAGERIE'],
                (object) ['id_categorie' => 13, 'nom' => 'INTERNET'],
                (object) ['id_categorie' => 14, 'nom' => 'ACTIVE DIRECTORY'],
                (object) ['id_categorie' => 15, 'nom' => 'LOGICIEL'],
                (object) ['id_categorie' => 16, 'nom' => 'INFRASTRUCTURE IT'],
                (object) ['id_categorie' => 17, 'nom' => 'SECURITE IT'],
                (object) ['id_categorie' => 18, 'nom' => 'Cisco et telephonie'],
                (object) ['id_categorie' => 19, 'nom' => 'ACCESSOIR INFORMATIQUE'],
                (object) ['id_categorie' => 20, 'nom' => 'PORTAIL WEB'],
            ]);
        }

        return response()->json($cats);
    }

    public function sousCategories(): JsonResponse
    {
        $categorie = request('categorie');
        if ($categorie) {
            $categorieModel = Categorie::find($categorie);
            if ($categorieModel) {
                return response()->json($categorieModel->sousCategories ?? []);
            }
            return response()->json([]);
        }
        $subs = \App\Models\SousCategorie::with('categorie')->orderBy('nom')->get();
        if ($subs->isEmpty()) {
            $subs = collect([
                (object)['id' => 90, 'nom' => 'POST DE TRAVAIL', 'id_categorie' => 8],
                (object)['id' => 91, 'nom' => 'ECRAN', 'id_categorie' => 8],
                (object)['id' => 92, 'nom' => 'IMPRESSION', 'id_categorie' => 8],
                (object)['id' => 93, 'nom' => 'SERVEUR ET STOCKAGE', 'id_categorie' => 8],
                (object)['id' => 94, 'nom' => 'RESEAU ET SWITCH', 'id_categorie' => 8],
                (object)['id' => 95, 'nom' => 'MOBILITE', 'id_categorie' => 8],
                (object)['id' => 96, 'nom' => 'BASE DE DONNEES', 'id_categorie' => 9],
                (object)['id' => 97, 'nom' => 'RÉSEAU ET CONNEXION', 'id_categorie' => 10],
                (object)['id' => 98, 'nom' => 'SAGE', 'id_categorie' => 11],
                (object)['id' => 99, 'nom' => 'LOCPR', 'id_categorie' => 11],
                (object)['id' => 100, 'nom' => 'ONBASE', 'id_categorie' => 11],
                (object)['id' => 101, 'nom' => 'CHAABIOCAS', 'id_categorie' => 11],
                (object)['id' => 102, 'nom' => 'MESSAGERIE', 'id_categorie' => 12],
                (object)['id' => 103, 'nom' => 'INTERNET', 'id_categorie' => 13],
                (object)['id' => 104, 'nom' => 'ACTIVE DIRECTORY', 'id_categorie' => 14],
                (object)['id' => 105, 'nom' => 'INSTALLATION ET DEPLOIEMENT', 'id_categorie' => 15],
                (object)['id' => 106, 'nom' => 'ACCESS ET LICENCE', 'id_categorie' => 15],
                (object)['id' => 107, 'nom' => 'INCIDENT LOGICIEL', 'id_categorie' => 15],
                (object)['id' => 108, 'nom' => 'CONFIGURATION', 'id_categorie' => 15],
                (object)['id' => 109, 'nom' => 'SECURITE LOGICIEL', 'id_categorie' => 15],
                (object)['id' => 110, 'nom' => 'SAUVEGARDE ET RESTEAURATION', 'id_categorie' => 16],
                (object)['id' => 111, 'nom' => 'VIRTUALISATION', 'id_categorie' => 16],
                (object)['id' => 112, 'nom' => 'STOCKAGE', 'id_categorie' => 16],
                (object)['id' => 113, 'nom' => 'ALIMENTATION DATA CENTER', 'id_categorie' => 16],
                (object)['id' => 114, 'nom' => 'ONDULAIRE DATE CENTER', 'id_categorie' => 16],
                (object)['id' => 115, 'nom' => 'DATA CENTER RACK', 'id_categorie' => 16],
                (object)['id' => 116, 'nom' => 'GESTION DES ACCESS', 'id_categorie' => 17],
                (object)['id' => 117, 'nom' => 'NAC', 'id_categorie' => 17],
                (object)['id' => 118, 'nom' => 'SECURITE MESSAGERIE', 'id_categorie' => 17],
                (object)['id' => 119, 'nom' => 'SECURITE DES POSTES', 'id_categorie' => 17],
                (object)['id' => 120, 'nom' => 'SECURITE RESEAU', 'id_categorie' => 17],
                (object)['id' => 121, 'nom' => 'INCIDENT DE SECURITE', 'id_categorie' => 17],
                (object)['id' => 122, 'nom' => 'SECURITE CLOUD', 'id_categorie' => 17],
                (object)['id' => 123, 'nom' => 'SECURITE LOGICIEL', 'id_categorie' => 17],
                (object)['id' => 124, 'nom' => 'TELEPHONIE IP', 'id_categorie' => 18],
                (object)['id' => 125, 'nom' => 'LES LIGNES ET LES COMPTES TEL', 'id_categorie' => 18],
                (object)['id' => 126, 'nom' => 'CENTRE DES CONTACTS', 'id_categorie' => 18],
                (object)['id' => 127, 'nom' => 'RESEAU VOIP', 'id_categorie' => 18],
                (object)['id' => 128, 'nom' => 'GESTION DE CALENDRIER', 'id_categorie' => 18],
                (object)['id' => 129, 'nom' => 'PEREPHIRIQUE', 'id_categorie' => 19],
                (object)['id' => 130, 'nom' => 'CLAVIER', 'id_categorie' => 19],
                (object)['id' => 131, 'nom' => 'SOURIS', 'id_categorie' => 19],
                (object)['id' => 132, 'nom' => 'ALEMENTATION', 'id_categorie' => 19],
                (object)['id' => 133, 'nom' => 'CASQUE', 'id_categorie' => 19],
                (object)['id' => 134, 'nom' => 'EXTRA NET CLIENT', 'id_categorie' => 20],
            ]);
        }

        return response()->json($subs);
    }
}
