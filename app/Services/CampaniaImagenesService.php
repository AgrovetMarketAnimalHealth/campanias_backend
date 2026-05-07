<?php

namespace App\Services;

use App\Models\CampaniaImagenes;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CampaniaImagenesService{
    private const DISK        = 'public';
    private const BASE_FOLDER = 'campanias';
    private function folder(string $id): string{
        return self::BASE_FOLDER . '/' . $id;
    }
    private function guardarArchivo(UploadedFile $file, string $folder, string $campo): string{
        $nombre    = $campo . '_' . now()->timestamp . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $file->storeAs($folder, $nombre, self::DISK);
        return $folder . '/' . $nombre;
    }
    private function eliminarArchivo(?string $ruta): void{
        if ($ruta && Storage::disk(self::DISK)->exists($ruta)) {
            Storage::disk(self::DISK)->delete($ruta);
        }
    }
    private function procesarImagenes(array $archivos, string $folder, ?CampaniaImagenes $imagen = null): array{
        $campos = ['imagen_desktop', 'imagen_tablet', 'imagen_mobile'];
        $rutas  = [];
        foreach ($campos as $campo) {
            if (! empty($archivos[$campo])) {
                if ($imagen && $imagen->{$campo}) {
                    $this->eliminarArchivo($imagen->{$campo});
                }
                $rutas[$campo] = $this->guardarArchivo($archivos[$campo], $folder, $campo);
            }
        }
        return $rutas;
    }
    public function crear(array $datos): CampaniaImagenes{
        $imagen = CampaniaImagenes::create(
            array_merge($datos, [
                'imagen_desktop' => null,
                'imagen_tablet'  => null,
                'imagen_mobile'  => null,
            ])
        );
        $folder = $this->folder($imagen->id);
        $rutas  = $this->procesarImagenes(
            array_filter([
                'imagen_desktop' => $datos['imagen_desktop'] ?? null,
                'imagen_tablet'  => $datos['imagen_tablet']  ?? null,
                'imagen_mobile'  => $datos['imagen_mobile']  ?? null,
            ]),
            $folder
        );
        if (! empty($rutas)) {
            $imagen->update($rutas);
        }
        return $imagen->fresh();
    }
    public function actualizar(CampaniaImagenes $imagen, array $datos): CampaniaImagenes{
        $folder = $this->folder($imagen->id);
        $rutas  = $this->procesarImagenes(
            array_filter([
                'imagen_desktop' => $datos['imagen_desktop'] ?? null,
                'imagen_tablet'  => $datos['imagen_tablet']  ?? null,
                'imagen_mobile'  => $datos['imagen_mobile']  ?? null,
            ]),
            $folder,
            $imagen
        );
        $camposEscalares = array_diff_key($datos, array_flip(['imagen_desktop', 'imagen_tablet', 'imagen_mobile']));
        $imagen->update(array_merge($camposEscalares, $rutas));
        return $imagen->fresh();
    }
    public function eliminar(CampaniaImagenes $imagen): void{
        $this->eliminarArchivo($imagen->imagen_desktop);
        $this->eliminarArchivo($imagen->imagen_tablet);
        $this->eliminarArchivo($imagen->imagen_mobile);
        $folder = $this->folder($imagen->id);
        $archivosRestantes = Storage::disk(self::DISK)->files($folder);
        if (empty($archivosRestantes)) {
            Storage::disk(self::DISK)->deleteDirectory($folder);
        }
        $imagen->delete();
    }
    public function eliminarImagen(CampaniaImagenes $imagen, string $campo): CampaniaImagenes{
        abort_unless(
            in_array($campo, ['imagen_desktop', 'imagen_tablet', 'imagen_mobile']),
            422,
            'Campo de imagen no válido.'
        );
        $this->eliminarArchivo($imagen->{$campo});
        $imagen->update([$campo => null]);
        return $imagen->fresh();
    }
    public function toggleActiva(CampaniaImagenes $imagen): CampaniaImagenes{
        $imagen->update(['activa' => ! $imagen->activa]);
        return $imagen->fresh();
    }
    public function reordenar(array $orden): void{
        foreach ($orden as $item) {
            CampaniaImagenes::where('id', $item['id'])->update(['orden' => $item['orden']]);
        }
    }
}