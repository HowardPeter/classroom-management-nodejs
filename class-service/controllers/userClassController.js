import ClassRepository from '../repositories/classRepository.js'
import UserClassRepository from '../repositories/userClassRepository.js'
import { asyncWrapper } from "#shared/middlewares/index.js"
import { getBearer } from '#shared/utils/index.js'
import { UserServiceClient } from '../api/index.js'
import { BadRequestError, ConflictError, NotFoundError } from "#shared/errors/errors.js"

export const getUserClasses = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const token = getBearer(req);

  const userClasses = await UserClassRepository.findByClassId(classId);

  if (userClasses.length === 0)
    return res.status(200).json({
      success: true,
      data: []
    });

  const ids = userClasses.map(u => u.user_id).join(",");
  const users = await UserServiceClient.getUserByIds(ids, token);

  const result = userClasses.map(uc => {
    const user = users.find(u => u._id === uc.user_id);
    return {
      user_id: uc.user_id,
      username: user ? user.username : null,
      role: uc.role
    }
  })

  res.status(200).json({
    success: true,
    data: result
  });
})

export const addUserClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const token = getBearer(req);

  const { user_id, role } = req.body;
  if (!user_id || !role) throw new BadRequestError("User Id and role is required!");

  // Kiểm tra user tồn tại
  const isUser = await UserServiceClient.getUserByIds(user_id, token);
  if (isUser.length === 0) throw new NotFoundError("User Id not found!");

  const newUserClass = {
    class_id: classId,
    user_id: user_id,
    role: role
  }

  const hasUser = await UserClassRepository.findOne({
    class_id: classId,
    user_id: user_id
  })
  if (hasUser) throw new ConflictError("This user has a role in the class!");

  const result = await UserClassRepository.createOne(newUserClass);

  res.status(201).json({
    success: true,
    data: result
  });
})

export const changeUserClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const userId = req.params.userId;
  const { role } = req.body;

  if (!role) throw new BadRequestError("New role is required!");

  const result = await UserClassRepository.updateMany({
    class_id: classId,
    user_id: userId
  }, { role: role });

  if (result.count === 0) {
    return res.status(404).json({
      success: false,
      msg: "User has no role in the class!"
    })
  }

  res.status(200).json({
    success: true,
    data: result
  });
})

export const removeUserClass = asyncWrapper(async (req, res) => {
  const { id: classId, userId } = req.params;

  const userClasses = await UserClassRepository.findByClassId(classId);
  if (!userClasses || userClasses.length === 0) throw new NotFoundError("Class not found or has no users");
  if (userClasses.length === 1) throw new BadRequestError("Cannot delete the last manager account in the class!");

  await UserClassRepository.deleteMany({
    user_id: userId,
    class_id: classId
  });

  res.status(200).json({
    success: true,
    msg: "Remove user role from class successfully"
  });
})

export const joinClass = asyncWrapper(async (req, res) => {
  const { class_id } = req.body;
  const userId = req.user?.userId;

  if (!userId) throw new NotFoundError("Cannot get user Id!");

  const hasUser = await UserClassRepository.findOne({
    class_id: classId,
    user_id: user_id
  })
  if (hasUser) throw new ConflictError("You had a role in this class!");

  const result = await UserClassRepository.createOne({
    class_id: class_id,
    user_id: userId,
    role: "manager"
  })

  res.status(201).json({
    success: true,
    data: result
  });
})

export const leaveClass = asyncWrapper(async (req, res) => {
  const { class_id } = req.params.id;
  const userId = req.user.userId;

  if (!userId) throw new NotFoundError("Cannot get user Id!");

  await UserClassRepository.deleteMany({
    class_id: class_id,
    user_id: userId
  })

  res.status(201).json({
    success: true,
    msg: "Leave class successfully"
  });
})

export const checkUserClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const { user_id: userId } = req.query;

  if (!classId || !userId) throw new BadRequestError("Class Id and User Id are required!");

  const userClass = await UserClassRepository.findOne({
    user_id: userId,
    class_id: classId,
  });

  res.status(200).json(userClass);
})