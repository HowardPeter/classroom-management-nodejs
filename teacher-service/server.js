import express from 'express'
import morgan from 'morgan';
import cookieParser from "cookie-parser";

import { teacherRouter } from './routes/index.js'
import { authentication, errorHandler, routeNotFound } from '#shared/middlewares/index.js'

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(authentication);

app.use('/teachers', teacherRouter);

app.use(routeNotFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});