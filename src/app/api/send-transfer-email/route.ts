import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(apiKey);
}

interface TransferEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  amount: number;
  description?: string;
  transactionId: string;
  date: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'USD' }).format(n);
}

function buildEmailHtml(payload: TransferEmailPayload): string {
  const { recipientName, senderName, amount, description, transactionId, date } = payload;
  const formattedAmount = formatCurrency(amount);
  const formattedDate = new Date(date).toLocaleDateString('es-HN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const greeting = recipientName ? recipientName : 'Estimado/a cliente';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transferencia Recibida - ProFinance</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 16px;margin-bottom:20px;">
                <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Pro<span style="color:#60a5fa;">Finance</span></span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.3px;">Transferencia Recibida</h1>
              <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">Has recibido una nueva transferencia en tu cuenta</p>
            </td>
          </tr>

          <!-- Amount highlight -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #a7f3d0;border-radius:12px;padding:24px;display:inline-block;min-width:280px;">
                <p style="margin:0;color:#065f46;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Monto recibido</p>
                <p style="margin:8px 0 0;color:#047857;font-size:36px;font-weight:800;letter-spacing:-1px;">+${formattedAmount}</p>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                Hola <strong>${greeting}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                Te informamos que <strong>${senderName}</strong> te ha enviado una transferencia a tu cuenta ProFinance. Los fondos ya se encuentran disponibles en tu saldo.
              </p>

              <!-- Transaction details -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 16px;color:#0f172a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Detalle de la transaccion</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Remitente</span>
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#0f172a;font-size:14px;">${senderName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Monto</span>
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#047857;font-size:14px;">${formattedAmount}</strong>
                    </td>
                  </tr>
                  ${description ? `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Descripcion</span>
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#0f172a;font-size:14px;">${description}</strong>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="color:#64748b;font-size:13px;">Fecha</span>
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                      <strong style="color:#0f172a;font-size:14px;">${formattedDate}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;">
                      <span style="color:#64748b;font-size:13px;">ID Transaccion</span>
                    </td>
                    <td style="padding:10px 0;text-align:right;">
                      <code style="color:#1e40af;font-size:13px;background:#eff6ff;padding:3px 8px;border-radius:4px;">${transactionId}</code>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Status badge -->
              <div style="text-align:center;margin-bottom:24px;">
                <span style="display:inline-block;background:#dcfce7;color:#166534;font-size:13px;font-weight:600;padding:8px 20px;border-radius:20px;letter-spacing:0.3px;">
                  &#10003; Fondos disponibles en tu cuenta
                </span>
              </div>

              <!-- Security note -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin-bottom:8px;">
                <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                  <strong>&#128274; Nota de seguridad:</strong> ProFinance nunca te pedira tus credenciales por correo. Si no reconoces esta transaccion, contacta soporte inmediatamente.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#0f172a;font-size:14px;font-weight:700;">ProFinance</p>
              <p style="margin:0 0 16px;color:#64748b;font-size:12px;">Tu banco digital de confianza</p>
              <div style="border-top:1px solid #e2e8f0;padding-top:16px;">
                <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                  Este correo fue generado automaticamente. Por favor no respondas a este mensaje.<br/>
                  &copy; ${new Date().getFullYear()} ProFinance. Todos los derechos reservados.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as TransferEmailPayload;

    const { recipientEmail, senderName, amount, transactionId } = payload;

    if (!recipientEmail || !senderName || !amount || !transactionId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos.' },
        { status: 400 },
      );
    }

    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: 'ProFinance <no-reply@mobilpymes.cl>',
      to: [recipientEmail],
      subject: `Has recibido una transferencia de ${formatCurrency(amount)} - ProFinance`,
      html: buildEmailHtml(payload),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error('Send email error:', err);
    return NextResponse.json(
      { error: 'Error al enviar el correo.' },
      { status: 500 },
    );
  }
}
