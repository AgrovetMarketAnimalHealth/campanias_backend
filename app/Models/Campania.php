<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Campania extends Model
{
    use HasUuids;

    protected $fillable = [
        'nombre',
        'url',
        'api_key',
        'activa'
    ];

    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'campania_user')
            ->using(CampaniaUser::class)
            ->withPivot('activo')
            ->withTimestamps();
    }

    public function puntos()
    {
        return $this->hasMany(Punto::class);
    }
    public function clienteCampanias()
    {
        return $this->hasMany(ClienteCampania::class);
    }
    public function boletas()
    {
        return $this->hasMany(Boleta::class, 'compania_id');
    }
}