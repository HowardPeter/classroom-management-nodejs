import express from 'express'
import morgan from 'morgan';
import cookieParser from "cookie-parser";

import router from './routes/classRoutes.js'
import { authentication, errorHandler } from './middleware/index.js'

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(authentication);

app.use('/classes', router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});