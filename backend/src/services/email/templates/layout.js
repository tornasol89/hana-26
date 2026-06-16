const COLORES = {
  primario: '#7c3aed',
  acento: '#be123c',
  texto: '#1a1a1a',
  textoSecundario: '#4a4a4a',
  textoSutil: '#9a9a9a',
  fondo: '#f7f5fa',
  borde: '#ececec',
}

/**
 * Wrapper HTML compartido por todos los emails de Hana.
 * Recibe contenido como string HTML y devuelve el email completo.
 */
export function layout({ titulo, contenido }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${titulo}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${COLORES.fondo}; margin: 0; padding: 40px 20px;">
  <table cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 560px; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <tr>
      <td>
        <h1 style="color: ${COLORES.primario}; font-size: 28px; margin: 0 0 24px;">Hana</h1>
        ${contenido}
        <hr style="border: none; border-top: 1px solid ${COLORES.borde}; margin: 32px 0;" />
        <p style="color: ${COLORES.textoSutil}; font-size: 12px; line-height: 1.5; margin: 0;">
          Hana — hecho por mujeres, para mujeres · Santiago, Chile
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Botón CTA reutilizable con el gradiente de marca.
 */
export function botonCTA({ texto, href }) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
    <tr>
      <td style="background: linear-gradient(135deg, ${COLORES.primario}, ${COLORES.acento}); border-radius: 12px;">
        <a href="${href}" style="display: inline-block; padding: 14px 32px; color: white; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${texto}
        </a>
      </td>
    </tr>
  </table>`
}

export { COLORES }