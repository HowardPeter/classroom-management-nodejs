import { asyncWrapper } from "#shared/middlewares/index.js"
import { paginate, getBearer } from '#shared/utils/index.js'
import { NotFoundError, BadRequestError, ConflictError } from "#shared/errors/errors.js"
import InvoiceRepository from '../repositories/invoiceRepository.js'
import { ClassServiceClient, StudentServiceClient } from '../api/index.js'

// Tìm invoice trong class theo class id và filter (nếu có)
export const getInvoices = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, orderBy = { created_at: "asc" }, class_id: classId, ...filter } = req.query;

  if (!classId) throw new BadRequestError("Class Id is required!");

  if (filter.status) filter.status = filter.status.toUpperCase();

  // Kiểm tra class tồn tại
  const token = getBearer(req);
  await ClassServiceClient.getClassById(classId, token);

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

// Tìm 1 invoice trong class
export const getInvoice = asyncWrapper(async (req, res) => {
  const { class_id: classId } = req.query;
  if (!classId) throw new BadRequestError("Class Id is required!");

  // Kiểm tra class tồn tại
  const token = getBearer(req);
  await ClassServiceClient.getClassById(classId, token);

  const { id: invoiceId } = req.params;
  const invoice = await InvoiceRepository.findById(invoiceId);

  if (!invoice)
    return res.status(404).json({
      success: false,
      msg: "Invoice not found!"
    })

  res.status(200).json({
    success: true,
    data: invoice
  });
})

// Tạo invoice mới
export const createInvoice = asyncWrapper(async (req, res) => {
  const invoiceData = req.body;

  if (invoiceData.due_date) invoiceData.due_date = new Date(invoiceData.due_date);

  const classId = req.query.class_id || req.body.class_id;
  if (!classId) throw new BadRequestError("Class Id is required!");

  // Kiểm tra class tồn tại
  const token = getBearer(req);
  await ClassServiceClient.getClassById(classId, token);

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

// Cập nhật invoice
export const updateInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;

  const isInvoiceExist = await InvoiceRepository.findById(invoiceId);
  if (!isInvoiceExist)
    return res.status(404).json({
      success: false,
      msg: "Invoice not found!"
    })

  const updateData = req.body;

  if (!updateData || Object.keys(updateData).length === 0)
    throw new BadRequestError("No update data provided!");

  const updatedInvoice = await InvoiceRepository.updateById(invoiceId, updateData);

  res.status(200).json({
    success: true,
    data: updatedInvoice
  });
})

// Hủy invoice (không xóa mà chỉ update status = CANCELLED)
export const cancelInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;

  const invoice = await InvoiceRepository.findById(invoiceId);
  if (!invoice) {
    return res.status(404).json({
      success: false,
      msg: "Invoice not found!"
    });
  }

  // Nếu invoice đã trả đủ thì không cho hủy
  if (invoice.status === "PAID") {
    return res.status(400).json({
      success: false,
      msg: "Cannot cancel an invoice that is fully paid!"
    });
  }

  const cancelledInvoice = await InvoiceRepository.updateById(invoiceId, {
    status: "CANCELLED"
  });

  res.status(200).json({
    success: true,
    msg: "Invoice cancelled successfully",
    data: cancelledInvoice
  });
});

// Xóa invoice (chỉ dành cho môi trường dev)
export const deleteInvoice = asyncWrapper(async (req, res) => {
  const { id: invoiceId } = req.params;

  const isInvoiceExist = await InvoiceRepository.findById(invoiceId);
  if (!isInvoiceExist)
    return res.status(404).json({
      success: false,
      msg: "Invoice not found!"
    })

  // Xóa invoice và payments (prisma 'onDelete: Cascade')
  await InvoiceRepository.deleteById(invoiceId);

  res.status(200).json({
    success: true,
    msg: "Invoice and its recorded payments delete successfully"
  });
})