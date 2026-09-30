<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SousCategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Each category is its own subcategory (simpler model)
     */
    public function run(): void
    {
        // Catégories définitives à conserver uniquement
        $categories = [
            'MATERIEL info' => [
                'POST DE TRAVAIL',
                'ECRAN',
                'IMPRESSION',
                'SERVEUR ET STOCKAGE',
                'RESEAU ET SWITCH',
                'MOBILITE',
            ],
            'BASE DE DONNEES' => ['BASE DE DONNEES'],
            'RÉSEAU et connexion' => ['RÉSEAU ET CONNEXION'],
            'APPLICATION' => [
                'SAGE',
                'LOCPR',
                'ONBASE',
                'CHAABIOCAS',
            ],
            'MESSAGERIE' => ['MESSAGERIE'],
            'INTERNET' => ['INTERNET'],
            'ACTIVE DIRECTORY' => ['ACTIVE DIRECTORY'],
            'LOGICIEL' => [
                'INSTALLATION ET DEPLOIEMENT',
                'ACCESS ET LICENCE',
                'INCIDENT LOGICIEL',
                'CONFIGURATION',
                'SECURITE LOGICIEL',
            ],
            'INFRASTRUCTURE IT' => [
                'SAUVEGARDE ET RESTEAURATION',
                'VIRTUALISATION',
                'STOCKAGE',
                'ALIMENTATION DATA CENTER',
                'ONDULAIRE DATE CENTER',
                'DATA CENTER RACK',
            ],
            'SECURITE IT' => [
                'GESTION DES ACCESS',
                'NAC',
                'SECURITE MESSAGERIE',
                'SECURITE DES POSTES',
                'SECURITE RESEAU',
                'INCIDENT DE SECURITE',
                'SECURITE CLOUD',
                'SECURITE LOGICIEL',
            ],
            'Cisco et telephonie' => [
                'TELEPHONIE IP',
                'LES LIGNES ET LES COMPTES TEL',
                'CENTRE DES CONTACTS',
                'RESEAU VOIP',
                'GESTION DE CALENDRIER',
            ],
            'ACCESSOIR INFORMATIQUE' => [
                'PEREPHIRIQUE',
                'CLAVIER',
                'SOURIS',
                'ALEMENTATION',
                'CASQUE',
            ],
            'PORTAIL WEB' => ['EXTRA NET CLIENT'],
        ];

        foreach ($categories as $nom => $sousCategories) {
            $cat = DB::table('categorie')->where('nom', $nom)->first();
            if (!$cat) {
                continue;
            }

            foreach ($sousCategories as $sousNom) {
                if (!DB::table('sous_categorie')->where('nom', $sousNom)->exists()) {
                    DB::table('sous_categorie')->insert([
                        'nom' => $sousNom,
                        'id_categorie' => $cat->id_categorie,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
