<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante rechazado</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background-color: #f3f0ff; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; }
        .header-img { width: 100%; display: block; line-height: 0; }
        .header-img img { width: 100%; display: block; }
        .body { padding: 36px 30px; color: #333333; }
        .body p { line-height: 1.7; font-size: 15px; margin-bottom: 16px; }
        .greeting { font-size: 17px; font-weight: 600; color: #1a0033; }

        .codigo-box { background: linear-gradient(135deg, #f5f0ff, #ede9fe); border: 2px dashed #9968d8; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .codigo-box p { font-size: 13px; color: #9968d8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .codigo-box span { font-size: 26px; font-weight: 800; color: #9968d8; letter-spacing: 3px; }

        .status-box { background-color: #f5f0ff; border-left: 4px solid #9968d8; border-radius: 6px; padding: 14px 18px; margin: 20px 0; }
        .status-box p { margin: 0; font-size: 14px; color: #9968d8; font-weight: 600; }

        .motivo-box { background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 20px; margin: 24px 0; }
        .motivo-box h3 { font-size: 14px; color: #9a3412; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 700; }
        .motivo-box p { font-size: 14px; color: #7c2d12; margin: 0; line-height: 1.6; }

        .info-table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0; }
        .info-table td { padding: 10px 14px; border-bottom: 1px solid #ede9fe; color: #333; }
        .info-table td:first-child { font-weight: 700; color: #1a0033; width: 40%; }
        .info-table tr:last-child td { border-bottom: none; }

        .cta-box { background: linear-gradient(135deg, #f3f0ff, #ede9fe); border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .cta-box p { font-size: 14px; color: #4b0fa8; margin-bottom: 14px; }
        .cta-box a { background: linear-gradient(135deg, #9968d8, #7f22fe); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; display: inline-block; }

        .links { text-align: center; margin-top: 20px; font-size: 13px; }
        .links a { color: #9968d8; text-decoration: none; margin: 0 8px; }
        .footer { background-color: #1a0033; text-align: center; padding: 24px 30px; }
        .footer p { color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.8; }
        .footer a { color: #c084fc; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">

        {{-- HEADER: imagen de portada --}}
        <div class="header-img">
            <img src="{{ config('app.url') }}/emails/Header Mailing_Registro rechazado.webp"
                 alt="Registro rechazado – Destino Chayanne">
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
                <p>Código de seguimiento</p>
                <span>{{ $boleta->codigo }}</span>
            </div>

            {{-- ESTADO --}}
            <div class="status-box">
                <p>Estado: Comprobante rechazado</p>
            </div>

            {{-- MOTIVO --}}
            <div class="motivo-box">
                <h3>Motivo del rechazo</h3>
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
                Recuerda que aún estás a tiempo de participar. ¡No te rindas!
            </p>

            {{-- LINKS --}}
            <div class="links">
                <a href="{{ config('app.frontend_url') }}/portal/terminos-condiciones">Términos y condiciones</a>
                &bull;
                <a href="{{ config('app.frontend_url') }}/portal/politicas-de-privacidad">Políticas de privacidad</a>
            </div>

        </div>

        {{-- FOOTER --}}
         <div class="footer">
            <p>
                Este correo fue enviado a <a href="mailto:{{ $boleta->cliente->email }}">{{ $boleta->cliente->email }}</a><br>
                <strong>Concierto:</strong> 22 de mayo 2026 · San José, Costa Rica<br>
                <strong>Contacto:</strong> WhatsApp <a href="https://wa.me/51903069021">903 069 021</a> · <a href="https://atrevia.vet/promo-concierto/">atrevia.vet/promo-concierto</a><br><br>
                &copy; {{ date('Y') }} Atrevia - Agrovet Market. Todos los derechos reservados.
            </p>
        </div>

    </div>
</body>
</html>