<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a la campaña Atrevia!</title>
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
            background: linear-gradient(135deg, #7f22fe 0%, #5b0db3 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .header img {
            height: 60px;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            line-height: 1.4;
        }

        .header p {
            color: rgba(255,255,255,0.85);
            font-size: 14px;
            margin-top: 8px;
        }

        /* BANNER PREMIO */
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

        /* ESTADO */
        .status-box {
            background-color: #f3f0ff;
            border-left: 4px solid #7f22fe;
            border-radius: 6px;
            padding: 14px 18px;
            margin: 20px 0;
        }

        .status-box p {
            margin: 0;
            font-size: 14px;
            color: #4b0fa8;
            font-weight: 600;
        }

        /* PUNTOS */
        .points-section {
            margin: 24px 0;
        }

        .points-section h3 {
            font-size: 15px;
            color: #1a0033;
            margin-bottom: 12px;
            font-weight: 700;
        }

        .points-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .points-table th {
            background-color: #7f22fe;
            color: #ffffff;
            padding: 10px 14px;
            text-align: left;
        }

        .points-table td {
            padding: 10px 14px;
            border-bottom: 1px solid #ede9fe;
            color: #333;
        }

        .points-table tr:last-child td {
            border-bottom: none;
        }

        .points-table .pts {
            font-weight: 700;
            color: #7f22fe;
        }

        /* FECHAS SORTEO */
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

        /* CTA */
        .cta {
            text-align: center;
            margin: 30px 0 10px;
        }

        .cta a {
            background: linear-gradient(135deg, #7f22fe 0%, #5b0db3 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 700;
            display: inline-block;
        }

        /* NOTA IGV */
        .igv-note {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 10px;
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

        .links a:hover {
            text-decoration: underline;
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
            <h1>¡Gracias por registrarte,<br>{{ $cliente->nombre }}!</h1>
            <p>Tu participación está en camino 🎶</p>
        </div>

        {{-- BANNER PREMIO --}}
        <div class="prize-banner">
            <p>🏆 Premio de la campaña</p>
            <h2>1 entrada + <span>Meet & Greet</span> con Chayanne</h2>
        </div>

        {{-- BODY --}}
        <div class="body">

            <p class="greeting">Hola, {{ $cliente->nombre }} {{ $cliente->apellidos }}</p>

            <p>
                Recibimos tu registro exitosamente. Estamos revisando tu comprobante de pago
                para acreditar tus puntos y que puedas participar en el sorteo.
            </p>

            {{-- ESTADO --}}
            <div class="status-box">
                <p>⏳ Estado actual: Comprobante pendiente de revisión</p>
            </div>

            {{-- PUNTOS --}}
            <div class="points-section">
                <h3>¿Cómo acumulas puntos?</h3>
                <table class="points-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Por cada S/ 1,000</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Atrevia 360</td>
                            <td class="pts">2 puntos</td>
                        </tr>
                        <tr>
                            <td>Atrevia XR</td>
                            <td class="pts">1 punto</td>
                        </tr>
                        <tr>
                            <td>Atrevia One</td>
                            <td class="pts">1 punto</td>
                        </tr>
                    </tbody>
                </table>
                <p class="igv-note">* No incluye IGV</p>
            </div>

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
                Te notificaremos por este correo cuando tu comprobante sea aprobado
                y tus puntos sean acreditados. ¡Mucha suerte! 🍀
            </p>

            {{-- CTA --}}
            <div class="cta">
                <a href="{{ config('app.frontend_url') }}/email/verify/{{ $cliente->email_verification_token }}">
                    Verificar mi correo
                </a>
            </div>

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
                Este correo fue enviado a <a href="mailto:{{ $cliente->email }}">{{ $cliente->email }}</a><br>
                Concierto: 22 de mayo &bull; Costa Rica<br><br>
                &copy; {{ date('Y') }} Atrevia. Todos los derechos reservados.
            </p>
        </div>

    </div>
</body>
</html>