import asyncWrapper from "../middleware/assync-wrapper.js";
import StudentRepository from "../repositories/studentRepository.js";
import paginate from '../utils/pagination.js'

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