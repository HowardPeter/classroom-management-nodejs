import mongoose from "mongoose"
import { InternalServerError } from "#shared/errors/errors.js";
import { SecretService } from "#shared/utils/index.js"

const secret = await SecretService.getSecret("prod/cr-user-sv");

const MONGO_USERNAME = secret.MONGO_USERNAME || process.env.MONGO_USERNAME;
const MONGO_PASSWORD = secret.MONGO_PASSWORD || process.env.MONGO_PASSWORD;
const MONGO_HOST = secret.MONGO_HOST || process.env.MONGO_HOST;
const MONGO_DB = secret.MONGO_DB || process.env.MONGO_DB;

const MONGO_URL = process.env.NODE_ENV === "production" ?
  `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/${MONGO_DB}?retryWrites=true&w=majority`
  :
  `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DB}?authSource=admin`

class DbConnect {
  static instance = null;
  static connecting = null;

  static async getInstance() {
    if (DbConnect.instance) return DbConnect.instance;

    if (!DbConnect.connecting) {
      DbConnect.connecting = mongoose.connect(MONGO_URL)
        .then((conn) => {
          DbConnect.instance = conn;
          console.log(`Mongodb connected successfully. Mode: ${process.env.NODE_ENV}`)
          return conn;
        })
        .catch(err => {
          DbConnect.connecting = null;
          throw new InternalServerError("MongoDB connection failed: ", err.message);
        })
    }

    return DbConnect.connecting;
  }
}

export default DbConnect;