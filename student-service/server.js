import express from 'express'
import morgan from 'morgan';
import cookieParser from "cookie-parser";

import router from './routes/studentRoutes.js'
import { errorHandler } from './middleware/error-handler.js'

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/student', router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});