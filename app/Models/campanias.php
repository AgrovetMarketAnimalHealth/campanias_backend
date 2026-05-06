<?php

namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class campanias extends Model implements AuditableContract
{
    use Auditable;
    use HasAuditFields;
    use HasUuids;
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'slug',
        'descripcion',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'activa',
        'configuracion',
        'created_by',
        'updated_by',
        'deleted_by',
    ];
    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin'    => 'datetime',
        'configuracion' => 'array',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
        'deleted_at'   => 'datetime',
    ];
    
    public function usuarios(){
        return $this->hasMany(User::class, 'campania_id');
    }
}