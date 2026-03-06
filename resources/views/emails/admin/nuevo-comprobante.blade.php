<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nuevo comprobante - Atrevia</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background-color: #f3f0ff; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #9968d8 0%, #7f22fe 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 6px; }
        .body { padding: 36px 30px; color: #333333; }
        .body p { line-height: 1.7; font-size: 15px; margin-bottom: 16px; }
        .alert-box { background-color: #f3f0ff; border-left: 4px solid #9968d8; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; }
        .alert-box p { margin: 0; font-size: 14px; color: #9968d8; font-weight: 600; }
        .info-table { width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
        .info-table th { background-color: #9968d8; color: #ffffff; padding: 12px 14px; text-align: left; font-weight: 600; }
        .info-table td { padding: 10px 14px; border-bottom: 1px solid #ede9fe; color: #333; }
        .info-table td:first-child { font-weight: 600; color: #1a0033; width: 40%; }
        .info-table tr:last-child td { border-bottom: none; }
        .badge { display: inline-block; background-color: #fff3cd; color: #856404; border: 1px solid #ffc107; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; }
        .footer { background-color: #1a0033; text-align: center; padding: 24px 30px; }
        .footer p { color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">

        <div class="header">
            <h1>📎 Nuevo comprobante recibido</h1>
            <p>{{ now()->format('d/m/Y H:i') }} hrs</p>
        </div>

        <div class="body">

            <div class="alert-box">
                <p>Un cliente registrado ha subido un nuevo comprobante de pago.</p>
            </div>

            <table class="info-table">
                <thead>
                    <tr>
                        <th colspan="2">Datos del cliente</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Nombre</td>
                        <td>{{ $cliente->nombre }} {{ $cliente->apellidos }}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>{{ $cliente->email }}</td>
                    </tr>
                    <tr>
                        <td>Teléfono</td>
                        <td>{{ $cliente->telefono }}</td>
                    </tr>
                    <tr>
                        <td>Departamento</td>
                        <td>{{ $cliente->departamento }}</td>
                    </tr>
                </tbody>
            </table>

            <table class="info-table">
                <thead>
                    <tr>
                        <th colspan="2">Datos del comprobante</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Boleta ID</td>
                        <td>#{{ $boleta->id }}</td>
                    </tr>
                    <tr>
                        <td>Estado</td>
                        <td><span class="badge">⏳ Pendiente</span></td>
                    </tr>
                    <tr>
                        <td>Archivo</td>
                        <td>{{ basename($boleta->archivo) }}</td>
                    </tr>
                    <tr>
                        <td>Fecha de envío</td>
                        <td>{{ $boleta->created_at->format('d/m/Y H:i') }} hrs</td>
                    </tr>
                </tbody>
            </table>

            <p>Ingresa al panel de administración para revisar el comprobante y procesar las opciones correspondientes.</p>

        </div>

        <div class="footer">
            <p>
                Notificación automática del sistema Atrevia<br>
                &copy; {{ date('Y') }} Atrevia - Agrovet Market. Todos los derechos reservados.
            </p>
        </div>

    </div>
</body>
</html>