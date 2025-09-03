import express from 'express'
import morgan from 'morgan';
import cookieParser from "cookie-parser"

import router from './routes/authRoutes.js'
import DbConnect from './db/connect.js'
import { errorHandler } from '#shared/middlewares/error-handler.js'

const app = express();
const PORT = 3001;
const connect = await DbConnect.getInstance();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/users', router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});