import { layout, botonCTA, COLORES } from './layout.js'

export function plantillaVerificacion({ nombre, link }) {
  const contenido = `
    <p style="color: ${COLORES.texto}; font-size: 18px; margin: 0 0 24px;">
      ¡Hola ${nombre}! 👋
    </p>
    <p style="color: ${COLORES.textoSecundario}; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Bienvenida a Hana. Para terminar de crear tu cuenta y empezar a usar la plataforma,
      confirmá tu email haciendo click en el botón:
    </p>
    ${botonCTA({ texto: 'Confirmar mi email', href: link })}
    <p style="color: #6b6b6b; font-size: 14px; line-height: 1.5; margin: 24px 0 8px;">
      O copiá y pegá este link en tu navegador:
    </p>
    <p style="color: ${COLORES.primario}; font-size: 13px; word-break: break-all; margin: 0 0 16px;">
      ${link}
    </p>
    <p style="color: #6b6b6b; font-size: 13px; line-height: 1.5; margin: 16px 0 0;">
      Este link expira en 24 horas. Si no te registraste en Hana, ignorá este email.
    </p>
  `

  return {
    asunto: 'Confirmá tu email en Hana',
    html: layout({ titulo: 'Confirmá tu email', contenido }),
  }
}