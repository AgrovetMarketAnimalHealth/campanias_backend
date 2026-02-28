<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante aceptado</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            background-color: #f3f0ff;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
        }

        /* HEADER */
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .header img {
            height: 60px;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            line-height: 1.3;
            letter-spacing: -0.5px;
        }

        .header p {
            color: rgba(255,255,255,0.85);
            font-size: 15px;
            margin-top: 10px;
        }

        /* BANNER */
        .prize-banner {
            background-color: #1a0033;
            padding: 20px 30px;
            text-align: center;
        }

        .prize-banner p {
            color: #ffffff;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 6px;
            opacity: 0.7;
        }

        .prize-banner h2 {
            color: #ffffff;
            font-size: 18px;
        }

        .prize-banner h2 span {
            color: #c084fc;
        }

        /* BODY */
        .body {
            padding: 36px 30px;
            color: #333333;
        }

        .body p {
            line-height: 1.7;
            font-size: 15px;
            margin-bottom: 16px;
        }

        .greeting {
            font-size: 17px;
            font-weight: 600;
            color: #1a0033;
        }

        /* CODIGO */
        .codigo-box {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border: 2px dashed #16a34a;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }

        .codigo-box p {
            font-size: 13px;
            color: #15803d;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }

        .codigo-box span {
            font-size: 26px;
            font-weight: 800;
            color: #16a34a;
            letter-spacing: 3px;
        }

        /* ESTADO */
        .status-box {
            background-color: #f0fdf4;
            border-left: 4px solid #16a34a;
            border-radius: 6px;
            padding: 14px 18px;
            margin: 20px 0;
        }

        .status-box p {
            margin: 0;
            font-size: 14px;
            color: #15803d;
            font-weight: 600;
        }

        /* PUNTOS HIGHLIGHT */
        .puntos-highlight {
            background: linear-gradient(135deg, #7f22fe, #5b0db3);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
        }

        .puntos-highlight p {
            color: rgba(255,255,255,0.8);
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }

        .puntos-highlight span {
            color: #ffffff;
            font-size: 42px;
            font-weight: 800;
            line-height: 1;
        }

        .puntos-highlight small {
            color: rgba(255,255,255,0.8);
            font-size: 16px;
            display: block;
            margin-top: 4px;
        }

        /* INFO TABLE */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            margin: 20px 0;
        }

        .info-table td {
            padding: 10px 14px;
            border-bottom: 1px solid #ede9fe;
            color: #333;
        }

        .info-table td:first-child {
            font-weight: 700;
            color: #1a0033;
            width: 40%;
        }

        .info-table tr:last-child td {
            border-bottom: none;
        }

        /* FECHAS */
        .dates-section {
            margin: 24px 0;
        }

        .dates-section h3 {
            font-size: 15px;
            color: #1a0033;
            margin-bottom: 12px;
            font-weight: 700;
        }

        .dates-list {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .date-chip {
            background: linear-gradient(135deg, #7f22fe, #5b0db3);
            color: #ffffff;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
        }

        /* LINKS */
        .links {
            text-align: center;
            margin-top: 20px;
            font-size: 13px;
        }

        .links a {
            color: #7f22fe;
            text-decoration: none;
            margin: 0 8px;
        }

        /* FOOTER */
        .footer {
            background-color: #1a0033;
            text-align: center;
            padding: 24px 30px;
        }

        .footer p {
            color: rgba(255,255,255,0.5);
            font-size: 12px;
            line-height: 1.8;
        }

        .footer a {
            color: #c084fc;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">

        {{-- HEADER --}}
        <div class="header">
            <img src="{{ config('app.url') }}/img/logo-atrevia.webp" alt="Atrevia">
            <h1>¡Tu comprobante fue<br>aceptado! ✅</h1>
            <p>Tus puntos ya han sido acreditados 🎉</p>
        </div>

        {{-- BANNER --}}
        <div class="prize-banner">
            <p>🏆 Premio de la campaña</p>
            <h2>1 entrada + <span>Meet & Greet</span> con Chayanne</h2>
        </div>

        {{-- BODY --}}
        <div class="body">

            <p class="greeting">Hola, {{ $boleta->cliente->nombre }} {{ $boleta->cliente->apellidos }}</p>

            <p>
                ¡Buenas noticias! Revisamos tu comprobante de pago y fue
                <strong>aceptado correctamente</strong>. Tus puntos ya están acreditados
                en tu cuenta. ¡Sigue acumulando para aumentar tus chances! 🍀
            </p>

            {{-- CODIGO --}}
            <div class="codigo-box">
                <p>🔖 Código de seguimiento</p>
                <span>{{ $boleta->codigo }}</span>
            </div>

            {{-- ESTADO --}}
            <div class="status-box">
                <p>✅ Estado: Comprobante aceptado</p>
            </div>

            {{-- PUNTOS ACREDITADOS --}}
            <div class="puntos-highlight">
                <p>🌟 Puntos acreditados</p>
                <span>{{ $boleta->puntos_otorgados }}</span>
                <small>puntos sumados a tu cuenta</small>
            </div>

            {{-- DETALLE DEL COMPROBANTE --}}
            <table class="info-table">
                <tr>
                    <td>N° de comprobante</td>
                    <td>{{ $boleta->numero_boleta }}</td>
                </tr>
                <tr>
                    <td>Monto registrado</td>
                    <td>S/ {{ number_format($boleta->monto, 2) }}</td>
                </tr>
                <tr>
                    <td>Fecha de envío</td>
                    <td>{{ $boleta->created_at->format('d/m/Y H:i') }}</td>
                </tr>
                <tr>
                    <td>Correo registrado</td>
                    <td>{{ $boleta->cliente->email }}</td>
                </tr>
                @if($boleta->observacion)
                <tr>
                    <td>Observación</td>
                    <td>{{ $boleta->observacion }}</td>
                </tr>
                @endif
            </table>

            {{-- FECHAS --}}
            <div class="dates-section">
                <h3>📅 Fechas de sorteo</h3>
                <div class="dates-list">
                    <span class="date-chip">Viernes 27 de marzo</span>
                    <span class="date-chip">Jueves 24 de abril</span>
                    <span class="date-chip">Domingo 11 de mayo</span>
                </div>
            </div>

            <p>
                ¡Mucha suerte en el sorteo! Recuerda que puedes seguir enviando
                comprobantes para acumular más puntos. 🚀
            </p>

            {{-- LINKS --}}
            <div class="links">
                <a href="{{ config('app.frontend_url') }}/portal/terminos-condiciones">Términos y condiciones</a>
                &bull;
                <a href="{{ config('app.frontend_url') }}/portal/politicas-privacidad">Políticas de privacidad</a>
            </div>

        </div>

        {{-- FOOTER --}}
        <div class="footer">
            <p>
                Este correo fue enviado a <a href="mailto:{{ $boleta->cliente->email }}">{{ $boleta->cliente->email }}</a><br>
                Concierto: 22 de mayo &bull; Costa Rica<br><br>
                &copy; {{ date('Y') }} Atrevia. Todos los derechos reservados.
            </p>
        </div>

    </div>
</body>
</html>