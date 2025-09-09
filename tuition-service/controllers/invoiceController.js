import { asyncWrapper } from "#shared/middlewares/index.js"
import { paginate, getBearer } from '#shared/utils/index.js'
import { NotFoundError, BadRequestError, ConflictError } from "#shared/errors/errors.js"
import InvoiceRepository from '../repositories/invoiceRepository.js'
import { ClassServiceClient, StudentServiceClient } from '../api/index.js'
import { normalizeFilter } from '../utils/index.js'

// GET /tuition/invoices/?class_id=xxx
// Tìm invoice trong class theo class id và filter (nếu có)
export const getInvoices = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, orderBy = { created_at: "asc" }, class_id: classId, ...rawFilter } = req.query;

  if (!classId) throw new BadRequestError("Class Id is required!");

  const filter = normalizeFilter(rawFilter);

  const invoices = await paginate(InvoiceRepository, ({
    page: Number(page),
    limit: Number(limit),
    where: {
      class_id: classId,
      ...filter
    },
    orderBy: orderBy
  }));

  res.status(200).json({
    success: true,
    ...invoices
  });
})

// GET /tuition/invoices/:id?class_id=xxx
// Tìm 1 invoice trong class
export const getInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;
  const invoice = await InvoiceRepository.findById(invoiceId);

  if (!invoice) throw new NotFoundError("Invoice not found!");

  res.status(200).json({
    success: true,
    data: invoice
  });
})

// POST /tuition/invoices/?class_id=xxx
// Tạo invoice mới
export const createInvoice = asyncWrapper(async (req, res) => {
  const invoiceData = req.body;

  if (invoiceData.due_date) invoiceData.due_date = new Date(invoiceData.due_date);
  if (invoiceData.status) invoiceData.status = invoiceData.status.toUpperCase();

  // Kiểm tra student tồn tại
  await StudentServiceClient.getStudentById(invoiceData.student_id, token);

  // Gán class_id vào data
  invoiceData.class_id = classId;

  const newInvoice = await InvoiceRepository.createOne(invoiceData);

  res.status(201).json({
    success: true,
    data: newInvoice
  });
})

// PATCH /tuition/invoices/:id?class_id=xxx
// Cập nhật invoice
export const updateInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;

  const isInvoiceExist = await InvoiceRepository.findById(invoiceId);
  if (!isInvoiceExist) throw new NotFoundError("Invoice not found!");

  const updateData = req.body;

  if (updateData.due_date) updateData.due_date = new Date(updateData.due_date);
  if (updateData.status) updateData.status = updateData.status.toUpperCase();

  if (!updateData || Object.keys(updateData).length === 0)
    throw new BadRequestError("No update data provided!");

  const updatedInvoice = await InvoiceRepository.updateById(invoiceId, updateData);

  res.status(200).json({
    success: true,
    data: updatedInvoice
  });
})

// PATCH /tuition/invoices/:id/cancel?class_id=xxx
// Hủy invoice (không xóa mà chỉ update status = CANCELLED)
export const cancelInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;

  const invoice = await InvoiceRepository.findById(invoiceId);
  if (!invoice) throw new NotFoundError("Invoice not found!");

  // Nếu invoice đã trả đủ thì không cho hủy
  if (invoice.status === "PAID") throw new ConflictError("Cannot cancel an invoice that is fully paid!");

  const cancelledInvoice = await InvoiceRepository.updateById(invoiceId, {
    status: "CANCELLED"
  });

  res.status(200).json({
    success: true,
    msg: "Invoice cancelled successfully",
    data: cancelledInvoice
  });
});

// DELETE /tuition/invoices/:id?class_id=xxx
// Xóa invoice (chỉ dành cho môi trường dev)
export const deleteInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;

  const isInvoiceExist = await InvoiceRepository.findById(invoiceId);
  if (!isInvoiceExist) throw new NotFoundError("Invoice not found!");

  // Xóa invoice và payments (prisma 'onDelete: Cascade')
  await InvoiceRepository.deleteById(invoiceId);

  res.status(200).json({
    success: true,
    msg: "Invoice and its recorded payments delete successfully"
  });
})