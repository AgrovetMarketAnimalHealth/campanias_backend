<?php

namespace App\Policies;

use App\Models\Campania;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CampaniaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('ver Campañias');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Campania $campania): bool
    {
        return $user->can('ver Campañias');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('crear Campañias');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Campania $campania): bool
    {
        return $user->can('editar Campañias');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Campania $campania): bool
    {
        return $user->can('eliminar Campañias');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Campania $campania): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Campania $campania): bool
    {
        return false;
    }
}
