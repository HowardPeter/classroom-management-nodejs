import express from 'express'
import { authorize, validate } from '../middleware/index.js'
import { getClasses, getClass, createNewClass, updateClass, deleteClass } from '../controllers/classController.js'
import { getStudentsInClass, addStudentToClass, changeStudentClass, removeStudentFromClass } from '../controllers/enrollmentController.js'
import { getUserClasses, addUserClass, joinClass, changeUserClass, removeUserClass, leaveClass } from '../controllers/userClassController.js'

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
  
  router
  .route('/:id/students/:studentId')
  .patch(validate("enrollment"), authorize("owner", "manager"), changeStudentClass)
  .delete(authorize("owner", "manager"), removeStudentFromClass)

router
  .route('/:id/users')
  .get(authorize("owner", "manager"), getUserClasses)
  .post(validate("userClass"), authorize("owner"), addUserClass)

router.delete('/:id/users/me', authorize("manager"), leaveClass)

router
  .route('/:id/users/:userId')
  .patch(validate("userClass"), authorize("owner"), changeUserClass)
  .delete(authorize("owner"), removeUserClass)

router.post('/join', joinClass)

export default router;