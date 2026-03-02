<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante recibido - Campaña Atrevia</title>
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

        .info-table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0; }
        .info-table td { padding: 10px 14px; border-bottom: 1px solid #ede9fe; color: #333; }
        .info-table td:first-child { font-weight: 700; color: #1a0033; width: 40%; }
        .info-table tr:last-child td { border-bottom: none; }

        .points-section { margin: 24px 0; }
        .points-section h3 { font-size: 15px; color: #1a0033; margin-bottom: 12px; font-weight: 700; }
        .points-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .points-table th { background-color: #9968d8; color: #ffffff; padding: 10px 14px; text-align: left; }
        .points-table td { padding: 10px 14px; border-bottom: 1px solid #ede9fe; color: #333; }
        .points-table tr:last-child td { border-bottom: none; }
        .points-table .pts { font-weight: 700; color: #9968d8; }
        .note-text { text-align: center; font-size: 12px; color: #777; margin-top: 12px; font-style: italic; background-color: #f9f9f9; padding: 8px; border-radius: 20px; }

        .dates-section { margin: 24px 0; text-align: center; }
        .dates-section h3 { font-size: 15px; color: #1a0033; margin-bottom: 12px; font-weight: 700; text-align: left; }
        .dates-list { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .date-chip { background: linear-gradient(135deg, #9968d8, #7f22fe); color: #ffffff; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; }
        .date-chip span { display: block; font-size: 11px; font-weight: 400; opacity: 0.85; margin-top: 2px; }

        .premio-box { background-color: #f9f7ff; border: 1px solid #e0d0ff; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px; color: #333; }

        .links { text-align: center; margin-top: 20px; font-size: 13px; }
        .links a { color: #9968d8; text-decoration: none; margin: 0 8px; }
        .footer { background-color: #1a0033; text-align: center; padding: 24px 30px; }
        .footer p { color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.8; }
        .footer a { color: #c084fc; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">

        <!-- HEADER: imagen de portada -->
        <div class="header-img">
            <img src="{{ config('app.url') }}/emails/Header Mailing_Recibimos.webp"
                 alt="Recibimos tu comprobante – Destino Chayanne">
        </div>

        <!-- BODY -->
        <div class="body">

            <p class="greeting">Hola, {{ $cliente->nombre }} {{ $cliente->apellidos }}</p>

            <p>
                Hemos recibido tu comprobante de pago correctamente.
                Nuestro equipo lo revisará y acreditará tus opciones a la brevedad.
            </p>

            <!-- CÓDIGO DE SEGUIMIENTO -->
            <div class="codigo-box">
                <p>Tu código de seguimiento</p>
                <span>{{ $boleta->codigo }}</span>
            </div>

            <!-- ESTADO -->
            <div class="status-box">
                <p>Estado actual: Comprobante pendiente de revisión</p>
                <p style="font-weight:400; font-size:13px; color:#666; margin-top:6px;">Te confirmaremos la aprobación en un máximo de 2 días hábiles.</p>
            </div>

            <!-- DETALLE DE LA SOLICITUD -->
            <table class="info-table">
                <tr>
                    <td>Fecha de envío</td>
                    <td>{{ $boleta->created_at->format('d/m/Y H:i') }}</td>
                </tr>
                <tr>
                    <td>Correo registrado</td>
                    <td>{{ $cliente->email }}</td>
                </tr>
            </table>

            <!-- PUNTOS - CORREGIDO SEGÚN TDR -->
            <div class="points-section">
                <h3>¿Cómo acumulas opciones?</h3>
                <table class="points-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Por cada S/ 1,000</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Atrevia<sup>®</sup> 360</td>
                            <td class="pts">1 opción</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> Versa Gel</td>
                            <td class="pts">1 opción</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> 360 Spot On</td>
                            <td class="pts">1 opción</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> One</td>
                            <td class="pts">1 opción</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> XR</td>
                            <td class="pts">1 opción</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> Trio Cats</td>
                            <td class="pts">1 opción</td>
                        </tr>
                    </tbody>
                </table>
                <p class="note-text">* Asignación exacta por cada S/ 1,000. No aplica redondeo ni acumulación entre comprobantes.</p>
            </div>

            <!-- FECHAS DE SORTEO (CENTRADAS) -->
            <div class="dates-section">
                <h3>Fechas de sorteo</h3>
                <div class="dates-list">
                    <div class="date-chip">
                        1er Sorteo: 20 de marzo 2026
                        <span>2 premios</span>
                    </div>
                    <div class="date-chip">
                        2do Sorteo: 07 de mayo 2026
                        <span>3 premios</span>
                    </div>
                </div>
            </div>
            <p>
                Guarda tu código de seguimiento por si necesitas hacer algún reclamo.
                Te notificaremos cuando tu comprobante sea aprobado. ¡Mucha suerte!
            </p>

            <!-- LINKS LEGALES -->
            <div class="links">
                <a href="{{ config('app.frontend_url') }}/terminos-condiciones">Términos y condiciones</a>
                &bull;
                <a href="{{ config('app.frontend_url') }}/politicas-privacidad">Políticas de privacidad</a>
                &bull;
                <a href="{{ config('app.frontend_url') }}/bases-atrevia">Bases legales</a>
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