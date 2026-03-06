<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso inusual detectado – Atrevia</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background-color: #f3f0ff; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header-img { width: 100%; display: block; line-height: 0; }
        .header-img img { width: 100%; display: block; }
        .body { padding: 36px 30px; color: #333333; }
        .body p { line-height: 1.7; font-size: 15px; margin-bottom: 16px; }
        .greeting { font-size: 17px; font-weight: 600; color: #1a0033; }
        .alert-box { background-color: #fff5f5; border-left: 4px solid #e53e3e; border-radius: 6px; padding: 14px 18px; margin: 20px 0; }
        .alert-box p { margin: 0; font-size: 14px; color: #e53e3e; font-weight: 600; }
        .info-table { width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden; margin: 20px 0; }
        .info-table th { background-color: #9968d8; color: #ffffff; padding: 12px 14px; text-align: left; font-weight: 600; }
        .info-table td { padding: 10px 14px; border-bottom: 1px solid #ede9fe; color: #333; }
        .info-table tr:last-child td { border-bottom: none; }
        .info-table .label { font-weight: 700; color: #1a0033; width: 120px; }
        .actions { margin: 28px 0; }
        .actions p { font-size: 14px; margin-bottom: 10px; }
        .actions .ok  { color: #2f855a; font-weight: 600; }
        .actions .danger { color: #e53e3e; font-weight: 600; }
        .cta { text-align: center; margin: 30px 0 10px; }
        .cta a { background: linear-gradient(135deg, #9968d8 0%, #7f22fe 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 700; display: inline-block; }
        .links { text-align: center; margin-top: 25px; font-size: 13px; }
        .links a { color: #9968d8; text-decoration: none; margin: 0 8px; }
        .footer { background-color: #1a0033; text-align: center; padding: 24px 30px; }
        .footer p { color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.8; }
        .footer a { color: #c084fc; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">

        <!-- HEADER -->
        <div class="header-img">
            <img src="{{ config('app.url') }}/emails/registrarte.webp"
                 alt="Destino Chayanne – Seguridad de cuenta">
        </div>

        <!-- BODY -->
        <div class="body">

            <p class="greeting">Hola, {{ $cliente->nombre }} {{ $cliente->apellidos }}</p>

            <p>
                Detectamos un acceso inusual en tu cuenta y
                <strong>cerramos tu sesión automáticamente</strong> por tu seguridad.
            </p>

            <!-- ALERTA -->
            <div class="alert-box">
                <p>⚠️ Motivo: {{ $metadata['motivo'] }}</p>
            </div>

            <!-- DETALLES DEL ACCESO -->
            <table class="info-table">
                <thead>
                    <tr>
                        <th colspan="2">Detalles del acceso detectado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="label">IP</td>
                        <td>{{ $metadata['ip'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">Dispositivo</td>
                        <td>{{ $metadata['user_agent'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">Fecha</td>
                        <td>{{ $metadata['fecha'] }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- ACCIONES -->
            <div class="actions">
                <p class="ok">✅ Si fuiste tú — vuelve a iniciar sesión normalmente.</p>
                <p class="danger">🚨 Si NO fuiste tú — contacta a soporte inmediatamente por WhatsApp.</p>
            </div>

            <!-- CTA -->
            <div class="cta">
                <a href="{{ config('app.frontend_url') }}/promo-concierto/iniciar-sesion">
                    Iniciar sesión
                </a>
            </div>

            <!-- LINKS -->
            <div class="links">
                <a href="{{ config('app.frontend_url') }}/portal/terminos-condiciones">Términos y condiciones</a>
                &bull;
                <a href="{{ config('app.frontend_url') }}/portal/politicas-de-privacidad">Políticas de privacidad</a>
            </div>

        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>
                Este correo fue enviado a <a href="mailto:{{ $cliente->email }}">{{ $cliente->email }}</a><br>
                <strong>Concierto:</strong> 22 de mayo 2026 · San José, Costa Rica<br>
                <strong>Contacto:</strong> WhatsApp <a href="https://wa.me/51903069021">903 069 021</a> · <a href="https://atrevia.vet/promo-concierto/">atrevia.vet/promo-concierto</a><br><br>
                &copy; {{ date('Y') }} Atrevia - Agrovet Market. Todos los derechos reservados.
            </p>
        </div>

    </div>
</body>
</html>