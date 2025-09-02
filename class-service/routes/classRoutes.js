import express from 'express'
import { authorize, validate } from '../middleware/index.js'
import { getClasses, getClass, createNewClass, updateClass, deleteClass } from '../controllers/classController.js'
import { getStudentsInClass, addStudentToClass, changeStudentClass, removeStudentFromClass } from '../controllers/enrollmentController.js'
import { getUserClasses, addUserClass, joinClass, changeUserClass, removeUserClass } from '../controllers/userClassController.js'

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
  .post(validate("enrollment"), authorize("owner", "manager"), addStudentToClass)
  .patch(validate("enrollment"), authorize("owner", "manager"), changeStudentClass)

router
  .route('/:id/students/:studentId')
  .delete(authorize("owner", "manager"), removeStudentFromClass)

router
  .route('/:id/users')
  .get(validate("owner", "manager"), getUserClasses)
  .post(validate("owner"), addUserClass)

router
  .route('/:id/users/:userId')
  .patch(validate("owner"), changeUserClass)
  .delete(validate("owner"), removeUserClass)

router.post('/join', joinClass)

export default router;