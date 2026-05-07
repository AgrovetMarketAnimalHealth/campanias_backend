<?php

namespace App\Http\Requests\Admin\CampaniaImagenes;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaniasImagenesRequests extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'campania_id'      => ['required', 'uuid', 'exists:campanias,id'],
            'seccion'          => ['nullable', 'string', 'max:100'],
            'orden'            => ['nullable', 'integer', 'min:0'],

            'imagen_desktop'   => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'imagen_tablet'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'imagen_mobile'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],

            'visible_desktop'  => ['boolean'],
            'visible_tablet'   => ['boolean'],
            'visible_mobile'   => ['boolean'],

            'activa'           => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'campania_id.required' => 'La campaña es obligatoria.',
            'campania_id.exists'   => 'La campaña seleccionada no existe.',

            'imagen_desktop.image' => 'El archivo de escritorio debe ser una imagen válida.',
            'imagen_desktop.mimes' => 'La imagen de escritorio debe ser jpg, jpeg, png, webp o gif.',
            'imagen_desktop.max'   => 'La imagen de escritorio no debe superar los 5 MB.',

            'imagen_tablet.image'  => 'El archivo de tablet debe ser una imagen válida.',
            'imagen_tablet.mimes'  => 'La imagen de tablet debe ser jpg, jpeg, png, webp o gif.',
            'imagen_tablet.max'    => 'La imagen de tablet no debe superar los 5 MB.',

            'imagen_mobile.image'  => 'El archivo móvil debe ser una imagen válida.',
            'imagen_mobile.mimes'  => 'La imagen móvil debe ser jpg, jpeg, png, webp o gif.',
            'imagen_mobile.max'    => 'La imagen móvil no debe superar los 5 MB.',
        ];
    }
}
