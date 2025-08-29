import asyncWrapper from "../middleware/assync-wrapper.js";
import ClassRepository from '../repositories/classRepository.js'
import UserClassRepository from '../repositories/userClassRepository.js'
import EnrollmentRepository from '../repositories/enrollmentRepository.js'
import { paginate, ErrorChecker } from '../utils/index.js'

export const getClasses = asyncWrapper(async (req, res) => {
  const userId = req.user.userId;

  ErrorChecker.notFound("User Id not found!")

  const { page = 1, limit = 10, orderBy = { class_name: 'asc' } } = req.query;

  const classes = await paginate(ClassRepository, {
    page: Number(page),
    limit: Number(limit),
    where: {
      userClasses: {
        some: { user_id: userId }
      }
    },
    orderBy: orderBy,
    include: { userClasses: true }
  });

  res.status(200).json({
    success: true,
    ...classes
  });
})

export const getClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;

  const result = await ClassRepository.findById(classId);

  if (!result)
    return res.status(404).json({
      success: false,
      msg: "Class not found. Check the Id again!"
    })

  res.status(200).json({
    success: true,
    data: result
  });
})

export const createNewClass = asyncWrapper(async (req, res) => {
  const newClassData = req.body;

  const result = await ClassRepository.createOne(newClassData);

  const classId = result.class_id;
  const userId = req.user.userId;

  const newUserRef = {
    class_id: classId,
    user_id: userId,
    role: "owner"
  }

  await UserClassRepository.createOne(newUserRef);

  res.status(201).json({
    success: true,
    data: result
  });
})

export const updateClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const updateData = req.body;

  const updatedClass = await ClassRepository.findById(classId);

  if (!updatedClass)
    return res.status(404).json({
      success: false,
      msg: "Class not found. Check the Id again!"
    })

  const result = await ClassRepository.updateById(classId, updateData);

  res.status(201).json({
    success: true,
    data: result
  });
})

export const deleteClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;

  const deletedClass = await ClassRepository.findById(classId);

  if (!deletedClass)
    return res.status(404).json({
      success: false,
      msg: "Class not found. Check the Id again!"
    })

  await EnrollmentRepository.deleteMany({ class_id: classId });
  await UserClassRepository.deleteMany({ class_id: classId });
  await ClassRepository.deleteById(classId);

  res.status(200).json({
    success: true,
    msg: "Class delete successfully"
  });
})