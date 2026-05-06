<?php

namespace App\Http\Requests\Admin\Campanias;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCampaniasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [

        ];
    }

    public function messages(): array
    {
        return [

        ];
    }
}