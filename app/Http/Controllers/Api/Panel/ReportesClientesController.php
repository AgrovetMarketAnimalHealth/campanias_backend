<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Services\BrevoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportesClientesController extends Controller{
    public function __construct(private readonly BrevoService $brevo) {}
    public function metricas(Request $request){
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        // Por defecto: HOY (diario)
        $fechaInicio = $request->filled('fecha_inicio')
            ? $request->date('fecha_inicio')->startOfDay()
            : now()->startOfDay();

        $fechaFin = $request->filled('fecha_fin')
            ? $request->date('fecha_fin')->endOfDay()
            : now()->endOfDay();

        // Inscritos por día en el rango — query liviana, no carga colección
        $inscritosPorDia = Cliente::query()
            ->selectRaw('DATE(created_at) as fecha, COUNT(*) as total')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('fecha')
            ->get()
            ->map(fn($row) => [
                'fecha' => $row->fecha,
                'total' => (int) $row->total,
            ]);

        // Por estado — una sola query agrupada
        $porEstado = Cliente::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->groupBy('estado')
            ->get()
            ->mapWithKeys(fn($row) => [$row->estado => (int) $row->total]);

        // Por tipo persona — una sola query agrupada
        $porTipoPersona = Cliente::query()
            ->selectRaw('tipo_persona, COUNT(*) as total')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->groupBy('tipo_persona')
            ->get()
            ->mapWithKeys(fn($row) => [$row->tipo_persona => (int) $row->total]);

        // Solo los últimos 10 recientes — limit estricto, sin cargar más
        $recientes = Cliente::query()
            ->select(['id', 'nombre', 'apellidos', 'tipo_persona', 'email', 'estado', 'created_at'])
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($c) => [
                'id'           => $c->id,
                'nombre'       => trim("{$c->nombre} {$c->apellidos}"),
                'email'        => $c->email,
                'estado'       => $c->estado,
                'tipo_persona' => $c->tipo_persona,
                'fecha'        => $c->created_at->format('d/m/Y'),
                'hora'         => $c->created_at->format('h:i:s A'),
            ]);

        return response()->json([
            'rango' => [
                'inicio' => $fechaInicio->toDateString(),
                'fin'    => $fechaFin->toDateString(),
            ],
            'total_periodo'     => $inscritosPorDia->sum('total'),
            'inscritos_por_dia' => $inscritosPorDia,
            'por_estado'        => $porEstado,
            'por_tipo_persona'  => $porTipoPersona,
            'recientes'         => $recientes,
        ]);
    }
    public function listado(Request $request){
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'estado'       => 'nullable|in:pendiente,activo,rechazado',
            'tipo_persona' => 'nullable|in:natural,juridica',
            'per_page'     => 'nullable|integer|min:10|max:100',
        ]);

        // Por defecto filtra HOY si no mandan rango
        $fechaInicio = $request->filled('fecha_inicio')
            ? $request->date('fecha_inicio')->startOfDay()
            : now()->startOfDay();

        $fechaFin = $request->filled('fecha_fin')
            ? $request->date('fecha_fin')->endOfDay()
            : now()->endOfDay();

        $query = Cliente::query()
            ->select([
                'id', 'tipo_persona', 'nombre', 'apellidos',
                'dni', 'ruc', 'departamento', 'email',
                'telefono', 'estado', 'created_at',
            ])
            ->whereBetween('created_at', [$fechaInicio, $fechaFin]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('tipo_persona')) {
            $query->where('tipo_persona', $request->tipo_persona);
        }

        return response()->json(
            $query->orderByDesc('created_at')
                  ->paginate($request->integer('per_page', 25))
        );
    }
    public function exportarExcel(Request $request): StreamedResponse{
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'estado'       => 'nullable|in:pendiente,activo,rechazado',
            'tipo_persona' => 'nullable|in:natural,juridica',
        ]);

        $clientes = $this->obtenerClientesParaExportar($request);
        $spreadsheet = $this->construirSpreadsheet($clientes, $request);
        $nombreArchivo = 'inscritos_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $nombreArchivo, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$nombreArchivo}\"",
        ]);
    }
    public function enviarReporteDiario(Request $request){
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'email_destino' => 'required|email',
            'fecha_inicio'  => 'nullable|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $this->despacharReporteDiario(
            emailDestino:  $request->email_destino,
            fechaInicio:   $request->fecha_inicio,
            fechaFin:      $request->fecha_fin,
        );

        return response()->json(['message' => 'Reporte enviado correctamente.']);
    }

    public function despacharReporteDiario(
        string $emailDestino,
        ?string $fechaInicio = null,
        ?string $fechaFin    = null,
    ): void {
        // Si no viene rango (cron), usa hoy
        $request = new Request([
            'fecha_inicio' => $fechaInicio ?? now()->toDateString(),
            'fecha_fin'    => $fechaFin    ?? now()->toDateString(),
        ]);

        $clientes = $this->obtenerClientesParaExportar($request);
        $spreadsheet = $this->construirSpreadsheet($clientes, $request);

        $tmpPath = sys_get_temp_dir() . '/reporte_inscritos_' . now()->format('Ymd_His') . '.xlsx';
        (new Xlsx($spreadsheet))->save($tmpPath);

        // Asunto diferente si es rango o si es diario
        $esDiario = $fechaInicio === null && $fechaFin === null;
        $asunto   = $esDiario
            ? 'Reporte Diario de Inscritos — ' . now()->format('d/m/Y')
            : 'Reporte de Inscritos ' . $request->fecha_inicio . ' al ' . $request->fecha_fin;

        $this->brevo->enviarConAdjunto(
            destinatario: $emailDestino,
            asunto:       $asunto,
            cuerpo:       $this->construirEmailHtml($clientes),
            tipo:         'reporte_diario_inscritos',
            adjuntoPath:  $tmpPath,
            nombreAdjunto: 'inscritos_' . now()->format('Ymd_His') . '.xlsx',
        );

        @unlink($tmpPath);
    }
    private function obtenerClientesParaExportar(Request $request){
        $fechaInicio = $request->filled('fecha_inicio')
            ? $request->date('fecha_inicio')->startOfDay()
            : now()->startOfDay();

        $fechaFin = $request->filled('fecha_fin')
            ? $request->date('fecha_fin')->endOfDay()
            : now()->endOfDay();

        $query = Cliente::query()->select([
            'id', 'tipo_persona', 'nombre', 'apellidos',
            'dni', 'ruc', 'departamento', 'email',
            'telefono', 'estado', 'created_at',
        ])->whereBetween('created_at', [$fechaInicio, $fechaFin]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('tipo_persona')) {
            $query->where('tipo_persona', $request->tipo_persona);
        }

        return $query->orderByDesc('created_at')->get();
    }
    private function construirSpreadsheet($clientes, Request $request): Spreadsheet{
        $spreadsheet = new Spreadsheet();

        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Inscritos');
        $this->construirHojaListado($sheet, $clientes, $request, 'REPORTE DE INSCRITOS');

        $sheetNatural = $spreadsheet->createSheet();
        $sheetNatural->setTitle('Personas Naturales');
        $this->construirHojaListado(
            $sheetNatural,
            $clientes->where('tipo_persona', 'natural')->values(),
            $request,
            'PERSONAS NATURALES'
        );

        $sheetJuridica = $spreadsheet->createSheet();
        $sheetJuridica->setTitle('Personas Jurídicas');
        $this->construirHojaListado(
            $sheetJuridica,
            $clientes->where('tipo_persona', 'juridica')->values(),
            $request,
            'PERSONAS JURÍDICAS'
        );

        $sheetResumen = $spreadsheet->createSheet();
        $sheetResumen->setTitle('Resumen General');
        $this->construirHojaResumen($sheetResumen, $clientes);

        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }
    private function construirHojaListado($sheet, $clientes, Request $request, string $titulo): void{
        $sheet->mergeCells('A1:K1');
        $sheet->setCellValue('A1', $titulo . ' — ' . now()->format('d/m/Y h:i:s A'));
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $inicio = $request->filled('fecha_inicio') ? $request->fecha_inicio : now()->toDateString();
        $fin    = $request->filled('fecha_fin')    ? $request->fecha_fin    : now()->toDateString();

        $sheet->mergeCells('A2:K2');
        $sheet->setCellValue('A2', "Período: {$inicio} al {$fin}  |  Total: " . $clientes->count());
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['rgb' => '444444']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EAF0FB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $encabezados = [
            'A' => '#', 'B' => 'Tipo Persona', 'C' => 'Nombre',
            'D' => 'Apellidos', 'E' => 'DNI', 'F' => 'RUC',
            'G' => 'Departamento', 'H' => 'Email',
            'I' => 'Teléfono', 'J' => 'Estado', 'K' => 'Fecha Inscripción',
        ];

        foreach ($encabezados as $col => $encabezado) {
            $sheet->setCellValue("{$col}3", $encabezado);
        }

        $sheet->getStyle('A3:K3')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
        ]);

        $fila = 4;
        foreach ($clientes as $i => $cliente) {
            $bgColor = ($i % 2 === 0) ? 'F8FAFF' : 'FFFFFF';

            $sheet->setCellValue("A{$fila}", $i + 1);
            $sheet->setCellValue("B{$fila}", ucfirst($cliente->tipo_persona));
            $sheet->setCellValue("C{$fila}", $cliente->nombre);
            $sheet->setCellValue("D{$fila}", $cliente->apellidos ?? '—');
            $sheet->setCellValue("E{$fila}", $cliente->dni ?? '—');
            $sheet->setCellValue("F{$fila}", $cliente->ruc ?? '—');
            $sheet->setCellValue("G{$fila}", $cliente->departamento);
            $sheet->setCellValue("H{$fila}", $cliente->email);
            $sheet->setCellValue("I{$fila}", $cliente->telefono);
            $sheet->setCellValue("J{$fila}", ucfirst($cliente->estado));
            $sheet->setCellValue("K{$fila}", $cliente->created_at->format('d/m/Y h:i:s A'));

            $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray([
                'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
            ]);

            $coloresEstado = ['activo' => '16A34A', 'pendiente' => 'D97706', 'rechazado' => 'DC2626'];
            $sheet->getStyle("J{$fila}")->getFont()->getColor()->setRGB($coloresEstado[$cliente->estado] ?? '6B7280');
            $sheet->getStyle("J{$fila}")->getFont()->setBold(true);

            $fila++;
        }

        $anchos = ['A' => 6, 'B' => 14, 'C' => 20, 'D' => 20, 'E' => 13,
                   'F' => 13, 'G' => 16, 'H' => 28, 'I' => 14, 'J' => 12, 'K' => 26];
        foreach ($anchos as $col => $ancho) {
            $sheet->getColumnDimension($col)->setWidth($ancho);
        }
    }
    private function construirHojaResumen($sheet, $clientes): void{
        $total     = $clientes->count();
        $naturales = $clientes->where('tipo_persona', 'natural');
        $juridicas = $clientes->where('tipo_persona', 'juridica');

        $sheet->mergeCells('A1:D1');
        $sheet->setCellValue('A1', 'RESUMEN GENERAL DE INSCRITOS');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 13, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(24);

        $sheet->setCellValue('A2', 'Estado');
        $sheet->setCellValue('B2', 'Total');
        $sheet->setCellValue('C2', 'Naturales');
        $sheet->setCellValue('D2', 'Jurídicas');
        $sheet->getStyle('A2:D2')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $fila  = 3;
        $estados = [
            'activo'    => ['label' => 'Activos',    'color' => '16A34A'],
            'pendiente' => ['label' => 'Pendientes', 'color' => 'D97706'],
            'rechazado' => ['label' => 'Rechazados', 'color' => 'DC2626'],
        ];

        foreach ($estados as $estado => $cfg) {
            $sheet->setCellValue("A{$fila}", $cfg['label']);
            $sheet->setCellValue("B{$fila}", $clientes->where('estado', $estado)->count());
            $sheet->setCellValue("C{$fila}", $naturales->where('estado', $estado)->count());
            $sheet->setCellValue("D{$fila}", $juridicas->where('estado', $estado)->count());
            $sheet->getStyle("A{$fila}")->getFont()->getColor()->setRGB($cfg['color']);
            $sheet->getStyle("A{$fila}")->getFont()->setBold(true);
            $sheet->getStyle("A{$fila}:D{$fila}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
            ]);
            $fila++;
        }

        $sheet->setCellValue("A{$fila}", 'TOTAL');
        $sheet->setCellValue("B{$fila}", $total);
        $sheet->setCellValue("C{$fila}", $naturales->count());
        $sheet->setCellValue("D{$fila}", $juridicas->count());
        $sheet->getStyle("A{$fila}:D{$fila}")->applyFromArray([
            'font'    => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
        ]);

        $sheet->getColumnDimension('A')->setWidth(16);
        $sheet->getColumnDimension('B')->setWidth(12);
        $sheet->getColumnDimension('C')->setWidth(14);
        $sheet->getColumnDimension('D')->setWidth(14);
    }
    private function construirEmailHtml($clientes): string{
        $totalHoy  = $clientes->count();
        $naturales = $clientes->where('tipo_persona', 'natural')->count();
        $juridicas = $clientes->where('tipo_persona', 'juridica')->count();

        // Rango de fechas del conjunto
        $desde = $clientes->min('created_at')?->format('d/m/Y') ?? now()->format('d/m/Y');
        $hasta = $clientes->max('created_at')?->format('d/m/Y') ?? now()->format('d/m/Y');
        $rangoLabel = $desde === $hasta ? $desde : "{$desde} — {$hasta}";

        $filas = $clientes->take(20)->map(fn($c) => "
            <tr>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$c->nombre} {$c->apellidos}</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$c->email}</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>" . ucfirst($c->tipo_persona) . "</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>" . ucfirst($c->estado) . "</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$c->created_at->format('d/m/Y h:i:s A')}</td>
            </tr>")->implode('');

        $nota = $clientes->count() > 20
            ? "<p style='color:#6b7280;font-size:12px;'>* Se muestran los primeros 20 registros. Ver Excel adjunto para el listado completo.</p>"
            : '';

        return "
        <div style='font-family:Arial,sans-serif;max-width:700px;margin:0 auto;'>
            <div style='background:#1E3A5F;color:#fff;padding:24px;border-radius:8px 8px 0 0;'>
                <h2 style='margin:0;'>📊 Reporte de Inscritos</h2>
                <p style='margin:4px 0 0;opacity:.8;font-size:14px;'>{$rangoLabel}</p>
            </div>
            <div style='background:#f8faff;padding:20px;display:flex;gap:16px;flex-wrap:wrap;'>
                <div style='background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;font-size:24px;font-weight:bold;text-align:center;'>
                    {$totalHoy}<br><span style='font-size:13px;font-weight:normal;'>Total período</span>
                </div>
                <div style='background:#0369A1;color:#fff;padding:12px 24px;border-radius:8px;font-size:24px;font-weight:bold;text-align:center;'>
                    {$naturales}<br><span style='font-size:13px;font-weight:normal;'>Naturales</span>
                </div>
                <div style='background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;font-size:24px;font-weight:bold;text-align:center;'>
                    {$juridicas}<br><span style='font-size:13px;font-weight:normal;'>Jurídicas</span>
                </div>
            </div>
            <table style='width:100%;border-collapse:collapse;'>
                <thead style='background:#2563EB;color:#fff;'>
                    <tr>
                        <th style='padding:8px 10px;text-align:left;'>Nombre</th>
                        <th style='padding:8px 10px;text-align:left;'>Email</th>
                        <th style='padding:8px 10px;text-align:left;'>Tipo</th>
                        <th style='padding:8px 10px;text-align:left;'>Estado</th>
                        <th style='padding:8px 10px;text-align:left;'>Fecha y Hora</th>
                    </tr>
                </thead>
                <tbody>{$filas}</tbody>
            </table>
            {$nota}
            <div style='background:#1E3A5F;color:#9ca3af;padding:12px;text-align:center;font-size:12px;border-radius:0 0 8px 8px;'>
                Reporte generado automáticamente — " . config('app.name') . "
            </div>
        </div>";
    }
}