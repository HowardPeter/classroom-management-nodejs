import express from 'express'
import { getClasses, getClass, createNewClass, updateClass, deleteClass } from '../controllers/classController.js'
import { getStudentsInClass, addStudentToClass, changeStudentClass, removeStudentFromClass } from '../controllers/enrollmentController.js'
import { authorize, validate } from '../middleware/index.js'

const router = express.Router()

router
  .route('/')
  .get(getClasses)
  .post(validate("class"), createNewClass)

router
  .route('/:id')
  .get(getClass)
  .patch(authorize("owner", "manager"), updateClass)
  .delete(authorize("owner"), deleteClass)

router
  .route('/:id/students')
  .get(getStudentsInClass)
  .post(authorize("owner", "manager"), validate("enrollment"), addStudentToClass)
  .patch(authorize("owner", "manager"), validate("enrollment"), changeStudentClass)

router
  .route('/:id/students/:studentId')
  .delete(authorize("owner", "manager"), removeStudentFromClass)

export default router;