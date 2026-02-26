<?php

namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Punto extends Model implements AuditableContract{
    use Auditable;
    use HasAuditFields;
    use HasUuids;
    use SoftDeletes;
    protected $fillable = [
        'cliente_id',
        'boleta_id',
        'puntos',
        'descripcion',
    ];
    protected function casts(): array{
        return [
            'puntos' => 'decimal:2',
        ];
    }
    public function cliente(){
        return $this->belongsTo(Cliente::class);
    }
    public function boleta(){
        return $this->belongsTo(Boleta::class);
    }
}
