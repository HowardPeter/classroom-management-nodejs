import asyncWrapper from "../middleware/assync-wrapper.js";
import ClassRepository from '../repositories/ClassRepository.js'
import paginate from '../utils/pagination.js'
import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js";

export const getClasses = asyncWrapper(async (req, res) => {
  const userId = req.user.userId;

  if (!userId)
    throw new NotFoundError("Cannot get UserID!");

  // const { page = 1, limit = 10, orderBy = { class_name: 'asc' }, ...filters } = req.query;

  const classes = await ClassRepository.findByUserId(userId);

  res.status(200).json({
    success: true,
    ...classes,
  });
})