<?php

namespace App\Policies;

use App\Models\Punto;
use App\Models\User;

class PuntoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('ver puntos');
    }

    public function view(User $user, Punto $punto): bool
    {
        return $user->can('ver puntos');
    }

    public function create(User $user): bool
    {
        return $user->can('crear puntos');
    }

    public function update(User $user, Punto $punto): bool
    {
        return $user->can('editar puntos');
    }

    public function delete(User $user, Punto $punto): bool
    {
        return $user->can('eliminar puntos');
    }

    public function restore(User $user, Punto $punto): bool
    {
        return false;
    }

    public function forceDelete(User $user, Punto $punto): bool
    {
        return false;
    }
}