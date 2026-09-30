<?php

namespace App\Models;

use App\Models\Categorie;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'utilisateur';
    protected $primaryKey = 'id_utilisateur';

    protected $fillable = [
        'nom',
        'email',
        'password',
        'id_role',
        'actif',
    ];

    protected $hidden = ['password', 'remember_token'];

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function ticketsTraites()
    {
        return $this->hasMany(Ticket::class, 'id_traiteur', 'id_utilisateur');
    }

    public function ticketsEnCours()
    {
        return $this->hasMany(Ticket::class, 'traite_par', 'id_utilisateur');
    }

    public function categories()
    {
        return $this->belongsToMany(Categorie::class, 'utilisateur_categorie', 'id_utilisateur', 'id_categorie');
    }

    public function getNomRoleAttribute(): string
    {
        return $this->role?->nom_role ?? '';
    }

    public function hasRole(string $role): bool
    {
        return $this->role?->nom_role === $role;
    }
}
