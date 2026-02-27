<?php

namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Cliente extends Authenticatable implements AuditableContract, MustVerifyEmail
{
    use Auditable;
    use HasAuditFields;
    use HasApiTokens;
    use HasUuids;
    use Notifiable;
    use TwoFactorAuthenticatable;
    use SoftDeletes;

    protected $guard = 'cliente';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'tipo_persona',
        'nombre',
        'apellidos',
        'dni',
        'ruc',
        'departamento',
        'email',
        'telefono',
        'acepta_politicas',
        'acepta_terminos',
        'archivo_comprobante',
        'estado',
        'email_verified_at',
        'email_verification_token',
        'email_verification_expires_at',
    ];

    protected $hidden = [
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'acepta_politicas'        => 'boolean',
            'acepta_terminos'         => 'boolean',
        ];
    }

    public function boletas()
    {
        return $this->hasMany(Boleta::class);
    }

    public function puntos()
    {
        return $this->hasMany(Punto::class);
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class);
    }

    public function totalPuntos(): int
    {
        return $this->puntos()->sum('puntos');
    }

    public function esNatural(): bool
    {
        return $this->tipo_persona === 'natural';
    }

    public function esJuridica(): bool
    {
        return $this->tipo_persona === 'juridica';
    }
    public function getArchivoComprobanteUrlAttribute(): ?string
    {
        return $this->archivo_comprobante
            ? Storage::disk('s3')->temporaryUrl($this->archivo_comprobante, now()->addMinutes(30))
            : null;
    }
}