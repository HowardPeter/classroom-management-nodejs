import express from 'express';
import morgan from 'morgan';
import cookieParser from "cookie-parser";

import { invoiceRouter, paymentRouter, reportRouter } from './routes/index.js';
import { checkClassExist } from './middlewares/index.js';
import { authentication, errorHandler, routeNotFound } from '#shared/middlewares/index.js';

const app = express();
const PORT = 3004;

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(authentication);

app.use('/tuition/invoices', checkClassExist, invoiceRouter);
app.use('/tuition/payments', checkClassExist, paymentRouter);
app.use('/tuition/reports', reportRouter);

app.use(routeNotFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});