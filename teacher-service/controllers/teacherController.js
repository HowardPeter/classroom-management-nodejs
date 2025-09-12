import crypto from 'crypto'
import sharp from 'sharp'
import TeacherRepository from '../repositories/teacherRepository.js'
import { asyncWrapper } from "#shared/middlewares/index.js"
import { paginate } from '#shared/utils/index.js'
import { NotFoundError, BadRequestError, ConflictError } from "#shared/errors/errors.js"
import { normalizeFilter, S3Service } from '../utils/index.js'

const generateImageName = () => crypto.randomBytes(32).toString('hex');
const resharpImage = async (file) => {
  return await sharp(file.buffer)
    .resize({ width: 512, height: 512, fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer()
}

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

  result.data = await Promise.all(
    result.data.map(async (record) => {
      if (record.avatar_url) {
        record.avatar_signed_url = await S3Service.getObjectSignedUrl(record.avatar_url);
      }
      return record;
    })
  );

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

  if (teacher.avatar_url)
    teacher.avatar_signed_url = await S3Service.getObjectSignedUrl(teacher.avatar_url);

  res.status(200).json({
    success: true,
    data: teacher,
  });
});

// POST /teachers
// Tạo teacher mới
export const createTeacher = asyncWrapper(async (req, res) => {
  const newTeacherData = { ...req.body };
  const avatar = req.file;

  // Upload ảnh lên S3
  if (avatar) {
    const imageName = generateImageName();
    const fileBuffer = await resharpImage(avatar);

    await S3Service.uploadFile(fileBuffer, imageName, avatar.mimetype);
    newTeacherData.avatar_url = imageName;
  }

  try {
    const result = await TeacherRepository.createOne(newTeacherData);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    if (avatar)
      await S3Service.deleteFile(newTeacherData.avatar_url);

    if (err.code === "P2002") throw new ConflictError("Phone or email already exists!");
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

  if (!updateData || Object.keys(updateData).length === 0)
    throw new BadRequestError("No update data provided!");

  const avatar = req.file;

  // Upload ảnh lên S3
  if (avatar) {
    const imageName = generateImageName();
    const fileBuffer = await resharpImage(avatar);

    await S3Service.uploadFile(fileBuffer, imageName, avatar.mimetype);
    updateData.avatar_url = imageName;

    if (teacher.avatar_url) {
      await S3Service.deleteFile(teacher.avatar_url);
    }
  }

  try {
    const result = await TeacherRepository.updateById(teacherId, updateData);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    if (avatar)
      await S3Service.deleteFile(updateData.avatar_url);

    if (err.code === "P2002") throw new ConflictError("Phone or email already exists!");
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

  if (teacher.avatar_url)
    await S3Service.deleteFile(teacher.avatar_url);

  res.status(200).json({
    success: true,
    msg: "Deleting teacher successfully",
  });
});