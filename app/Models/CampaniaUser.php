<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CampaniaUser extends Pivot{
    protected $table = 'campania_user';
    protected $fillable = [
        'user_id',
        'campania_id',
        'activo',
    ];
    protected $casts = [
        'activo' => 'boolean',
    ];
}
