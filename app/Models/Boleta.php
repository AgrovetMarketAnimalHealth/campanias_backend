<?php
namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Boleta extends Model implements AuditableContract
{
    use Auditable;
    use HasAuditFields;
    use HasUuids;
    use SoftDeletes;

    protected $fillable = [
        'cliente_id',
        'codigo',
        'archivo',
        'puntos_otorgados',
        'numero_boleta',   // ✅ agregado
        'monto',           // ✅ agregado
        'estado',
        'observacion',
        'created_by',
    ];

    protected $casts = [
        'id'               => 'string',
        'cliente_id'       => 'string',
        'created_by'       => 'string',
        'puntos_otorgados' => 'integer',   // ✅ corregido, era decimal:2 pero es integer
        'monto'            => 'decimal:2', // ✅ agregado
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
        'deleted_at'       => 'datetime',
    ];

    const UPDATED_AT = null;

    public function scopePendiente($query)
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeAceptada($query)
    {
        return $query->where('estado', 'aceptada');
    }

    public function scopeRechazada($query)
    {
        return $query->where('estado', 'rechazada');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($boleta) {
            if (!$boleta->id) {
                $boleta->id = (string) \Illuminate\Support\Str::uuid();
            }

            do {
                $codigo = 'BOL-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(5));
            } while (static::where('codigo', $codigo)->exists());

            $boleta->codigo     = $codigo;
            $boleta->updated_by = null;
        });

        static::updating(function ($boleta) {
        });
    }
}