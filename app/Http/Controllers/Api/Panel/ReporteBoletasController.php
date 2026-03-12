<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Models\Boleta;
use App\Services\BrevoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReporteBoletasController extends Controller
{
    public function __construct(private readonly BrevoService $brevo) {}

    /**
     * Métricas ligeras — por defecto HOY.
     * Gráfico de líneas con pendiente/aceptada/rechazada por día o mes.
     */
    public function metricas(Request $request)
    {
        Gate::authorize('viewAny', Boleta::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $fechaInicio = $request->filled('fecha_inicio')
            ? $request->date('fecha_inicio')->startOfDay()
            : now()->startOfDay();

        $fechaFin = $request->filled('fecha_fin')
            ? $request->date('fecha_fin')->endOfDay()
            : now()->endOfDay();

        // Boletas por día separadas por estado
        $porDia = Boleta::query()
            ->selectRaw('DATE(created_at) as fecha, estado, COUNT(*) as total')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->whereIn('estado', ['pendiente', 'aceptada', 'rechazada'])
            ->groupByRaw('DATE(created_at), estado')
            ->orderBy('fecha')
            ->get()
            ->groupBy('fecha')
            ->map(fn($rows) => [
                'fecha'     => $rows->first()->fecha,
                'pendiente' => (int) ($rows->firstWhere('estado', 'pendiente')?->total ?? 0),
                'aceptada'  => (int) ($rows->firstWhere('estado', 'aceptada')?->total  ?? 0),
                'rechazada' => (int) ($rows->firstWhere('estado', 'rechazada')?->total  ?? 0),
            ])
            ->values();

        // Boletas por mes separadas por estado
        $porMes = Boleta::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as mes, estado, COUNT(*) as total")
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->whereIn('estado', ['pendiente', 'aceptada', 'rechazada'])
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m'), estado")
            ->orderBy('mes')
            ->get()
            ->groupBy('mes')
            ->map(fn($rows) => [
                'mes'       => $rows->first()->mes,
                'pendiente' => (int) ($rows->firstWhere('estado', 'pendiente')?->total ?? 0),
                'aceptada'  => (int) ($rows->firstWhere('estado', 'aceptada')?->total  ?? 0),
                'rechazada' => (int) ($rows->firstWhere('estado', 'rechazada')?->total  ?? 0),
            ])
            ->values();

        // Totales por estado en el período
        $porEstado = Boleta::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->groupBy('estado')
            ->get()
            ->mapWithKeys(fn($r) => [$r->estado => (int) $r->total]);

        // Monto total aceptado en el período
        $montoAceptado = Boleta::query()
            ->where('estado', 'aceptada')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->sum('monto');

        // Recientes
        $recientes = Boleta::query()
            ->with('cliente:id,nombre,apellidos')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($b) => [
                'id'               => $b->id,
                'codigo'           => $b->codigo,
                'numero_boleta'    => $b->numero_boleta,
                'monto'            => (float) $b->monto,
                'puntos_otorgados' => $b->puntos_otorgados,
                'estado'           => $b->estado,
                'observacion'      => $b->observacion,
                'cliente'          => $b->cliente
                    ? trim("{$b->cliente->nombre} {$b->cliente->apellidos}")
                    : '—',
                'fecha' => $b->created_at->format('d/m/Y'),
                'hora'  => $b->created_at->format('h:i:s A'),
            ]);

        return response()->json([
            'rango' => [
                'inicio' => $fechaInicio->toDateString(),
                'fin'    => $fechaFin->toDateString(),
            ],
            'total_periodo'  => $porEstado->sum(),
            'por_estado'     => $porEstado,
            'monto_aceptado' => (float) $montoAceptado,
            'por_dia'        => $porDia,
            'por_mes'        => $porMes,
            'recientes'      => $recientes,
        ]);
    }

    /**
     * Listado paginado — por defecto HOY.
     */
    public function listado(Request $request)
    {
        Gate::authorize('viewAny', Boleta::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'estado'       => 'nullable|in:pendiente,aceptada,rechazada',
            'per_page'     => 'nullable|integer|min:10|max:100',
        ]);

        $fechaInicio = $request->filled('fecha_inicio')
            ? $request->date('fecha_inicio')->startOfDay()
            : now()->startOfDay();

        $fechaFin = $request->filled('fecha_fin')
            ? $request->date('fecha_fin')->endOfDay()
            : now()->endOfDay();

        $query = Boleta::query()
            ->select([
                'id', 'cliente_id', 'codigo', 'numero_boleta',
                'monto', 'puntos_otorgados', 'estado',
                'observacion', 'created_at',
            ])
            ->with('cliente:id,nombre,apellidos,tipo_persona')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        return response()->json(
            $query->orderByDesc('created_at')
                  ->paginate($request->integer('per_page', 25))
        );
    }

    /**
     * Exportar Excel.
     */
    public function exportarExcel(Request $request): StreamedResponse
    {
        Gate::authorize('viewAny', Boleta::class);

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'estado'       => 'nullable|in:pendiente,aceptada,rechazada',
        ]);

        $boletas = $this->obtenerBoletasParaExportar($request);
        $spreadsheet = $this->construirSpreadsheet($boletas, $request);
        $nombreArchivo = 'boletas_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $nombreArchivo, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$nombreArchivo}\"",
        ]);
    }

    /**
     * Enviar reporte por email.
     */
    public function enviarReporte(Request $request)
    {
        Gate::authorize('viewAny', Boleta::class);

        $request->validate([
            'email_destino' => 'required|email',
            'fecha_inicio'  => 'nullable|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $this->despacharReporte(
            emailDestino: $request->email_destino,
            fechaInicio:  $request->fecha_inicio,
            fechaFin:     $request->fecha_fin,
        );

        return response()->json(['message' => 'Reporte enviado correctamente.']);
    }

    // -------------------------------------------------------------------------
    // Internos
    // -------------------------------------------------------------------------

    public function despacharReporte(
        string $emailDestino,
        ?string $fechaInicio = null,
        ?string $fechaFin    = null,
    ): void {
        $request = new Request([
            'fecha_inicio' => $fechaInicio ?? now()->toDateString(),
            'fecha_fin'    => $fechaFin    ?? now()->toDateString(),
        ]);

        $boletas     = $this->obtenerBoletasParaExportar($request);
        $spreadsheet = $this->construirSpreadsheet($boletas, $request);

        $tmpPath = sys_get_temp_dir() . '/reporte_boletas_' . now()->format('Ymd_His') . '.xlsx';
        (new Xlsx($spreadsheet))->save($tmpPath);

        $esDiario = $fechaInicio === null && $fechaFin === null;
        $asunto   = $esDiario
            ? 'Reporte Diario de Boletas — ' . now()->format('d/m/Y')
            : 'Reporte de Boletas ' . $request->fecha_inicio . ' al ' . $request->fecha_fin;

        $this->brevo->enviarConAdjunto(
            destinatario:  $emailDestino,
            asunto:        $asunto,
            cuerpo:        $this->construirEmailHtml($boletas),
            tipo:          'reporte_boletas',
            adjuntoPath:   $tmpPath,
            nombreAdjunto: 'boletas_' . now()->format('Ymd_His') . '.xlsx',
        );

        @unlink($tmpPath);
    }

    private function obtenerBoletasParaExportar(Request $request)
    {
        $fechaInicio = $request->filled('fecha_inicio')
            ? $request->date('fecha_inicio')->startOfDay()
            : now()->startOfDay();

        $fechaFin = $request->filled('fecha_fin')
            ? $request->date('fecha_fin')->endOfDay()
            : now()->endOfDay();

        $query = Boleta::query()
            ->select([
                'id', 'cliente_id', 'codigo', 'numero_boleta',
                'monto', 'puntos_otorgados', 'estado',
                'observacion', 'created_at',
            ])
            ->with('cliente:id,nombre,apellidos')
            ->whereBetween('created_at', [$fechaInicio, $fechaFin]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        return $query->orderByDesc('created_at')->get();
    }

    private function construirSpreadsheet($boletas, Request $request): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();

        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Boletas');
        $this->construirHojaListado($sheet, $boletas, $request, 'REPORTE DE BOLETAS');

        $sheetPendientes = $spreadsheet->createSheet();
        $sheetPendientes->setTitle('Pendientes');
        $this->construirHojaListado(
            $sheetPendientes,
            $boletas->where('estado', 'pendiente')->values(),
            $request, 'BOLETAS PENDIENTES'
        );

        $sheetAceptadas = $spreadsheet->createSheet();
        $sheetAceptadas->setTitle('Aceptadas');
        $this->construirHojaListado(
            $sheetAceptadas,
            $boletas->where('estado', 'aceptada')->values(),
            $request, 'BOLETAS ACEPTADAS'
        );

        $sheetRechazadas = $spreadsheet->createSheet();
        $sheetRechazadas->setTitle('Rechazadas');
        $this->construirHojaListado(
            $sheetRechazadas,
            $boletas->where('estado', 'rechazada')->values(),
            $request, 'BOLETAS RECHAZADAS'
        );

        $sheetResumen = $spreadsheet->createSheet();
        $sheetResumen->setTitle('Resumen General');
        $this->construirHojaResumen($sheetResumen, $boletas);

        $spreadsheet->setActiveSheetIndex(0);
        return $spreadsheet;
    }

    private function construirHojaListado($sheet, $boletas, Request $request, string $titulo): void
    {
        $cols = ['A','B','C','D','E','F','G','H','I'];

        $sheet->mergeCells('A1:I1');
        $sheet->setCellValue('A1', $titulo . ' — ' . now()->format('d/m/Y h:i:s A'));
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $inicio = $request->filled('fecha_inicio') ? $request->fecha_inicio : now()->toDateString();
        $fin    = $request->filled('fecha_fin')    ? $request->fecha_fin    : now()->toDateString();

        $sheet->mergeCells('A2:I2');
        $sheet->setCellValue('A2', "Período: {$inicio} al {$fin}  |  Total: " . $boletas->count());
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['rgb' => '444444']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EAF0FB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $encabezados = [
            'A' => '#',
            'B' => 'Código',
            'C' => 'N° Boleta',
            'D' => 'Cliente',
            'E' => 'Monto (S/)',
            'F' => 'Puntos',
            'G' => 'Estado',
            'H' => 'Observación',
            'I' => 'Fecha y Hora',
        ];

        foreach ($encabezados as $col => $label) {
            $sheet->setCellValue("{$col}3", $label);
        }

        $sheet->getStyle('A3:I3')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
        ]);

        $fila = 4;
        foreach ($boletas as $i => $boleta) {
            $bgColor = ($i % 2 === 0) ? 'F8FAFF' : 'FFFFFF';

            $sheet->setCellValue("A{$fila}", $i + 1);
            $sheet->setCellValue("B{$fila}", $boleta->codigo);
            $sheet->setCellValue("C{$fila}", $boleta->numero_boleta);
            $sheet->setCellValue("D{$fila}", $boleta->cliente
                ? trim("{$boleta->cliente->nombre} {$boleta->cliente->apellidos}")
                : '—');
            $sheet->setCellValue("E{$fila}", number_format((float) $boleta->monto, 2));
            $sheet->setCellValue("F{$fila}", $boleta->puntos_otorgados);
            $sheet->setCellValue("G{$fila}", ucfirst($boleta->estado));
            $sheet->setCellValue("H{$fila}", $boleta->observacion ?? '—');
            $sheet->setCellValue("I{$fila}", $boleta->created_at->format('d/m/Y h:i:s A'));

            $sheet->getStyle("A{$fila}:I{$fila}")->applyFromArray([
                'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
            ]);

            $coloresEstado = [
                'aceptada'  => '16A34A',
                'pendiente' => 'D97706',
                'rechazada' => 'DC2626',
            ];
            $sheet->getStyle("G{$fila}")->getFont()->getColor()->setRGB($coloresEstado[$boleta->estado] ?? '6B7280');
            $sheet->getStyle("G{$fila}")->getFont()->setBold(true);

            $fila++;
        }

        $anchos = ['A' => 5, 'B' => 18, 'C' => 14, 'D' => 28,
                   'E' => 13, 'F' => 10, 'G' => 12, 'H' => 32, 'I' => 26];
        foreach ($anchos as $col => $ancho) {
            $sheet->getColumnDimension($col)->setWidth($ancho);
        }
    }

    private function construirHojaResumen($sheet, $boletas): void
    {
        $total      = $boletas->count();
        $pendientes = $boletas->where('estado', 'pendiente');
        $aceptadas  = $boletas->where('estado', 'aceptada');
        $rechazadas = $boletas->where('estado', 'rechazada');

        $sheet->mergeCells('A1:D1');
        $sheet->setCellValue('A1', 'RESUMEN GENERAL DE BOLETAS');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 13, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(24);

        $sheet->setCellValue('A2', 'Estado');
        $sheet->setCellValue('B2', 'Cantidad');
        $sheet->setCellValue('C2', 'Monto Total (S/)');
        $sheet->setCellValue('D2', '% del Total');
        $sheet->getStyle('A2:D2')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $fila   = 3;
        $grupos = [
            'pendiente' => ['label' => 'Pendientes', 'color' => 'D97706', 'col' => $pendientes],
            'aceptada'  => ['label' => 'Aceptadas',  'color' => '16A34A', 'col' => $aceptadas],
            'rechazada' => ['label' => 'Rechazadas', 'color' => 'DC2626', 'col' => $rechazadas],
        ];

        foreach ($grupos as $cfg) {
            $cantidad   = $cfg['col']->count();
            $monto      = $cfg['col']->sum('monto');
            $porcentaje = $total > 0 ? round(($cantidad / $total) * 100, 2) : 0;

            $sheet->setCellValue("A{$fila}", $cfg['label']);
            $sheet->setCellValue("B{$fila}", $cantidad);
            $sheet->setCellValue("C{$fila}", number_format((float) $monto, 2));
            $sheet->setCellValue("D{$fila}", "{$porcentaje}%");
            $sheet->getStyle("A{$fila}")->getFont()->getColor()->setRGB($cfg['color']);
            $sheet->getStyle("A{$fila}")->getFont()->setBold(true);
            $sheet->getStyle("A{$fila}:D{$fila}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
            ]);
            $fila++;
        }

        // Total
        $sheet->setCellValue("A{$fila}", 'TOTAL');
        $sheet->setCellValue("B{$fila}", $total);
        $sheet->setCellValue("C{$fila}", number_format((float) $boletas->sum('monto'), 2));
        $sheet->setCellValue("D{$fila}", '100%');
        $sheet->getStyle("A{$fila}:D{$fila}")->applyFromArray([
            'font'    => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
        ]);

        $sheet->getColumnDimension('A')->setWidth(14);
        $sheet->getColumnDimension('B')->setWidth(12);
        $sheet->getColumnDimension('C')->setWidth(18);
        $sheet->getColumnDimension('D')->setWidth(14);
    }

    private function construirEmailHtml($boletas): string
    {
        $total      = $boletas->count();
        $pendientes = $boletas->where('estado', 'pendiente')->count();
        $aceptadas  = $boletas->where('estado', 'aceptada')->count();
        $rechazadas = $boletas->where('estado', 'rechazada')->count();
        $monto      = number_format((float) $boletas->where('estado', 'aceptada')->sum('monto'), 2);

        $desde = $boletas->min('created_at')?->format('d/m/Y') ?? now()->format('d/m/Y');
        $hasta = $boletas->max('created_at')?->format('d/m/Y') ?? now()->format('d/m/Y');
        $rangoLabel = $desde === $hasta ? $desde : "{$desde} — {$hasta}";

        $filas = $boletas->take(20)->map(fn($b) => "
            <tr>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$b->codigo}</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>" . ($b->cliente ? trim("{$b->cliente->nombre} {$b->cliente->apellidos}") : '—') . "</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>S/ " . number_format((float)$b->monto, 2) . "</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>" . ucfirst($b->estado) . "</td>
                <td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;'>{$b->created_at->format('d/m/Y h:i:s A')}</td>
            </tr>")->implode('');

        $nota = $total > 20
            ? "<p style='color:#6b7280;font-size:12px;'>* Se muestran los primeros 20 registros. Ver Excel adjunto para el listado completo.</p>"
            : '';

        return "
        <div style='font-family:Arial,sans-serif;max-width:700px;margin:0 auto;'>
            <div style='background:#1E3A5F;color:#fff;padding:24px;border-radius:8px 8px 0 0;'>
                <h2 style='margin:0;'>🧾 Reporte de Boletas</h2>
                <p style='margin:4px 0 0;opacity:.8;font-size:14px;'>{$rangoLabel}</p>
            </div>
            <div style='background:#f8faff;padding:20px;display:flex;gap:12px;flex-wrap:wrap;'>
                <div style='background:#2563EB;color:#fff;padding:12px 20px;border-radius:8px;font-size:22px;font-weight:bold;text-align:center;'>
                    {$total}<br><span style='font-size:12px;font-weight:normal;'>Total</span>
                </div>
                <div style='background:#D97706;color:#fff;padding:12px 20px;border-radius:8px;font-size:22px;font-weight:bold;text-align:center;'>
                    {$pendientes}<br><span style='font-size:12px;font-weight:normal;'>Pendientes</span>
                </div>
                <div style='background:#16A34A;color:#fff;padding:12px 20px;border-radius:8px;font-size:22px;font-weight:bold;text-align:center;'>
                    {$aceptadas}<br><span style='font-size:12px;font-weight:normal;'>Aceptadas</span>
                </div>
                <div style='background:#DC2626;color:#fff;padding:12px 20px;border-radius:8px;font-size:22px;font-weight:bold;text-align:center;'>
                    {$rechazadas}<br><span style='font-size:12px;font-weight:normal;'>Rechazadas</span>
                </div>
                <div style='background:#7C3AED;color:#fff;padding:12px 20px;border-radius:8px;font-size:22px;font-weight:bold;text-align:center;'>
                    S/ {$monto}<br><span style='font-size:12px;font-weight:normal;'>Monto aceptado</span>
                </div>
            </div>
            <table style='width:100%;border-collapse:collapse;'>
                <thead style='background:#2563EB;color:#fff;'>
                    <tr>
                        <th style='padding:8px 10px;text-align:left;'>Código</th>
                        <th style='padding:8px 10px;text-align:left;'>Cliente</th>
                        <th style='padding:8px 10px;text-align:left;'>Monto</th>
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