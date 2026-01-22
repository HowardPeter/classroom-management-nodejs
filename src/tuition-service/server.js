import express from 'express'
import serverless from 'serverless-http'
import cookieParser from "cookie-parser"

import { invoiceRouter, paymentRouter, reportRouter } from './routes/index.js';
import { checkClassExist } from './middlewares/index.js';
import { authentication, errorHandler, routeNotFound, pinoLogger } from '#shared/middlewares/index.js';

const app = express();
const PORT = 3004;

app.use(express.json());
app.use(cookieParser());
app.use(pinoLogger);

app.get('/tuitions/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(authentication);

app.use('/tuitions/invoices', checkClassExist, invoiceRouter);
app.use('/tuitions/payments', checkClassExist, paymentRouter);
app.use('/tuitions/reports', reportRouter);

app.use(routeNotFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export const handler = serverless(app);