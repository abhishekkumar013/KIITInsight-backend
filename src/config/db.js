import mongoose from 'mongoose'

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URL)
    console.log(`DATABASE CONNECTED ${connectionInstance.connection.name}`)
  } catch (error) {
    console.log('Error in Db Connection ', error)
  }
}

export default connectDb
