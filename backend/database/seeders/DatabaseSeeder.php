<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        $roles = [
            ['nom_role' => 'user'],
            ['nom_role' => 'traiteur'],
            ['nom_role' => 'validateur'],
            ['nom_role' => 'admin'],
        ];
        foreach ($roles as $role) {
            DB::table('role')->insertOrIgnore($role);
        }

        // Categories
        $categories = [
            ['nom' => 'Infrastructure'],
            ['nom' => 'Systeme'],
            ['nom' => 'Securite'],
        ];
        foreach ($categories as $cat) {
            DB::table('categorie')->insertOrIgnore($cat);
        }

        // Admin user
        $adminRole = DB::table('role')->where('nom_role', 'admin')->first();
        $traiteurRole = DB::table('role')->where('nom_role', 'traiteur')->first();
        $validateurRole = DB::table('role')->where('nom_role', 'validateur')->first();
        $userRole = DB::table('role')->where('nom_role', 'user')->first();

        $users = [
            [
                'nom' => 'Administrateur Système',
                'email' => 'admin@chaabilld.ma',
                'password' => Hash::make('Admin@2024'),
                'id_role' => $adminRole->id_role,
            ],
            [
                'nom' => 'Mohammed Alami',
                'email' => 'traiteur@chaabilld.ma',
                'password' => Hash::make('Traiteur@2024'),
                'id_role' => $traiteurRole->id_role,
            ],
            [
                'nom' => 'Fatima Benali',
                'email' => 'validateur@chaabilld.ma',
                'password' => Hash::make('Validateur@2024'),
                'id_role' => $validateurRole->id_role,
            ],
            [
                'nom' => 'Youssef Idrissi',
                'email' => 'user@chaabilld.ma',
                'password' => Hash::make('User@2024'),
                'id_role' => $userRole->id_role,
            ],
        ];

        foreach ($users as $user) {
            DB::table('utilisateur')->insertOrIgnore($user);
        }

        // Seed subcategories
        $this->call(SousCategorieSeeder::class);
    }
}
