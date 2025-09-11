import TeacherRepository from '../repositories/teacherRepository.js'
import { asyncWrapper } from "#shared/middlewares/index.js"
import { paginate } from '#shared/utils/index.js'
import { NotFoundError, BadRequestError, ConflictError } from "#shared/errors/errors.js";
import { normalizeFilter } from '../utils/index.js'

// GET /teachers
// Lấy thông tin teacher theo filter
export const getTeachers = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, orderBy = { full_name: "asc" }, ...rawFilters } = req.query;

  const filters = normalizeFilter(rawFilters);

  const result = await paginate(TeacherRepository, {
    page: Number(page),
    limit: Number(limit),
    where: filters,
    orderBy: orderBy,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

// GET /teachers/:id
// Lấy thông tin 1 teacher
export const getTeacher = asyncWrapper(async (req, res) => {
  const teacherId = req.params.id;

  const teacher = await TeacherRepository.findById(teacherId);
  if (!teacher) throw new NotFoundError("Teacher not found!");

  res.status(200).json({
    success: true,
    data: teacher,
  });
});

// POST /teachers
// Tạo teacher mới
export const createTeacher = asyncWrapper(async (req, res) => {
  const newTeacherData = { ...req.body };

  try {
    const result = await TeacherRepository.createOne(newTeacherData);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new ConflictError("Phone or email already exists!");
    }
    throw err;
  }
});

// PATCH /teachers/:id
// Cập nhật thông tin teacher
export const updateTeacher = asyncWrapper(async (req, res) => {
  const teacherId = req.params.id;

  const updateData = { ...req.body };

  const teacher = await TeacherRepository.findById(teacherId);
  if (!teacher) throw new NotFoundError("Teacher not found!");

  try {
    const result = await TeacherRepository.updateById(teacherId, updateData);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new ConflictError("Phone or email already exists!");
    }
    throw err;
  }
});

// DELETE /teachers/:id
// Xóa 1 teacher
export const deleteTeacher = asyncWrapper(async (req, res) => {
  const teacherId = req.params.id;

  const teacher = await TeacherRepository.findById(teacherId);
  if (!teacher) throw new NotFoundError("Teacher not found!");

  await TeacherRepository.deleteById(teacherId);

  res.status(200).json({
    success: true,
    msg: "Deleting teacher successfully",
  });
});