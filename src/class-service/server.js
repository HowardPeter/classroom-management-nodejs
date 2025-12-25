import express from 'express'
import cookieParser from "cookie-parser"
import serverless from 'serverless-http'

import { classRouter, enrollmentRouter, userClassRouter } from './routes/index.js';
import { authentication, errorHandler, routeNotFound, pinoLogger } from '#shared/middlewares/index.js';
import { SecretService } from "#shared/utils/index.js"

await SecretService.setDatabaseUrl(process.env.SERVICE_SECRET_NAME);

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(cookieParser());
app.use(pinoLogger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(authentication);

app.use('/classes', classRouter);
app.use('/classes', enrollmentRouter);
app.use('/classes', userClassRouter);

app.use(routeNotFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export const handler = serverless(app);