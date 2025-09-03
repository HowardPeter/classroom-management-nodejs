import express from 'express'
import morgan from 'morgan';
import cookieParser from "cookie-parser";

import router from './routes/studentRoutes.js'
import { errorHandler } from '#shared/middlewares/error-handler.js'
import authentication from './middleware/authentication.js'

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(authentication);

app.use('/students', router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});