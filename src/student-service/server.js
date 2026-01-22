import express from 'express'
import serverless from 'serverless-http'
import cookieParser from "cookie-parser";

import router from './routes/studentRoutes.js'
import { authentication, errorHandler, routeNotFound, pinoLogger } from '#shared/middlewares/index.js'

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cookieParser());
app.use(pinoLogger);

app.get('/students/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(authentication);

app.use('/students', router);

app.use(routeNotFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export const handler = serverless(app);