import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// Leer PORT desde .env
let port = 5000
try {
  const env   = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  const match = env.match(/^PORT\s*=\s*(\d+)/m)
  if (match) port = parseInt(match[1], 10)
} catch { /* .env no existe, usamos 5000 */ }

console.log(`🔍 Liberando puerto ${port} si está ocupado...`)

try {
  const salida = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
  const pids   = [...new Set(
    salida.split('\n')
      .filter(l => l.toUpperCase().includes('LISTENING'))
      .map(l => l.trim().split(/\s+/).pop())
      .filter(p => p && p !== '0')
  )]

  if (pids.length === 0) {
    console.log(`✅ Puerto ${port} ya está libre.`)
  } else {
    for (const pid of pids) {
      try { execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' }) } catch { /* ignore */ }
    }
    console.log(`✅ Puerto ${port} liberado (PID eliminado: ${pids.join(', ')}).`)
  }
} catch {
  // findstr no encontró nada → puerto libre
  console.log(`✅ Puerto ${port} disponible.`)
}
