<?php

namespace App\Policies;

use App\Models\Notificacion;
use App\Models\User;

class NotificacionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('ver notificaciones');
    }

    public function view(User $user, Notificacion $notificacion): bool
    {
        return $user->can('ver notificaciones');
    }

    public function create(User $user): bool
    {
        return $user->can('crear notificaciones');
    }

    public function update(User $user, Notificacion $notificacion): bool
    {
        return $user->can('editar notificaciones');
    }

    public function delete(User $user, Notificacion $notificacion): bool
    {
        return $user->can('eliminar notificaciones');
    }

    public function restore(User $user, Notificacion $notificacion): bool
    {
        return false;
    }

    public function forceDelete(User $user, Notificacion $notificacion): bool
    {
        return false;
    }
}