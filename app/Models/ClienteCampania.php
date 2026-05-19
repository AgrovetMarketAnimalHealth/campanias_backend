<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ClienteCampania extends Model
{
    use HasUuids;

    protected $table = 'cliente_campania';

    protected $fillable = [
        'cliente_id',
        'campania_id',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function campania()
    {
        return $this->belongsTo(Campania::class);
    }

    public function puntos()
    {
        return Punto::where('cliente_id', $this->cliente_id)
                    ->where('campania_id', $this->campania_id)
                    ->sum('puntos');
    }
}