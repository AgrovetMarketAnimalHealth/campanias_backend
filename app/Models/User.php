<?php

namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements AuditableContract, MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use Notifiable;
    use TwoFactorAuthenticatable;
    use HasApiTokens;
    use Auditable;
    use HasAuditFields;
    use HasRoles;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'activo',
        'restablecimiento',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'activo'                  => 'boolean',
            'restablecimiento'        => 'integer',
        ];
    }

    // Agregar método útil igual que en Cliente
    public function estaActivo(): bool
    {
        return $this->activo;
    }
    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class);
    }
}