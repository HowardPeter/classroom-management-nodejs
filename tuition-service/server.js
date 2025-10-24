import express from 'express'
import serverless from 'serverless-http'
import cookieParser from "cookie-parser"

import { invoiceRouter, paymentRouter, reportRouter } from './routes/index.js';
import { checkClassExist } from './middlewares/index.js';
import { authentication, errorHandler, routeNotFound, pinoLogger } from '#shared/middlewares/index.js';
import { SecretService } from "#shared/utils/index.js"

await SecretService.setDatabaseUrl("prod/cr-tuition-sv");

const app = express();
const PORT = 3004;

app.use(express.json());
app.use(cookieParser());
app.use(pinoLogger);

app.use(authentication);

app.use('/tuition/invoices', checkClassExist, invoiceRouter);
app.use('/tuition/payments', checkClassExist, paymentRouter);
app.use('/tuition/reports', reportRouter);

app.use(routeNotFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export const handler = serverless(app);