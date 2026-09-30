<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'role';
    protected $primaryKey = 'id_role';

    protected $fillable = ['nom_role'];

    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'id_role', 'id_role');
    }
}
