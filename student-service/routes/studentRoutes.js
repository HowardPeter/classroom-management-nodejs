import express from 'express'
import { getStudents, getStudent, getStudentByIds, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js'
import { validateStudent } from '../middleware/validateStudent.js'

const router = express.Router()

router
  .route('/')
  .get(getStudents)
  .get(getStudentByIds)
  .post(validateStudent, createStudent)

router
  .route('/:id')
  .get(getStudent)
  .put(validateStudent, updateStudent)
  .delete(deleteStudent)

export default router;
