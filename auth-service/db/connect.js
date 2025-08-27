import mongoose from "mongoose"
import { InternalServerError } from "../errors/errors.js";

const MONGO_URL = "mongodb://admin:secret@localhost:27017/mongodb?authSource=admin"

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