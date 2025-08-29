import axios from "axios";

const URL = "http://localhost:3001"

class UserServiceClient {
  constructor(baseURL) {
    this.api = axios.create({ baseURL });
  }
}

export default UserServiceClient(URL);