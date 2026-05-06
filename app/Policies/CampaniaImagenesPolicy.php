<?php

namespace App\Policies;

use App\Models\CampaniaImagenes;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CampaniaImagenesPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('ver campaña imágenes');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CampaniaImagenes $campaniaImagenes): bool
    {
        return $user->can('ver campaña imágenes');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('crear campaña imágenes');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CampaniaImagenes $campaniaImagenes): bool
    {
        return $user->can('editar campaña imágenes');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CampaniaImagenes $campaniaImagenes): bool
    {
        return $user->can('eliminar campaña imágenes');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CampaniaImagenes $campaniaImagenes): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CampaniaImagenes $campaniaImagenes): bool
    {
        return false;
    }
}
