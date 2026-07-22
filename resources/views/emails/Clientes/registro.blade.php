<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a la campaña Atrevia clientes!</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background-color: #f3f0ff; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header-img { width: 100%; display: block; line-height: 0; }
        .header-img img { width: 100%; display: block; }
        .body { padding: 36px 30px; color: #333333; }
        .body p { line-height: 1.7; font-size: 15px; margin-bottom: 16px; }
        .greeting { font-size: 17px; font-weight: 600; color: #1a0033; }
        .points-section { margin: 24px 0; }
        .points-section h3 { font-size: 15px; color: #1a0033; margin-bottom: 12px; font-weight: 700; }
        .points-table { width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden; }
        .points-table th { background-color: #9968d8; color: #ffffff; padding: 12px 14px; text-align: left; font-weight: 600; }
        .points-table td { padding: 10px 14px; border-bottom: 1px solid #ede9fe; color: #333; }
        .points-table tr:last-child td { border-bottom: none; }
        .points-table .pts { font-weight: 700; color: #9968d8; }
        .dates-section { margin: 30px 0; text-align: center; }
        .dates-section h3 { font-size: 15px; color: #1a0033; margin-bottom: 15px; font-weight: 700; text-align: left; }
        .dates-list { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .date-chip { background: linear-gradient(135deg, #9968d8, #7f22fe); color: #ffffff; border-radius: 20px; padding: 8px 16px; font-size: 12px; font-weight: 600; min-width: 130px; text-align: center; }
        .date-chip span { display: block; font-size: 10px; font-weight: 400; opacity: 0.9; margin-top: 3px; }
        .cta { text-align: center; margin: 30px 0 10px; }
        .cta a { background: linear-gradient(135deg, #9968d8 0%, #7f22fe 100%); color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 700; display: inline-block; border: none; }
        .note-text { text-align: center; font-size: 12px; color: #777; margin-top: 12px; font-style: italic; background-color: #f9f9f9; padding: 8px; border-radius: 20px; }
        .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #856404; }
        .links { text-align: center; margin-top: 25px; font-size: 13px; }
        .links a { color: #9968d8; text-decoration: none; margin: 0 8px; }
        .footer { background-color: #1a0033; text-align: center; padding: 24px 30px; }
        .footer p { color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.8; }
        .footer a { color: #c084fc; text-decoration: none; }
        .additional-link { text-align: center; margin: 5px 0 20px; }
        .additional-link a { color: #9968d8; text-decoration: underline; font-size: 13px; }
        .highlight { font-weight: 700; color: #7f22fe; }
        .success-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 12px 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #155724; }
    </style>
</head>
<body>
    <div class="container">

        <!-- HEADER -->
        <div class="header-img">
            <img src="{{ config('app.url') }}/emails/Mailing_Gracias por registrarte.webp"
                 alt="Destino Chayanne – ¡Gracias por registrarte!">
        </div>

        <!-- BODY -->
        <div class="body">

            <p class="greeting">Hola, {{ $cliente->nombre }} {{ $cliente->apellidos }}</p>

            <p>
                ¡Recibimos tu registro exitosamente! Estamos revisando tu comprobante de pago
                para acreditar tus puntos y que puedas participar en el sorteo.
            </p>

            <!-- CTA BOTÓN -->
            <div class="cta">
                <a href="{{ config('app.frontend_url_cliente') }}/email/verify/{{ $cliente->email_verification_token }}">
                    Verificar mi correo
                </a>
            </div>

            <div class="additional-link">
                <a href="{{ config('app.frontend_url_cliente') }}/email/verify/{{ $cliente->email_verification_token }}">
                    Si el botón no funciona, haz clic aquí para verificar tu correo
                </a>
            </div>

            <!-- CONDICIÓN: FECHA DE COMPROBANTES -->
            <div class="warning-box">
                <strong>📅 Importante:</strong> Solo se considerarán <span class="highlight">comprobantes de pago emitidos a partir del 1 de julio de 2026</span>. Las facturas o boletas con fechas anteriores no serán válidas.
            </div>

            <!-- CÓMO ACUMULAS PUNTOS - CLIENTE FINAL (SIN MENCIONAR S/ 1,000) -->
            <div class="points-section">
                <h3>🎯 ¿Cómo acumulas puntos?</h3>
                
                <div class="success-box">
                    <strong>¡Así de fácil!</strong> Por cada compra de <span class="highlight">cualquier producto Atrevia</span>
                    <br><br>
                    <span style="font-size: 14px; display: block;">
                        ✅ Acumulas puntos con <strong>cada producto</strong> que compres de la línea Atrevia.
                    </span>
                </div>

                <p style="font-size: 14px; font-weight: 600; color: #1a0033; margin: 15px 0 10px;">
                    Productos participantes:
                </p>
                <table class="points-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Atrevia<sup>®</sup> 360</td>
                            <td class="pts">1</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> 360 Spot On</td>
                            <td class="pts">1</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> One</td>
                            <td class="pts">1</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> XR</td>
                            <td class="pts">1</td>
                        </tr>
                        <tr>
                            <td>Atrevia<sup>®</sup> Trio Cats</td>
                            <td class="pts">1</td>
                        </tr>
                    </tbody>
                </table>
                <p class="note-text">
                    * Cada producto Atrevia que compres te da puntos para participar en el sorteo.<br>
                </p>
            </div>

            <!-- FECHAS DE SORTEO -->
            <div class="dates-section">
                <h3>📆 Fechas de sorteo</h3>
                <div class="dates-list">
                    <div class="date-chip">
                        🎯 1er Sorteo: 8 de setiembre 2026
                        <span>2 ganadores</span>
                    </div>
                    <div class="date-chip">
                        🎯 2do Sorteo: 16 de octubre 2026
                        <span>3 ganadores</span>
                    </div>
                </div>
                <p style="font-size: 12px; color: #888; margin-top: 12px; text-align: left;">
                    <strong>Fechas de corte:</strong>
                    <br>• 1er sorteo: comprobantes registrados hasta el 7 de setiembre 2026
                    <br>• 2do sorteo: comprobantes registrados hasta el 15 de octubre 2026
                </p>
            </div>

            <p>
                Te notificaremos por este correo cuando tu comprobante sea aprobado
                y tus puntos sean acreditados. ¡Mucha suerte!
            </p>

            <!-- LINKS -->
            <div class="links">
                <a href="{{ config('app.frontend_url_cliente') }}/portal/terminos-condiciones">Términos y condiciones</a>
                &bull;
                <a href="{{ config('app.frontend_url_cliente') }}/portal/politicas-de-privacidad">Políticas de privacidad</a>
            </div>

        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>
                Este correo fue enviado a <a href="mailto:{{ $cliente->email }}">{{ $cliente->email }}</a><br>
                <strong>Concierto:</strong> 2 de diciembre 2026 · Lima, Perú<br>
                <strong>Contacto:</strong> WhatsApp <a href="https://wa.me/51998162159">998 162 159</a> · <a href="https://atrevia.vet/promo-chayanne/clientes/">atrevia.vet/promo-chayanne/veterinarios</a><br><br>
                &copy; {{ date('Y') }} Atrevia - Agrovet Market. Todos los derechos reservados.
            </p>
        </div>

    </div>
</body>
</html>