import express from 'express';
import morgan from 'morgan';
import cookieParser from "cookie-parser";

import { invoiceRouter, paymentRouter, reportRouter } from './routes/index.js';
import { authentication } from './middlewares/index.js';
import { errorHandler } from '#shared/middlewares/index.js';

const app = express();
const PORT = 3004;

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(authentication);

app.use('/tuition/invoices', invoiceRouter);
app.use('/tuition/payments', paymentRouter);
app.use('/tuition/reports/', reportRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});