<?php

namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class CampaniaImagenes extends Model implements AuditableContract
{
    use Auditable;
    use HasAuditFields;
    use HasUuids;
    use SoftDeletes;

    protected $fillable = [
        'campania_id',
        'seccion',
        'orden',

        'imagen_desktop',
        'imagen_tablet',
        'imagen_mobile',

        'visible_desktop',
        'visible_tablet',
        'visible_mobile',

        'activa',
    ];

    protected $casts = [
        'visible_desktop' => 'boolean',
        'visible_tablet' => 'boolean',
        'visible_mobile' => 'boolean',
        'activa' => 'boolean',

        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function campania()
    {
        return $this->belongsTo(Campanias::class, 'campania_id');
    }
}