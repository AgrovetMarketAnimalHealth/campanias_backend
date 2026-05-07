<?php

namespace App\Models;

use App\Concerns\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Campanias extends Model implements AuditableContract{
    use Auditable;
    use HasAuditFields;
    use HasUuids;
    use SoftDeletes;
    protected $fillable = [
        'nombre',
        'dominio',
        'api_key',
        'activa',
    ];
    protected $casts = [
        'activa' => 'boolean',
    ];
    protected static function booted(){
        static::creating(function ($campania) {
            if (empty($campania->api_key)) {
                $campania->api_key = Str::random(64);
            }
        });
    }
    public function usuarios(){
        return $this->hasMany(User::class, 'campania_id');
    }
    public function creador(){
        return $this->belongsTo(User::class, 'created_by');
    }
    public function actualizador(){
        return $this->belongsTo(User::class, 'updated_by');
    }
    public function eliminador(){
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
