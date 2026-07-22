<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'brevo' => [
        'key'        => env('BREVO_API_KEY'),
        'from_email' => env('BREVO_FROM_EMAIL'),
        'from_name'  => env('BREVO_FROM_NAME'),
    ],

    // config/services.php
    'frontends' => [
        'veterinarios' => env('FRONTEND_URL_VETERINARIOS', 'http://localhost:5174'),
        'cliente'      => env('FRONTEND_URL_CLIENTE', 'http://localhost:5175'),
    ],

    'registro_tipos' => [
        'veterinarios' => [
            'frontend_url' => env('FRONTEND_URL_VETERINARIOS', 'http://localhost:5174'),
            'vista_prefix' => 'emails', // views/emails/registro.blade.php
        ],
        'clientes' => [
            'frontend_url' => env('FRONTEND_URL_CLIENTE', 'http://localhost:5175'),
            'vista_prefix' => 'emails.Clientes', // views/emails/Clientes/registro.blade.php
        ],
    ],
];
