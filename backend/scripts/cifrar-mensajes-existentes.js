import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Message from '../src/models/Message.js'
import { cifrar, pareceCifrado } from '../src/utils/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const APLICAR = process.argv.includes('--apply')

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const docs = await Message.find({}).select('_id texto').lean()

  let porCifrar = 0
  for (const d of docs) {
    if (pareceCifrado(d.texto)) continue
    porCifrar++
    if (APLICAR) {
      await Message.updateOne({ _id: d._id }, { $set: { texto: cifrar(d.texto) } })
    }
  }

  console.log(`Total: ${docs.length} | Ya cifrados: ${docs.length - porCifrar} | ${APLICAR ? 'Cifrados ahora' : 'Se cifrarían'}: ${porCifrar}`)
  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })