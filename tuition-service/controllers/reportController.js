import { asyncWrapper } from "#shared/middlewares/index.js"
import { BadRequestError } from "#shared/errors/errors.js"
import { getBearer } from '#shared/utils/index.js'
import { ClassServiceClient, StudentServiceClient } from '../api/index.js'
import InvoiceRepository from "../repositories/invoiceRepository.js"

// GET /tuition/reports/class/:classId?month=YYYY-MM
// Tạo báo cáo thu chi theo tháng của class
export const getClassMonthlyTuitionReport = asyncWrapper(async (req, res) => {
  const { month } = req.query;
  if (!month) throw new BadRequestError("Month is required (format: YYYY-MM)");

  const classId = req.params.classId;

  // Kiểm tra class tồn tại
  const token = getBearer(req);
  await ClassServiceClient.getClassById(classId, token);

  // Parse YYYY-MM và lấy các invoice trong tháng của class
  const [year, monthNum] = month.split("-");
  const monthInvoices = await InvoiceRepository.findByMonth(classId, year, monthNum);

  let expectedTotal = 0;
  let paidTotal = 0;
  let overdueDebt = 0;
  let upcomingDebt = 0;
  let studentReport = {};

  monthInvoices.forEach(inv => {
    const required = Number(inv.required_amount);
    const paid = inv.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const debt = Math.max(required - paid, 0);

    expectedTotal += required;
    paidTotal += paid;

    if (!studentReport[inv.student_id]) {
      studentReport[inv.student_id] = {
        expected: 0,
        paid: 0,
        unpaid: 0,
        overdue: 0,
        upcoming: 0
      };
    }

    studentReport[inv.student_id].expected += required;
    studentReport[inv.student_id].paid += paid;
    studentReport[inv.student_id].unpaid += debt;

    if (debt > 0) {
      if (inv.due_date && inv.due_date < new Date()) {
        // quá hạn
        studentReport[inv.student_id].overdue += debt;
        overdueDebt += debt;
      } else {
        // chưa đến hạn
        studentReport[inv.student_id].upcoming += debt;
        upcomingDebt += debt;
      }
    }
  });

  const unpaidTotal = Math.max(expectedTotal - paidTotal, 0);

  res.status(200).json({
    class_id: classId,
    month,
    summary: {
      total_expected: expectedTotal,
      total_paid: paidTotal,
      total_unpaid: unpaidTotal,
      unpaid_detail: {
        overdue_debt: overdueDebt,
        upcoming_debt: upcomingDebt
      },
    },
    students: studentReport
  });
})

// GET /tuition/reports/student/:studentId
// Báo cáo chi tiết học phí của 1 học viên
export const getStudentTuitionReport = asyncWrapper(async (req, res) => {
  const studentId = req.params.studentId;

  // Kiểm tra student tồn tại
  const token = getBearer(req);
  const student = await StudentServiceClient.getStudentById(studentId, token);

  const studentInvoices = await InvoiceRepository.findMany({
    student_id: studentId,
    NOT: {
      status: "CANCELLED"
    }
  }, {
    include: { payments: true }
  });

  // Phân loại invoice theo class
  const groupedInvoices = studentInvoices.reduce((groups, invoice) => {
    const key = invoice.class_id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(invoice);
    return groups;
  }, {});

  // Tổng số invoice
  const totalInvoice = studentInvoices.length;

  let expectedTotal = 0;
  let paidTotal = 0;
  let overdueDebt = 0;
  let upcomingDebt = 0;

  studentInvoices.forEach(inv => {
    const required = Number(inv.required_amount);
    const paid = inv.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const debt = Math.max(required - paid, 0);

    expectedTotal += required;
    paidTotal += paid;

    if (debt > 0) {
      if (inv.due_date && inv.due_date < new Date) {
        overdueDebt += debt;
      } else {
        upcomingDebt += debt;
      }
    }
  })

  const unpaidTotal = Math.max(expectedTotal - paidTotal, 0);

  res.status(200).json({
    student,
    summary: {
      total_invoice: totalInvoice,
      total_expected: expectedTotal,
      total_paid: paidTotal,
      total_unpaid: unpaidTotal,
      unpaid_detail: {
        overdue_debt: overdueDebt,
        upcoming_debt: upcomingDebt
      },
    },
    invoices: groupedInvoices
  })
})