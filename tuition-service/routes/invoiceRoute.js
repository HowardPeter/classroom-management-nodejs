import express from 'express'
import { getInvoices, getInvoice, createInvoice, updateInvoice, cancelInvoice, deleteInvoice } from '../controllers/invoiceController.js'
import { validate } from '../middlewares/index.js'

const router = express.Router();

router
  .route('/')
  .get(getInvoices)
  .post(validate("invoice"), createInvoice)

router
  .route('/:id')
  .get(getInvoice)
  .patch(validate("invoice"), updateInvoice)
  .delete(deleteInvoice)

router.patch(':id/cancel', validate("invoice"), cancelInvoice)

export default router;