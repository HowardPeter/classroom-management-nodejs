import { asyncWrapper } from "#shared/middlewares/index.js"
import { NotFoundError, ConflictError } from "#shared/errors/errors.js"
import PaymentRepository from '../repositories/paymentRepository.js'
import InvoiceRepository from "../repositories/invoiceRepository.js"

const setInvoiceStatus = async (invoice) => {
  const totalPaid = await PaymentRepository.sumByInvoice(invoice.invoice_id);

  let newStatus = "PARTIAL";
  if (totalPaid >= Number(invoice.required_amount)) {
    newStatus = "PAID";
  } else if (totalPaid < Number(invoice.required_amount) && invoice.due_date && invoice.due_date < new Date()) {
    newStatus = "OVERDUE";
  } else if (totalPaid === 0) {
    newStatus = "PENDING";
  }

  return newStatus;
};

// Hàm cập nhật invoice status
const updateInvoiceStatus = asyncWrapper(async (invoiceId) => {
  const invoice = await InvoiceRepository.findById(invoiceId);

  const newStatus = await setInvoiceStatus(invoice);
  await InvoiceRepository.updateById(invoiceId, { status: newStatus });

  return newStatus;
});

// GET /tuition/invoices/:id/payments
// Lấy danh sách payment của 1 invoice
export const getPaymentsByInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;

  const invoice = await InvoiceRepository.findById(invoiceId);
  if (!invoice) throw new NotFoundError("Invoice not found!");

  const payments = await PaymentRepository.findManyByInvoice(invoiceId);

  res.status(200).json({
    success: true,
    data: payments,
  });
});

// POST /tuition/invoices/:id/payments
// Tạo payment mới cho 1 invoice
export const createPayment = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;
  const paymentData = req.body;

  if (paymentData.paid_at) paymentData.paid_at = new Date(paymentData.paid_at);
  if (paymentData.method) paymentData.method = paymentData.method.toUpperCase();

  // kiểm tra invoice tồn tại
  const invoice = await InvoiceRepository.findOne({ invoice_id: invoiceId });
  if (!invoice) throw new NotFoundError("Invoice not found!");

  // Trả về nếu invoice đã PAID
  if (invoice.status === "PAID") throw new ConflictError("Invoice is already fully paid!");

  const newPayment = await PaymentRepository.createOne({
    invoice_id: invoiceId,
    ...paymentData
  });

  // Cập nhật invoice status
  await updateInvoiceStatus(invoiceId);

  res.status(201).json({
    success: true,
    data: newPayment,
  });
});

// DELETE /tuition/payments/:paymentId
// Xóa 1 payment
export const deletePayment = asyncWrapper(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await PaymentRepository.findOne({ payment_id: paymentId });
  if (!payment) throw new NotFoundError("Payment not found!");

  const invoiceId = payment.invoice_id;

  await PaymentRepository.deleteById(paymentId);
  await updateInvoiceStatus(invoiceId); // Cập nhật invoice status

  res.status(200).json({
    success: true,
    msg: "Payment deleted successfully",
  });
});