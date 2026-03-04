<?php

namespace App\Http\Requests\Admin\Usuario;
use Illuminate\Foundation\Http\FormRequest;
class StoreUsuarioRequest extends FormRequest{
    public function authorize(): bool{
        return true;
    }
    public function rules(): array{
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:120|unique:users,email',
            'password' => 'required|string|min:8',
            'activo' => 'required|boolean',
            'role_id' => ['required', 'exists:roles,id'],
        ];
    }
    public function messages(){
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser texto.',
            'name.max' => 'El nombre no debe exceder los 100 caracteres.',

            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Debe ingresar un correo electrónico válido.',
            'email.max' => 'El correo no debe exceder los 120 caracteres.',
            'email.unique' => 'Este correo ya está registrado.',


            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',

            'activo.required' => 'El estado es obligatorio.',
            'activo.boolean' => 'El estado debe ser verdadero o falso',

        ];
    }
}