import express from 'express'
import serverless from 'serverless-http'
import cookieParser from "cookie-parser"

import router from './routes/authRoutes.js'
import DbConnect from './db/connect.js'
import { errorHandler, routeNotFound, pinoLogger } from '#shared/middlewares/index.js'

const app = express();
const PORT = process.env.PORT || 3001;

await DbConnect.getInstance();

app.use(express.json());
app.use(cookieParser());
app.use(pinoLogger);

app.use('/users', router);

app.use(routeNotFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export const handler = serverless(app);