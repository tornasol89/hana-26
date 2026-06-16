import { Resend } from 'resend'

let client = null

function getClient() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada en .env')
    }
    client = new Resend(process.env.RESEND_API_KEY)
  }
  return client
}

/**
 * Adaptador del provider de email. Interfaz estable independiente del proveedor.
 * Devuelve { ok: boolean, id?: string, error?: string }. Nunca lanza.
 */
export async function enviar({ from, to, subject, html }) {
  try {
    const { data, error } = await getClient().emails.send({ from, to, subject, html })

    if (error) {
      console.error('[email/provider] Error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data.id }
  } catch (err) {
    console.error('[email/provider] Excepción:', err.message)
    return { ok: false, error: err.message }
  }
}