<?php

namespace App\Session;

use Illuminate\Session\DatabaseSessionHandler;

class ClienteSessionHandler extends DatabaseSessionHandler
{
    protected function addUserInformation(&$payload): static
    {
        parent::addUserInformation($payload);

        if ($this->container->bound('auth')) {
            $payload['cliente_id'] = $this->container->make('auth')
                ->guard('cliente')
                ->id();
        }

        return $this;
    }
}
