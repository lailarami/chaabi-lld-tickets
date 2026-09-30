<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    protected $table = 'rapport';
    protected $primaryKey = 'id_rapport';

    protected $fillable = [
        'date_generation',
        'date_fermeture',
        'description',
        'id_sous_categorie',
        'typologie',
        'impact',
        'notes_traiteur',
    ];

    protected $casts = [
        'date_generation' => 'date',
        'date_fermeture' => 'date',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_rapport', 'id_rapport');
    }

    public function sousCategorie()
    {
        return $this->belongsTo(SousCategorie::class, 'id_sous_categorie', 'id');
    }
}
