import express from 'express'
import serverless from 'serverless-http'
import cookieParser from "cookie-parser"

import { teacherRouter } from './routes/index.js'
import { authentication, errorHandler, routeNotFound, pinoLogger } from '#shared/middlewares/index.js'

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(cookieParser());
app.use(pinoLogger);

app.get('/teachers/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(authentication);

app.use('/teachers', teacherRouter);

app.use(routeNotFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export const handler = serverless(app);