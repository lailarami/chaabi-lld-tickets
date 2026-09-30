<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $table = 'categorie';
    protected $primaryKey = 'id_categorie';

    protected $fillable = ['nom'];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_categorie', 'id_categorie');
    }

    public function sousCategories()
    {
        return $this->hasMany(SousCategorie::class, 'id_categorie', 'id_categorie');
    }
}
