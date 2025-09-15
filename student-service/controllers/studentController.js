import StudentRepository from "../repositories/studentRepository.js";
import { asyncWrapper } from "#shared/middlewares/index.js"
import { paginate } from '#shared/utils/index.js'
import { NotFoundError, BadRequestError, ConflictError } from "#shared/errors/errors.js";
import { normalizeFilter } from "../utils/index.js";

export const getStudents = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, orderBy, ...rawFilters } = req.query;

  const filters = normalizeFilter(rawFilters);

  const result = await paginate(StudentRepository, {
    page: Number(page),
    limit: Number(limit),
    where: filters,
    orderBy: orderBy ? JSON.parse(orderBy) : { full_name: "asc" },
  });

  res.status(200).json({
    success: true,
    ...result,
  });
})

export const getStudent = asyncWrapper(async (req, res) => {
  const studentId = req.params.id;

  const student = await StudentRepository.findById(studentId);
  if (!student) throw new NotFoundError("Student not found!");

  res.status(200).json({
    success: true,
    data: student
  });
})

export const getStudentByIds = asyncWrapper(async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",").filter(id => id.trim() !== "") : [];

  if (!ids || ids.length === 0) throw new BadRequestError("Missing required ids!");

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
    return res.status(201).json({
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

  const updateData = { ...req.body };

  if (updateData.date_of_birth) updateData.date_of_birth = new Date(updateData.date_of_birth);
  if (updateData.enrollment_date) updateData.enrollment_date = new Date(updateData.enrollment_date);

  const student = await StudentRepository.findById(studentId);
  if (!student) throw new NotFoundError("Student not found!");

  if (!updateData || Object.keys(updateData).length === 0)
    throw new BadRequestError("No update data provided!");

  try {
    const result = await StudentRepository.updateById(studentId, updateData);

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new ConflictError("Phone or email already exists!");
    }
    throw err;
  }
})

export const deleteStudent = asyncWrapper(async (req, res) => {
  const studentId = req.params.id;

  const student = await StudentRepository.findById(studentId);
  if (!student) throw new NotFoundError("Student not found!");

  await StudentRepository.deleteById(studentId);

  res.status(200).json({
    success: true,
    msg: "Deleting student successfully"
  });
})

// export const deleteStudents = asyncWrapper(async (req, res) => {
//   const ids = req.query.ids ? req.query.ids.split(",") : [];

//   if (!ids || ids.length === 0) throw new BadRequestError("Missing required ids!");

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