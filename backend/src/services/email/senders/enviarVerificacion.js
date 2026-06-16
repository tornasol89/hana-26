import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Remitente. En desarrollo, sin dominio verificado, Resend solo permite
// 'onboarding@resend.dev' y solo entrega a TU propia casilla.
// En producción, configurar dominio y usar algo como 'Hana <hola@hana.cl>'.
const FROM = process.env.EMAIL_FROM || 'Hana <onboarding@resend.dev>'

/**
 * Envía el email de verificación con el link de activación.
 * NO lanza excepción: devuelve { ok, error } para que el caller decida.
 *
 * @param {{ email: string, nombre: string, token: string }} params
 * @returns {Promise<{ ok: boolean, id?: string, error?: any }>}
 */
export async function enviarVerificacion({ email, nombre, token }) {
  try {
    const base = process.env.FRONTEND_URL || 'http://localhost:5173'
    const link = `${base}/verificar-email?token=${token}`

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Verificá tu email · Hana',
      html: plantilla({ nombre, link }),
    })

    if (error) return { ok: false, error }
    return { ok: true, id: data?.id }
  } catch (error) {
    return { ok: false, error }
  }
}

function plantilla({ nombre, link }) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1f2937;">
    <h1 style="font-size:22px;margin:0 0 16px;">Hola ${nombre} 👋</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
      Gracias por sumarte a <strong>Hana</strong>. Para activar tu cuenta,
      confirmá tu email haciendo clic en el botón. El link vence en 24 horas.
    </p>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${link}"
         style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;
                font-weight:600;font-size:15px;padding:12px 28px;border-radius:10px;">
        Verificar mi email
      </a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 8px;">
      Si el botón no funciona, copiá y pegá este enlace en tu navegador:
    </p>
    <p style="font-size:13px;word-break:break-all;color:#7c3aed;margin:0 0 24px;">${link}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:12px;color:#9ca3af;margin:0;">
      Si no creaste una cuenta en Hana, podés ignorar este correo.
    </p>
  </div>`
}