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
      msg: "Cannot update. Student not found!"
    });

  res.status(200).json({
    success: true,
    data: student
  });
})

export const createStudent = asyncWrapper(async (req, res) => {
  let newStudentData = { ...req.body };

  if (!newStudentData.full_name) {
    throw new BadRequestError("Full name is required!");
  }

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