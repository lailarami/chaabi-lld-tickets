<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('sous_categorie')->delete();

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

        foreach ($categories as $categoryName => $subNames) {
            $category = DB::table('categorie')->where('nom', $categoryName)->first();
            if (!$category) {
                continue;
            }

            foreach ($subNames as $subName) {
                DB::table('sous_categorie')->insertOrIgnore([
                    'nom' => $subName,
                    'id_categorie' => $category->id_categorie,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('sous_categorie')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
