import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI

    if (!uri) {
      throw new Error('La variable MONGODB_URI no está definida en el archivo .env')
    }

    await mongoose.connect(uri)
    console.log('MongoDB conectada correctamente')
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message)
    process.exit(1)
  }
}