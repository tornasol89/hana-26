import mongoose from 'mongoose'
import env from './env.js'

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI)
    console.log('MongoDB conectada correctamente')
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message)
    process.exit(1)
  }
}