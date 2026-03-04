<?php

namespace App\Http\Requests\Admin\Usuario;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name' => ['nullable', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($userId)
            ],
            'activo' => ['required', 'boolean'],
            'password' => ['nullable', 'string', 'min:8'],
            'role_id' => ['required', 'exists:roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'dni.required' => 'El DNI es obligatorio',
            'dni.unique' => 'El DNI ya está registrado',
            'dni.max' => 'El DNI debe tener máximo 8 caracteres',
            
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'Ingrese un correo electrónico válido',
            'email.unique' => 'El correo electrónico ya está registrado',
            
            'activo.required' => 'El estado es obligatorio',
            'activo.boolean' => 'El estado debe ser verdadero o falso',
            
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            
            'role_id.required' => 'El rol es obligatorio.',
            'role_id.exists' => 'El rol seleccionado no existe.',
        ];
    }
}