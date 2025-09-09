import express from 'express'
import { deletePayment } from '../controllers/paymentController.js'
import { authorize } from '../middlewares/index.js'

const router = express.Router();

router.delete('/:paymentId', authorize("owner", "manager"), deletePayment)

export default router;