<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Services\BrevoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportesClientesController extends Controller
{
    public function __construct(private readonly BrevoService $brevo) {}
    /**
     * API: Retorna métricas diarias/por rango para los gráficos.
     */
    public function metricas(Request $request)
    {
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $fechaInicio = $request->filled('fecha_inicio')
            ? $request->date('fecha_inicio')->startOfDay()
            : now()->startOfMonth();

        $fechaFin = $request->filled('fecha_fin')
            ? $request->date('fecha_fin')->endOfDay()
            : now()->endOfDay();

        // Inscritos agrupados por día dentro del rango
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

        // Inscritos por mes (para gráfico de barras histórico)
        $inscritosPorMes = Cliente::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as mes, COUNT(*) as total")
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('mes')
            ->get()
            ->map(fn($row) => [
                'mes'   => $row->mes,
                'total' => (int) $row->total,
            ]);

        // Inscritos por estado
        $porEstado = Cliente::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->groupBy('estado')
            ->get()
            ->mapWithKeys(fn($row) => [$row->estado => (int) $row->total]);

        // Inscritos por tipo de persona
        $porTipoPersona = Cliente::query()
            ->selectRaw('tipo_persona, COUNT(*) as total')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->groupBy('tipo_persona')
            ->get()
            ->mapWithKeys(fn($row) => [$row->tipo_persona => (int) $row->total]);

        return response()->json([
            'rango' => [
                'inicio' => $fechaInicio->toDateString(),
                'fin'    => $fechaFin->toDateString(),
            ],
            'total_periodo'      => $inscritosPorDia->sum('total'),
            'inscritos_por_dia'  => $inscritosPorDia,
            'inscritos_por_mes'  => $inscritosPorMes,
            'por_estado'         => $porEstado,
            'por_tipo_persona'   => $porTipoPersona,
        ]);
    }

    /**
     * API: Lista paginada de clientes inscritos con filtros de rango.
     */
    public function listado(Request $request)
    {
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'estado'       => 'nullable|in:pendiente,activo,rechazado',
            'tipo_persona' => 'nullable|in:natural,juridica',
            'per_page'     => 'nullable|integer|min:10|max:100',
        ]);

        $query = Cliente::query()
            ->select([
                'id', 'tipo_persona', 'nombre', 'apellidos',
                'dni', 'ruc', 'departamento', 'email',
                'telefono', 'estado', 'created_at',
            ]);

        if ($request->filled('fecha_inicio')) {
            $query->where('created_at', '>=', $request->date('fecha_inicio')->startOfDay());
        }

        if ($request->filled('fecha_fin')) {
            $query->where('created_at', '<=', $request->date('fecha_fin')->endOfDay());
        }

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

    /**
     * Exporta el listado de inscritos a Excel con filtros opcionales.
     */
    public function exportarExcel(Request $request): StreamedResponse
    {
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'estado'       => 'nullable|in:pendiente,activo,rechazado',
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

    /**
     * Envía el reporte diario por email (usado por el comando cron).
     * También puede ser llamado manualmente desde el panel.
     */
    public function enviarReporteDiario(Request $request)
    {
        Gate::authorize('viewAny', Cliente::class);

        $request->validate([
            'email_destino' => 'required|email',
        ]);

        $this->despacharReporteDiario($request->email_destino);

        return response()->json(['message' => 'Reporte enviado correctamente.']);
    }

    // -------------------------------------------------------------------------
    // Métodos internos reutilizables (también usados por el comando Artisan)
    // -------------------------------------------------------------------------

    public function despacharReporteDiario(string $emailDestino): void
    {
        $hoy       = now()->startOfDay();
        $finHoy    = now()->endOfDay();

        $request = new Request([
            'fecha_inicio' => $hoy->toDateString(),
            'fecha_fin'    => $finHoy->toDateString(),
        ]);

        $clientes = $this->obtenerClientesParaExportar($request);

        $spreadsheet = $this->construirSpreadsheet($clientes, $request);

        // Guardar temporalmente
        $tmpPath = sys_get_temp_dir() . '/reporte_inscritos_' . now()->format('Ymd') . '.xlsx';
        (new Xlsx($spreadsheet))->save($tmpPath);

        $totalHoy = $clientes->count();

        // Construir HTML del email
        $cuerpoHtml = $this->construirEmailHtml($totalHoy, $clientes);

        // Adjuntar Excel al email vía Brevo
        $this->brevo->enviarConAdjunto(
            destinatario: $emailDestino,
            asunto: 'Reporte Diario de Inscritos — ' . now()->format('d/m/Y'),
            cuerpo: $cuerpoHtml,
            tipo: 'reporte_diario_inscritos',
            adjuntoPath: $tmpPath,
            nombreAdjunto: 'inscritos_' . now()->format('Ymd') . '.xlsx',
        );

        @unlink($tmpPath);
    }

    private function obtenerMetricasGenerales(): array
    {
        return [
            'total_inscritos'   => Cliente::count(),
            'inscritos_hoy'     => Cliente::whereDate('created_at', today())->count(),
            'inscritos_mes'     => Cliente::whereMonth('created_at', now()->month)
                                          ->whereYear('created_at', now()->year)->count(),
            'activos'           => Cliente::where('estado', 'activo')->count(),
            'pendientes'        => Cliente::where('estado', 'pendiente')->count(),
            'rechazados'        => Cliente::where('estado', 'rechazado')->count(),
        ];
    }

    private function obtenerClientesParaExportar(Request $request)
    {
        $query = Cliente::query()->select([
            'id', 'tipo_persona', 'nombre', 'apellidos',
            'dni', 'ruc', 'departamento', 'email',
            'telefono', 'estado', 'created_at',
        ]);

        if ($request->filled('fecha_inicio')) {
            $query->where('created_at', '>=', $request->date('fecha_inicio')->startOfDay());
        }

        if ($request->filled('fecha_fin')) {
            $query->where('created_at', '<=', $request->date('fecha_fin')->endOfDay());
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        return $query->orderByDesc('created_at')->get();
    }

    private function construirSpreadsheet($clientes, Request $request): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Inscritos');

        // --- Título ---
        $sheet->mergeCells('A1:K1');
        $sheet->setCellValue('A1', 'REPORTE DE INSCRITOS — ' . now()->format('d/m/Y H:i'));
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // --- Subtítulo rango ---
        $inicio = $request->filled('fecha_inicio') ? $request->fecha_inicio : 'Inicio';
        $fin    = $request->filled('fecha_fin') ? $request->fecha_fin : now()->toDateString();

        $sheet->mergeCells('A2:K2');
        $sheet->setCellValue('A2', "Período: {$inicio} al {$fin}  |  Total inscritos: " . $clientes->count());
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['rgb' => '444444']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EAF0FB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // --- Encabezados ---
        $encabezados = [
            'A' => '#',
            'B' => 'Tipo Persona',
            'C' => 'Nombre',
            'D' => 'Apellidos',
            'E' => 'DNI',
            'F' => 'RUC',
            'G' => 'Departamento',
            'H' => 'Email',
            'I' => 'Teléfono',
            'J' => 'Estado',
            'K' => 'Fecha Inscripción',
        ];

        foreach ($encabezados as $col => $titulo) {
            $sheet->setCellValue("{$col}3", $titulo);
        }

        $sheet->getStyle('A3:K3')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
        ]);

        // --- Datos ---
        $fila = 4;
        foreach ($clientes as $i => $cliente) {
            $esPar = ($i % 2 === 0);
            $bgColor = $esPar ? 'F8FAFF' : 'FFFFFF';

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
            $sheet->setCellValue("K{$fila}", $cliente->created_at->format('d/m/Y H:i'));

            $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray([
                'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
            ]);

            // Color por estado
            $coloresEstado = [
                'activo'    => '16A34A',
                'pendiente' => 'D97706',
                'rechazado' => 'DC2626',
            ];
            $colorEstado = $coloresEstado[$cliente->estado] ?? '6B7280';
            $sheet->getStyle("J{$fila}")->getFont()->getColor()->setRGB($colorEstado);
            $sheet->getStyle("J{$fila}")->getFont()->setBold(true);

            $fila++;
        }

        // --- Anchos de columna ---
        $anchos = ['A' => 6, 'B' => 14, 'C' => 20, 'D' => 20, 'E' => 13,
                   'F' => 13, 'G' => 16, 'H' => 28, 'I' => 14, 'J' => 12, 'K' => 18];
        foreach ($anchos as $col => $ancho) {
            $sheet->getColumnDimension($col)->setWidth($ancho);
        }

        // --- Segunda hoja: Resumen por mes ---
        $sheetResumen = $spreadsheet->createSheet();
        $sheetResumen->setTitle('Resumen por Mes');
        $this->construirHojaResumenMes($sheetResumen, $clientes);

        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }

    private function construirHojaResumenMes($sheet, $clientes): void
    {
        $sheet->mergeCells('A1:C1');
        $sheet->setCellValue('A1', 'INSCRITOS POR MES');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $sheet->setCellValue('A2', 'Mes');
        $sheet->setCellValue('B2', 'Total Inscritos');
        $sheet->setCellValue('C2', '% del Total');
        $sheet->getStyle('A2:C2')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $porMes = $clientes->groupBy(fn($c) => $c->created_at->format('Y-m'))
            ->map->count()
            ->sortKeys();

        $total = $clientes->count();
        $fila = 3;

        foreach ($porMes as $mes => $cantidad) {
            $porcentaje = $total > 0 ? round(($cantidad / $total) * 100, 2) : 0;
            $sheet->setCellValue("A{$fila}", $mes);
            $sheet->setCellValue("B{$fila}", $cantidad);
            $sheet->setCellValue("C{$fila}", "{$porcentaje}%");
            $fila++;
        }

        $sheet->getStyle("A{$fila}:C{$fila}")->getFont()->setBold(true);
        $sheet->setCellValue("A{$fila}", 'TOTAL');
        $sheet->setCellValue("B{$fila}", $total);
        $sheet->setCellValue("C{$fila}", '100%');

        $sheet->getColumnDimension('A')->setWidth(14);
        $sheet->getColumnDimension('B')->setWidth(18);
        $sheet->getColumnDimension('C')->setWidth(14);
    }

    private function construirEmailHtml($totalHoy, $clientes): string
    {
        $filas = $clientes->take(20)->map(fn($c) => "
            <tr>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$c->nombre} {$c->apellidos}</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$c->email}</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>" . ucfirst($c->tipo_persona) . "</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>" . ucfirst($c->estado) . "</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$c->created_at->format('H:i')}</td>
            </tr>")->implode('');

        $nota = $clientes->count() > 20
            ? "<p style='color:#6b7280;font-size:12px;'>* Se muestran los primeros 20 registros. Ver Excel adjunto para el listado completo.</p>"
            : '';

        return "
        <div style='font-family:Arial,sans-serif;max-width:700px;margin:0 auto;'>
            <div style='background:#1E3A5F;color:#fff;padding:24px;border-radius:8px 8px 0 0;'>
                <h2 style='margin:0;'>📊 Reporte Diario de Inscritos</h2>
                <p style='margin:4px 0 0;opacity:.8;'>" . now()->format('d/m/Y') . "</p>
            </div>
            <div style='background:#f8faff;padding:20px;'>
                <div style='background:#2563EB;color:#fff;display:inline-block;padding:12px 24px;border-radius:8px;font-size:28px;font-weight:bold;'>
                    {$totalHoy} inscritos hoy
                </div>
            </div>
            <table style='width:100%;border-collapse:collapse;'>
                <thead style='background:#2563EB;color:#fff;'>
                    <tr>
                        <th style='padding:8px 10px;text-align:left;'>Nombre</th>
                        <th style='padding:8px 10px;text-align:left;'>Email</th>
                        <th style='padding:8px 10px;text-align:left;'>Tipo</th>
                        <th style='padding:8px 10px;text-align:left;'>Estado</th>
                        <th style='padding:8px 10px;text-align:left;'>Hora</th>
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