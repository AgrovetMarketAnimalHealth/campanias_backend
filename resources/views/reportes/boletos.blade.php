<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: DejaVu Sans, sans-serif;
    font-size: 9px;
    background: #fff;
  }

  /* Página: 3 columnas x 5 filas = 15 boletos por hoja A4 */
  .pagina {
    width: 210mm;
    min-height: 297mm;
    padding: 6mm;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 3mm;
    page-break-after: always;
  }

  .boleto {
    border: 1.5px dashed #aaa;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 54mm;
    position: relative;
  }

  /* Franja lateral tipo/color */
  .boleto.natural  { border-left: 4px solid #2563eb; }
  .boleto.juridica { border-left: 4px solid #d97706; }

  /* Cabecera con logo */
  .boleto__header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 3mm 3mm 2mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2mm;
  }

  .boleto__logo {
    height: 14mm;
    display: flex;
    align-items: center;
  }

  .boleto__logo img {
    max-height: 100%;
    max-width: 22mm;
    object-fit: contain;
  }

  .boleto__num {
    text-align: right;
    line-height: 1.3;
  }

  .boleto__num .num-label {
    font-size: 6px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: .3px;
    display: block;
  }

  .boleto__num .num-value {
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
  }

  /* Cuerpo del boleto */
  .boleto__body {
    padding: 2mm 3mm;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .boleto__nombre {
    font-size: 9.5px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
    margin-bottom: 1.5mm;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .boleto__datos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1mm 2mm;
  }

  .dato {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .dato__lbl {
    font-size: 6px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: .2px;
  }

  .dato__val {
    font-size: 7.5px;
    color: #334155;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Pie: puntos y contador */
  .boleto__footer {
    padding: 1.5mm 3mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #e2e8f0;
  }

  .boleto.natural  .boleto__footer { background: #eff6ff; }
  .boleto.juridica .boleto__footer { background: #fffbeb; }

  .footer__sorteo {
    font-size: 6.5px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .3px;
  }

  .footer__pts {
    font-size: 7px;
    font-weight: 700;
  }

  .boleto.natural  .footer__pts { color: #2563eb; }
  .boleto.juridica .footer__pts { color: #d97706; }

  /* Instrucción de recorte */
  .recortar-tip {
    text-align: center;
    font-size: 7px;
    color: #cbd5e1;
    margin: 1mm 0 0;
    letter-spacing: .5px;
    text-transform: uppercase;
  }
</style>
</head>
<body>

@php
  $porPagina = 15; // 3 columnas x 5 filas
@endphp

@foreach($puntos as $registro)
  @php
    $cantidad  = (int) $registro->puntos;  // puntos = cantidad de boletos
    $tipo      = $registro->cliente->tipo ?? 'natural';
    $nombre    = $tipo === 'juridica'
                   ? ($registro->cliente->razon_social ?? $registro->cliente->nombre)
                   : trim(($registro->cliente->nombre ?? '') . ' ' . ($registro->cliente->apellido ?? ''));
    $doc       = $tipo === 'juridica'
                   ? 'RUC: ' . ($registro->cliente->ruc ?? '-')
                   : 'DNI: ' . ($registro->cliente->dni ?? '-');
    $depto     = $registro->cliente->departamento ?? '-';
    $email     = $registro->cliente->email ?? '-';
    $telefono  = $registro->cliente->telefono ?? '-';
    $imagen    = $registro->imagen ?? '';
    $paginas   = (int) ceil($cantidad / $porPagina);
  @endphp

  {{-- Iterar páginas para este cliente --}}
  @for($p = 0; $p < $paginas; $p++)
    @php
      $inicio = $p * $porPagina + 1;
      $fin    = min(($p + 1) * $porPagina, $cantidad);
    @endphp

    <div class="pagina">
      @for($b = $inicio; $b <= $fin; $b++)
        <div class="boleto {{ $tipo }}">

          {{-- Header --}}
          <div class="boleto__header">
            <div class="boleto__logo">
              @if($imagen)
                <img src="{{ $imagen }}" alt="logo"/>
              @endif
            </div>
            <div class="boleto__num">
              <span class="num-label">Boleto</span>
              <span class="num-value">#{{ str_pad($b, 4, '0', STR_PAD_LEFT) }}</span>
            </div>
          </div>

          {{-- Body --}}
          <div class="boleto__body">
            <div class="boleto__nombre">{{ $nombre }}</div>
            <div class="boleto__datos">
              <div class="dato">
                <span class="dato__lbl">{{ $tipo === 'juridica' ? 'RUC' : 'DNI' }}</span>
                <span class="dato__val">{{ $tipo === 'juridica' ? ($registro->cliente->ruc ?? '-') : ($registro->cliente->dni ?? '-') }}</span>
              </div>
              <div class="dato">
                <span class="dato__lbl">Departamento</span>
                <span class="dato__val">{{ $depto }}</span>
              </div>
              <div class="dato">
                <span class="dato__lbl">Teléfono</span>
                <span class="dato__val">{{ $telefono }}</span>
              </div>
              <div class="dato">
                <span class="dato__lbl">Email</span>
                <span class="dato__val">{{ $email }}</span>
              </div>
            </div>
          </div>

          {{-- Footer --}}
          <div class="boleto__footer">
            <span class="footer__sorteo">✂ Sorteo Promo</span>
            <span class="footer__pts">{{ $b }} / {{ $cantidad }} boletos</span>
          </div>

        </div>
      @endfor

      {{-- Rellenar celdas vacías si la última página no está completa --}}
      @if($fin < ($p + 1) * $porPagina)
        @for($v = $fin + 1; $v <= ($p + 1) * $porPagina; $v++)
          <div></div>
        @endfor
      @endif

    </div>{{-- .pagina --}}
  @endfor

@endforeach

</body>
</html>