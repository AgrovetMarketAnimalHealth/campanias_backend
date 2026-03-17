<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, sans-serif; background: #fff; color: #000; margin: 2mm; }
  .pagina { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .pagina > tbody > tr > td { width: 33.33%; vertical-align: top; padding: 0.6mm; }
  .ticket { width: 100%; border: 0.5px solid #7B2FBE; }
  .talon-head { background: #7B2FBE; padding: 1.8mm 1mm; text-align: center; position: relative; }
  .talon-head img { height: 5mm; max-width: 22mm; filter: brightness(0) invert(1); display: block; margin: 0 auto; }
  .talon-head-txt { font-size: 14px; font-weight: 800; color: #fff; letter-spacing: 2px; text-transform: uppercase; display: block; line-height: 1; }
  .pts-badge { position: absolute; top: 0.6mm; right: 0.6mm; background: #F0C040; color: #5A1F8A; font-size: 11px; font-weight: 800; padding: 0.8mm 1.2mm; white-space: nowrap; line-height: 1.2; }
  .t-tipo-wrap { background: #EDD9FA; text-align: center; border-bottom: 0.3px solid #C9A0E8; border-top: 0.3px solid #C9A0E8; padding: 1mm 0; line-height: 1; }
  .t-tipo { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #5A1F8A; line-height: 1; display: block; }
  .talon-body { padding: 1.8mm 1.5mm 1mm; }
  .t-campo { margin-bottom: 1.5mm; padding-bottom: 1.2mm; border-bottom: 0.3px solid #EAE0FA; }
  .t-campo:last-child { border-bottom: none; margin-bottom: 0; }
  .t-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2px; color: #aaa; display: block; line-height: 1.2; }
  .t-val { font-size: 11px; font-weight: 700; color: #111; display: block; white-space: normal; word-break: break-word; line-height: 1.3; }
  .t-val-sm { font-size: 10px; font-weight: 600; color: #111; display: block; white-space: normal; word-break: break-word; line-height: 1.3; }
  .t-footer { border-top: 2.5px dashed #C9A0E8; margin-top: 1.2mm; padding: 1.5mm 0 1.8mm; background: #F5EEFF; text-align: center; }
  .t-cod-lbl { font-size: 10px; text-transform: uppercase; color: #aaa; display: block; line-height: 1.3; letter-spacing: 0.3px; }
  .t-cod-val { font-size: 16px; font-weight: 800; color: #7B2FBE; display: block; letter-spacing: 0.5px; line-height: 1.4; }
  .t-cod-sub { font-size: 10px; color: #bbb; display: block; line-height: 1.3; }
</style>
</head>
<body>

@php
  $todos = [];
  foreach ($puntos as $registro) {
      $cantidad = (int) ($registro->puntos ?? 0);
      if ($cantidad <= 0) continue;
      $cliente      = $registro->cliente;
      $tipo         = strtolower($cliente->tipo_persona ?? 'natural');
      $esJ          = $tipo === 'juridica';
      $nombre       = trim(($cliente->nombre ?? '') . ' ' . ($cliente->apellidos ?? ''));
      $razonSoc     = $cliente->razon_social ?? $nombre;
      $docVal       = $esJ ? ($cliente->ruc ?? '-') : ($cliente->dni ?? '-');
      $tipoLabel    = $esJ ? 'Persona Jurídica' : 'Persona Natural';
      $codigoBoleta = $registro->boleta->codigo ?? '-';
      $puntosTxt    = number_format((float)($registro->puntos ?? 0), 0) . ' pts';
      $imagen       = $registro->imagen ?? '';
      for ($i = 1; $i <= $cantidad; $i++) {
          $todos[] = [
              'tipoLabel'    => $tipoLabel,
              'esJuridica'   => $esJ,
              'nombre'       => $nombre,
              'razonSoc'     => $razonSoc,
              'docVal'       => $docVal,
              'email'        => $cliente->email        ?? '-',
              'telefono'     => $cliente->telefono     ?? '-',
              'departamento' => $cliente->departamento ?? '-',
              'codigo'       => $codigoBoleta,
              'puntos'       => $puntosTxt,
              'imagen'       => $imagen,
              'tickNum'      => $i,
              'tickTotal'    => $cantidad,
          ];
      }
  }
  // Una sola tabla continua — sin saltos forzados
  while (count($todos) % 3 !== 0) { $todos[] = null; }
  $filas = array_chunk($todos, 3);
@endphp

<table class="pagina">
<tbody>
@foreach($filas as $fila)
<tr>
  @foreach($fila as $tick)
  <td>
  @if($tick !== null)
  <div class="ticket">
    <div class="talon-head">
      @if($tick['imagen'])
        <img src="{{ $tick['imagen'] }}" alt="logo"/>
      @else
        <span class="talon-head-txt">ATREVIA</span>
      @endif
      <span class="pts-badge">★ {{ $tick['puntos'] }}</span>
    </div>
    <div class="t-tipo-wrap">
      <span class="t-tipo">{{ $tick['tipoLabel'] }}</span>
    </div>
    <div class="talon-body">
      @if($tick['esJuridica'])
        <div class="t-campo">
          <span class="t-lbl">Razón Social</span>
          <span class="t-val">{{ $tick['razonSoc'] }}</span>
        </div>
        <div class="t-campo">
          <span class="t-lbl">RUC</span>
          <span class="t-val">{{ $tick['docVal'] }}</span>
        </div>
        <div class="t-campo">
          <span class="t-lbl">Rep. Legal</span>
          <span class="t-val">{{ $tick['nombre'] }}</span>
        </div>
      @else
        <div class="t-campo">
          <span class="t-lbl">Nombre</span>
          <span class="t-val">{{ $tick['nombre'] }}</span>
        </div>
        <div class="t-campo">
          <span class="t-lbl">DNI</span>
          <span class="t-val">{{ $tick['docVal'] }}</span>
        </div>
      @endif
      <div class="t-campo">
        <span class="t-lbl">Teléfono</span>
        <span class="t-val">{{ $tick['telefono'] }}</span>
      </div>
      <div class="t-campo">
        <span class="t-lbl">Departamento</span>
        <span class="t-val">{{ $tick['departamento'] }}</span>
      </div>
      <div class="t-campo">
        <span class="t-lbl">Email</span>
        <span class="t-val-sm">{{ $tick['email'] }}</span>
      </div>
      <div class="t-footer">
        <span class="t-cod-lbl">N° Boleto</span>
        <span class="t-cod-val">{{ $tick['codigo'] }}</span>
        <span class="t-cod-sub">({{ $tick['tickNum'] }} de {{ $tick['tickTotal'] }})</span>
      </div>
    </div>
  </div>
  @endif
  </td>
  @endforeach
</tr>
@endforeach
</tbody>
</table>

</body>
</html>