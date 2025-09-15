import ClassRepository from '../repositories/classRepository.js'
import UserClassRepository from '../repositories/userClassRepository.js'
import EnrollmentRepository from '../repositories/enrollmentRepository.js'
import { TeacherServiceClient } from '../api/index.js'
import { asyncWrapper } from "#shared/middlewares/index.js"
import { paginate, getBearer } from '#shared/utils/index.js'
import { NotFoundError } from "#shared/errors/errors.js"

export const getClasses = asyncWrapper(async (req, res) => {
  const userId = req.user.userId;

  if (!userId) throw new NotFoundError("Cannot get user Id!");

  const { page = 1, limit = 10, orderBy } = req.query;

  const classes = await paginate(ClassRepository, {
    page: Number(page),
    limit: Number(limit),
    where: {
      userClasses: {
        some: { user_id: userId }
      }
    },
    orderBy: orderBy ? JSON.parse(orderBy) : { class_name: 'asc' },
    include: {
      userClasses: true,
      _count: {
        select: { enrollments: true }
      }
    }
  });

  res.status(200).json({
    success: true,
    ...classes
  });
})

export const getClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;

  const result = await ClassRepository.findById(classId);
  if (!result) throw new NotFoundError("Class not found. Check the Id again!");

  res.status(200).json({
    success: true,
    data: result
  });
})

export const createNewClass = asyncWrapper(async (req, res) => {
  const newClassData = { ...req.body };

  // Kiểm tra teacher tồn tại
  if (newClassData.teacher_id) {
    const token = getBearer(req);
    await TeacherServiceClient.getTeacherById(newClassData.teacher_id, token);
  }

  const result = await ClassRepository.createOne(newClassData);

  const classId = result.class_id;
  const userId = req.user?.userId;

  if (!userId) throw new NotFoundError("Cannot get user Id!");

  try {
    await UserClassRepository.createOne({
      class_id: classId,
      user_id: userId,
      role: "owner"
    });
  } catch (err) {
    // rollback class nếu lỗi khi insert userClass
    await ClassRepository.deleteById(classId);
    throw err;
  }

  res.status(201).json({
    success: true,
    data: result
  });
})

export const updateClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const updateData = { ...req.body };

  if (!updateData || Object.keys(updateData).length === 0)
    throw new BadRequestError("No update data provided!");

  const isClassExist = await ClassRepository.findById(classId);
  if (!isClassExist) throw new NotFoundError("Class not found. Check the Id again!");

  // Kiểm tra teacher tồn tại
  if (updateData.teacher_id) {
    const token = getBearer(req);
    await TeacherServiceClient.getTeacherById(updateData.teacher_id, token);
  }

  const result = await ClassRepository.updateById(classId, updateData);

  res.status(201).json({
    success: true,
    data: result
  });
})

export const deleteClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;

  const isClassExist = await ClassRepository.findById(classId);
  if (!isClassExist) throw new NotFoundError("Class not found. Check the Id again!");

  // Xóa record liên quan
  await EnrollmentRepository.deleteMany({ class_id: classId });
  await UserClassRepository.deleteMany({ class_id: classId });

  await ClassRepository.deleteById(classId);

  res.status(200).json({
    success: true,
    msg: "Class delete successfully"
  });
})