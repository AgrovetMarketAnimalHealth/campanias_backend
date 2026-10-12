<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cliente\StoreClienteRequest;
use App\Http\Requests\Admin\Cliente\UpdateClienteRequest;
use App\Http\Resources\Boleta\BoletaResource;
use App\Http\Resources\Boleta\BoletaResourceC;
use App\Http\Resources\Cliente\ClienteResource;
use App\Jobs\EnviarEmailBoleta;
use App\Jobs\EnviarEmailRegistro;
use App\Models\Boleta;
use App\Models\Campania;
use App\Models\Cliente;
use App\Models\ClienteCampania;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ClienteAdminController extends Controller{
    public function index(Request $request): AnonymousResourceCollection{
        Gate::authorize('viewAny', Cliente::class);
        $clientes = $this->clientesFiltrados($request)
            ->paginate($request->per_page ?? 15);

        return ClienteResource::collection($clientes);
    }

    public function exportarExcel(Request $request): StreamedResponse
    {
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'tipo_persona' => ['nullable', 'in:natural,juridica'],
            'campania_id' => ['nullable', 'string', 'exists:campanias,id'],
        ]);

        $query = $this->clientesFiltrados($request);
        $nombreArchivo = 'clientes_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(function () use ($query) {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Clientes');

            $headers = [
                'Cliente',
                'Tipo',
                'Departamento',
                'DNI / RUC / CE',
                'Boletas Aceptadas',
                'Boletas Pendientes',
                'Boletas Rechazadas',
                'Puntos',
                'Estado',
                'Verificado',
                'Ganador',
            ];
            $sheet->fromArray($headers, null, 'A1');
            $sheet->getStyle('A1:K1')->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2563EB'],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
            $sheet->freezePane('A2');
            $sheet->setAutoFilter('A1:K1');

            $sheet->getColumnDimension('A')->setWidth(42);
            $sheet->getColumnDimension('B')->setWidth(18);
            $sheet->getColumnDimension('C')->setWidth(22);
            $sheet->getColumnDimension('D')->setWidth(20);
            foreach (range('E', 'K') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            $row = 2;
            $query->chunk(500, function ($clientes) use ($sheet, &$row) {
                foreach ($clientes as $cliente) {
                    $nombre = trim($cliente->nombre . ' ' . $cliente->apellidos);
                    $documento = $cliente->dni ?? $cliente->ruc ?? $cliente->ce ?? '—';
                    $valoresTexto = [
                        'A' => $nombre . ' (' . $cliente->email . ')',
                        'B' => $cliente->tipo_persona === 'natural' ? 'Natural' : 'Jurídica',
                        'C' => $cliente->departamento ?? '—',
                        'D' => $documento,
                        'I' => $cliente->estado,
                        'J' => $cliente->email_verified_at ? 'Sí' : '—',
                        'K' => $cliente->ganador ? 'Ganador' : '—',
                    ];

                    foreach ($valoresTexto as $column => $value) {
                        $sheet->setCellValueExplicit(
                            $column . $row,
                            $value,
                            DataType::TYPE_STRING
                        );
                    }

                    $sheet->setCellValue('E' . $row, (int) $cliente->boletas_aceptadas);
                    $sheet->setCellValue('F' . $row, (int) $cliente->boletas_pendientes);
                    $sheet->setCellValue('G' . $row, (int) $cliente->boletas_rechazadas);
                    $sheet->setCellValue('H' . $row, (int) ($cliente->total_puntos ?? 0));
                    $row++;
                }
            });

            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $nombreArchivo, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function clientesFiltrados(Request $request): Builder
    {
        $campaniaIds = array_filter((array) $request->campania_id);

        return Cliente::query()
            ->withCount([
                'boletas as boletas_aceptadas' => fn($q) => $q->where('estado', 'aceptada')
                    ->when($campaniaIds, fn($q2) => $q2->whereIn('compania_id', $campaniaIds)),
                'boletas as boletas_pendientes' => fn($q) => $q->where('estado', 'pendiente')
                    ->when($campaniaIds, fn($q2) => $q2->whereIn('compania_id', $campaniaIds)),
                'boletas as boletas_rechazadas' => fn($q) => $q->where('estado', 'rechazada')
                    ->when($campaniaIds, fn($q2) => $q2->whereIn('compania_id', $campaniaIds)),
            ])
            ->withSum([
                'puntos as total_puntos' => fn($q) => $q->when(
                    $campaniaIds,
                    fn($q2) => $q2->whereIn('campania_id', $campaniaIds)
                ),
            ], 'puntos')
            ->when($campaniaIds, fn($q) =>
                $q->where(function ($campaignQuery) use ($campaniaIds) {
                    $campaignQuery
                        ->whereHas('clienteCampanias', fn($q2) =>
                            $q2->whereIn('campania_id', $campaniaIds)
                        )
                        ->orWhereHas('boletas', fn($q2) =>
                            $q2->whereIn('compania_id', $campaniaIds)
                        );
                })
            )
            ->when($request->search, fn($q, $search) =>
                $q->where(fn($q) =>
                    $q->where('nombre', 'like', "%$search%")
                        ->orWhere('apellidos', 'like', "%$search%")
                        ->orWhere('dni', 'like', "%$search%")
                        ->orWhere('ruc', 'like', "%$search%")
                        ->orWhere('ce', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                )
            )
            ->when($request->tipo_persona, fn($q, $tipo) => $q->where('tipo_persona', $tipo))
            ->when($request->departamento, fn($q, $dep) => $q->where('departamento', $dep))
            ->when($request->estado, fn($q, $estado) => $q->where('estado', $estado))
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc');
    }
    public function boletas(Request $request, Cliente $cliente){
        Gate::authorize('view', $cliente);
        $request->validate([
            'campania_id' => [
                'nullable',
                'string',
                'exists:campanias,id',
                fn ($attribute, $value, $fail) =>
                    $value
                    && ! $cliente->clienteCampanias()->where('campania_id', $value)->exists()
                    && ! $cliente->boletas()->where('compania_id', $value)->exists()
                        ? $fail('La campaña no pertenece a este cliente.')
                        : null,
            ],
        ]);

        $boletas = $cliente->boletas()
            ->when($request->estado, fn($q, $estado) => $q->where('estado', $estado))
            ->when($request->campania_id, fn($q, $campaniaId) => $q->where('compania_id', $campaniaId))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);
        return BoletaResourceC::collection($boletas);
    }
    public function update(UpdateClienteRequest $request, Cliente $cliente): ClienteResource{
        Gate::authorize('update', $cliente);
        $data = $request->validated();
        if (isset($data['email']) && $data['email'] !== $cliente->email) {
            $data['email_verified_at'] = null;
        }
        $cliente->update($data);
        return new ClienteResource($cliente);
    }
    public function show(Request $request, Cliente $cliente): ClienteResource{
        Gate::authorize('view', $cliente);
        $request->validate([
            'campania_id' => [
                'nullable',
                'string',
                'exists:campanias,id',
                fn ($attribute, $value, $fail) =>
                    $value
                    && ! $cliente->clienteCampanias()->where('campania_id', $value)->exists()
                    && ! $cliente->boletas()->where('compania_id', $value)->exists()
                        ? $fail('La campaña no pertenece a este cliente.')
                        : null,
            ],
        ]);
        $campaniaId = $request->campania_id;
        $cliente->load('clienteCampanias.campania', 'boletas.campania')
            ->loadCount([
                'boletas as boletas_aceptadas' => fn($q) => $q->where('estado', 'aceptada')
                    ->when($campaniaId, fn($q2) => $q2->where('compania_id', $campaniaId)),
                'boletas as boletas_pendientes' => fn($q) => $q->where('estado', 'pendiente')
                    ->when($campaniaId, fn($q2) => $q2->where('compania_id', $campaniaId)),
                'boletas as boletas_rechazadas' => fn($q) => $q->where('estado', 'rechazada')
                    ->when($campaniaId, fn($q2) => $q2->where('compania_id', $campaniaId)),
            ])
            ->loadSum([
                'puntos as total_puntos' => fn($q) => $q->when(
                    $campaniaId,
                    fn($q2) => $q2->where('campania_id', $campaniaId)
                ),
            ], 'puntos');

        return new ClienteResource($cliente);
    }
    public function register(StoreClienteRequest $request){
        $campania = Campania::where('id', $request->campania_id)
            ->where('activa', true)
            ->first();
        if (!$campania) {
            return response()->json([
                'success' => false,
                'message' => 'La campaña no existe o no está activa.',
            ], 404);
        }
        DB::beginTransaction();
        try {
            $cliente = Cliente::create([
                'campania_id'       => $campania->id,
                'tipo_persona'      => $request->tipo_persona,
                'nombre'            => $request->nombre,
                'apellidos'         => $request->apellidos,
                'dni'               => $request->dni,
                'ruc'               => $request->ruc,
                'ce'                => $request->ce,
                'departamento'      => $request->departamento,
                'email'             => $request->email,
                'telefono'          => $request->telefono,
                'acepta_politicas'  => true,
                'acepta_terminos'   => true,
                'estado'            => 'activo',
                'tipo_registro'     => $campania->tipo_registro,
            ]);
            $clienteCampania = ClienteCampania::create([
                'cliente_id'  => $cliente->id,
                'campania_id' => $campania->id,
            ]);
            $boleta = null;
            if ($request->hasFile('archivo_comprobante')) {
                $archivo = $request->file('archivo_comprobante');
                $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
                $ruta = $archivo->storeAs(
                    "clientes/{$cliente->id}/comprobantes",
                    $nombreArchivo,
                    'public'
                );
                $boleta = Boleta::create([
                    'cliente_id'  => $cliente->id,
                    'compania_id' => $campania->id,
                    'archivo'     => $ruta,
                    'estado'      => 'pendiente',
                    'created_by'  => $cliente->id,
                ]);
            }
            DB::commit();
            EnviarEmailRegistro::dispatch(
                $cliente,
                $campania
            )->onQueue('emails');
            if ($boleta) {
                EnviarEmailBoleta::dispatch(
                    $cliente,
                    $boleta,
                    $campania
                )->onQueue('emails');
            }
            return response()->json([
                'success' => true,
                'message' => $boleta
                    ? 'Registro exitoso. El comprobante fue recibido y está en revisión.'
                    : 'Registro exitoso.',
                'data' => [
                    'cliente' => $cliente,
                    'boleta' => $boleta
                        ? new BoletaResource($boleta)
                        : null,
                ],
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
