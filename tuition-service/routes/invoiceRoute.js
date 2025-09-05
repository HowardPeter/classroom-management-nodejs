import express from 'express'
import { getInvoices, getInvoice, getOverdueInvoice, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoiceController.js'

const router = express.Router();

router
  .route('/')
  .get(getInvoices)
  .post(createInvoice)

router
  .route('/:id')
  .get(getInvoice)
  .patch(updateInvoice)
  .delete(deleteInvoice)

router.get('/overdue', getOverdueInvoice)

export default router;