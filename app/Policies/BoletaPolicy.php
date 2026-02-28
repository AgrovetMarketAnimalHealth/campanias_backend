<?php

namespace App\Policies;

use App\Models\Boleta;
use App\Models\User;

class BoletaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('ver boletas');
    }

    public function view(User $user, Boleta $boleta): bool
    {
        return $user->can('ver boletas');
    }

    public function create(User $user): bool
    {
        return $user->can('crear boletas');
    }

    public function update(User $user, Boleta $boleta): bool
    {
        return $user->can('editar boletas');
    }

    public function delete(User $user, Boleta $boleta): bool
    {
        return $user->can('eliminar boletas');
    }

    public function restore(User $user, Boleta $boleta): bool
    {
        return false;
    }

    public function forceDelete(User $user, Boleta $boleta): bool
    {
        return false;
    }
}