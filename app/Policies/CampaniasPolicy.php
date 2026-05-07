<?php

namespace App\Policies;

use App\Models\Campanias;
use App\Models\User;

class CampaniasPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('ver campañas');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Campanias $campanias): bool
    {
        return $user->can('ver campañas');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('crear campañas');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Campanias $campanias): bool
    {
        return $user->can('editar campañas');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Campanias $campanias): bool
    {
        return $user->can('eliminar campañas');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Campanias $campanias): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Campanias $campanias): bool
    {
        return false;
    }
}
