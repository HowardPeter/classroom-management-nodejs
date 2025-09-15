import express from 'express'
import { getInvoices, getInvoice, createInvoice, updateInvoice, cancelInvoice, deleteInvoice } from '../controllers/invoiceController.js'
import { getPaymentsByInvoice, createPayment } from '../controllers/paymentController.js'
import { validate, authorize } from '../middlewares/index.js'

const router = express.Router();

router
  .route('/')
  .get(getInvoices)
  .post(authorize("owner", "manager"), validate("invoice"), createInvoice)

router
  .route('/:id')
  .get(getInvoice)
  .patch(authorize("owner", "manager"), validate("invoice"), updateInvoice)
  .delete(authorize("owner", "manager"), deleteInvoice)

router.patch('/:id/cancel', authorize("owner", "manager"), cancelInvoice)

router
  .route('/:id/payments')
  .get(getPaymentsByInvoice)
  .post(authorize("owner", "manager"), validate("payment"), createPayment)

export default router;