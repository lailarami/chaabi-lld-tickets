<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SousCategorie extends Model
{
    protected $table = 'sous_categorie';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom',
        'id_categorie',
    ];

    public $timestamps = true;

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_sous_categorie', 'id');
    }
}