<?php

namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Notificacion extends Model implements AuditableContract
{
    use Auditable;
    use HasAuditFields;
    use HasUuids;
    use SoftDeletes;
    protected $table = 'notificaciones';
    protected $fillable = [
        'cliente_id',
        'user_id',
        'boleta_id',
        'tipo',
        'destinatario_email',
        'asunto',
        'cuerpo',
        'brevo_message_id',
        'estado_envio',
        'leido_at',
        'respuesta_brevo',
        'enviado_at',
        'intentos',
    ];

    protected function casts(): array
    {
        return [
            'enviado_at' => 'datetime',
            'leido_at'   => 'datetime',
            'intentos'   => 'integer',
        ];
    }

    public function scopeEnviado($query)
    {
        return $query->where('estado_envio', 'enviado');
    }

    public function scopeFallido($query)
    {
        return $query->where('estado_envio', 'fallido');
    }

    public function scopePendiente($query)
    {
        return $query->where('estado_envio', 'pendiente');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function boleta()
    {
        return $this->belongsTo(Boleta::class);
    }
    public function scopeLeido($query)
    {
        return $query->whereNotNull('leido_at');
    }
    public function scopeNoLeido($query)
    {
        return $query->whereNull('leido_at');
    }
    public function marcarComoLeida(): bool{
        if (is_null($this->leido_at)) {
            $this->leido_at = now();
            return $this->save();
        }
        return true;
    }
}
