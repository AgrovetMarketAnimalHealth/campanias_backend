<?php

namespace App\Http\Requests\Portal\Boleta;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreboletaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::guard('cliente')->check();
    }

    public function rules(): array
    {
        return [
            'numero_boleta' => ['required', 'string', 'max:100'],
            'monto'         => ['required', 'numeric', 'min:0'],
            'archivo'       => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}