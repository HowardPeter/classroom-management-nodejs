import express from 'express'
import { deletePayment } from '../controllers/paymentController.js'
import { validate } from '../middlewares/index.js'

const router = express.Router();

router
  .route('/:paymentId')
  .delete(deletePayment)

export default router;