import mongoose from "mongoose"
import dotenv from 'dotenv';
dotenv.config();

mongoose.set('strictQuery', false)

const connection = () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    return true
  } catch (error) {
    return false
  }
}

export default connection