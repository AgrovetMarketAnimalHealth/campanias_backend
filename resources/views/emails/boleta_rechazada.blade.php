<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante rechazado</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
            background: linear-gradient(135deg, #fef2f2, #fee2e2);
            border: 2px dashed #dc2626;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }

        .codigo-box p {
            font-size: 13px;
            color: #b91c1c;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }

        .codigo-box span {
            font-size: 26px;
            font-weight: 800;
            color: #dc2626;
            letter-spacing: 3px;
        }

        /* ESTADO */
        .status-box {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            border-radius: 6px;
            padding: 14px 18px;
            margin: 20px 0;
        }

        .status-box p {
            margin: 0;
            font-size: 14px;
            color: #b91c1c;
            font-weight: 600;
        }

        /* MOTIVO BOX */
        .motivo-box {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 10px;
            padding: 20px;
            margin: 24px 0;
        }

        .motivo-box h3 {
            font-size: 14px;
            color: #9a3412;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: 700;
        }

        .motivo-box p {
            font-size: 14px;
            color: #7c2d12;
            margin: 0;
            line-height: 1.6;
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

        /* CTA */
        .cta-box {
            background: linear-gradient(135deg, #f3f0ff, #ede9fe);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }

        .cta-box p {
            font-size: 14px;
            color: #4b0fa8;
            margin-bottom: 14px;
        }

        .cta-box a {
            background: linear-gradient(135deg, #7f22fe, #5b0db3);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            display: inline-block;
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
            <h1>Tu comprobante no<br>pudo ser aceptado ❌</h1>
            <p>Puedes corregirlo y volver a enviarlo</p>
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
                Revisamos tu comprobante de pago y lamentablemente
                <strong>no pudo ser procesado</strong>. Te explicamos el motivo
                a continuación para que puedas corregirlo y volver a participar.
            </p>

            {{-- CODIGO --}}
            <div class="codigo-box">
                <p>🔖 Código de seguimiento</p>
                <span>{{ $boleta->codigo }}</span>
            </div>

            {{-- ESTADO --}}
            <div class="status-box">
                <p>❌ Estado: Comprobante rechazado</p>
            </div>

            {{-- MOTIVO --}}
            <div class="motivo-box">
                <h3>⚠️ Motivo del rechazo</h3>
                <p>{{ $boleta->observacion }}</p>
            </div>

            {{-- DETALLE --}}
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
            </table>

            {{-- CTA --}}
            <div class="cta-box">
                <p>¿Crees que hubo un error? Puedes enviar un nuevo comprobante corregido desde tu portal.</p>
                <a href="{{ config('app.frontend_url') }}/portal/dashboard">Enviar nuevo comprobante</a>
            </div>

            <p>
                Recuerda que aún estás a tiempo de participar. ¡No te rindas! 💪
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