import mongoose from "mongoose"
import { InternalServerError } from "#shared/errors/errors.js";
import dotenv from 'dotenv'

dotenv.config();

const MONGO_URL=`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}?authSource=admin`

class DbConnect {
  static instance = null;
  static connecting = null;

  static async getInstance() {
    if (DbConnect.instance) return DbConnect.instance;

    if (!DbConnect.connecting) {
      DbConnect.connecting = mongoose.connect(MONGO_URL)
        .then((conn) => {
          DbConnect.instance = conn;
          console.log("Mongodb connected successfully")
          return conn;
        })
        .catch(err => {
          DbConnect.connecting = null;
          throw new InternalServerError(err.message);
        })
    }

    return DbConnect.connecting;
  }
}

export default DbConnect;