import asyncWrapper from "../middleware/assync-wrapper.js";
import StudentRepository from "../repositories/studentRepository.js";
import paginate from '../utils/pagination.js'
import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js";

export const getStudents = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;

  const result = await paginate(StudentRepository, {
    page: Number(page),
    limit: Number(limit),
    where: filters,
    orderBy: { full_name: "asc" },
  });

  res.status(200).json({
    success: true,
    ...result,
  });
})

export const getStudent = asyncWrapper(async (req, res) => {
  const studentId = req.params.id;

  const student = await StudentRepository.findById(studentId);
  if (!student)
    return res.status(404).json({
      success: false,
      msg: "Student not found!"
    });

  res.status(200).json({
    success: true,
    data: student
  });
})

export const getStudentByIds = asyncWrapper(async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",").filter(id => id.trim() !== "") : [];

  if (!ids || ids.length === 0)
    return res.status(400).json({
      success: false,
      msg: "Missing ids"
    });

  const { page = 1, limit = 10 } = req.query;

  const students = await paginate(StudentRepository, {
    page: Number(page),
    limit: Number(limit),
    where: { student_id: { in: ids } },
    orderBy: { full_name: "asc" },
  })

  res.status(200).json({
    success: true,
    data: students,
  });
})

export const createStudent = asyncWrapper(async (req, res) => {
  let newStudentData = { ...req.body };

  if (!newStudentData.full_name) throw new BadRequestError("Full name is required!");

  if (newStudentData.date_of_birth) newStudentData.date_of_birth = new Date(newStudentData.date_of_birth);
  if (newStudentData.enrollment_date) newStudentData.enrollment_date = new Date(newStudentData.enrollment_date);

  try {
    const result = await StudentRepository.createOne(newStudentData);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    // Map Prisma unique constraint error
    if (err.code === "P2002") {
      throw new ConflictError("Phone or email already exists!");
    }
    throw err;
  }
})

export const updateStudent = asyncWrapper(async (req, res) => {
  const studentId = req.params.id;

  let updateData = { ...req.body };

  if (updateData.date_of_birth) updateData.date_of_birth = new Date(updateData.date_of_birth);
  if (updateData.enrollment_date) updateData.enrollment_date = new Date(updateData.enrollment_date);

  const student = await StudentRepository.findById(studentId);
  if (!student)
    return res.status(404).json({
      success: false,
      msg: "Cannot update. Student not found!"
    });

  const result = await StudentRepository.updateById(studentId, updateData);

  res.status(201).json({
    success: true,
    data: result
  });
})

export const deleteStudent = asyncWrapper(async (req, res) => {
  const studentId = req.params.id;

  const student = await StudentRepository.findById(studentId);
  if (!student)
    return res.status(404).json({
      success: false,
      msg: "Cannot delete. Student not found!"
    });

  await StudentRepository.deleteById(studentId);

  res.status(200).json({
    success: true,
    msg: "Deleting student successfully"
  });
})

// export const deleteStudents = asyncWrapper(async (req, res) => {
//   const ids = req.query.ids ? req.query.ids.split(",") : [];

//   if (!ids || ids.length === 0)
//     return res.status(400).json({
//       success: false,
//       msg: "Missing ids"
//     });

//   const existingStudents = await StudentRepository.findManyByIds(ids);

//   const existingIds = existingStudents.map(s => s.student_id);

//   // Các id không tồn tại
//   const notFoundIds = ids.filter(id => !existingIds.includes(id));

//   // Xóa những student có tồn tại
//   if (existingIds.length > 0) {
//     await StudentRepository.deleteMany(existingIds);
//   }

//   res.status(200).json({
//     success: true,
//     msg: "Deleting students completed",
//     deletedCount: existingIds.length,
//     notFound: notFoundIds
//   });
// })