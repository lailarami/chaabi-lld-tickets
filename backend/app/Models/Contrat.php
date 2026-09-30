<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    protected $table = 'contrats';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'produit',
        'licence',
        'description',
        'date_debut',
        'date_fin',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
