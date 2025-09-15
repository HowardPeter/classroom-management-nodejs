import express from 'express'
import { authorize, validate, checkClassExist } from '../middlewares/index.js'
import { getClasses, getClass, createNewClass, updateClass, deleteClass } from '../controllers/classController.js'
import { getStudentsInClass, addStudentToClass, changeStudentClass, removeStudentFromClass } from '../controllers/enrollmentController.js'
import { getUserClasses, addUserClass, joinClass, changeUserClass, removeUserClass, leaveClass, checkUserClass } from '../controllers/userClassController.js'

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
  .get(checkClassExist, getStudentsInClass)
  .post(checkClassExist, validate("enrollment"), authorize("owner", "manager"), addStudentToClass)

router
  .route('/:id/students/:studentId')
  .patch(checkClassExist, validate("enrollment"), authorize("owner", "manager"), changeStudentClass)
  .delete(checkClassExist, authorize("owner", "manager"), removeStudentFromClass)

router
  .route('/:id/users')
  .get(checkClassExist, authorize("owner", "manager"), getUserClasses)
  .post(checkClassExist, validate("userClass"), authorize("owner"), addUserClass)

router.delete('/:id/users/me', checkClassExist, authorize("manager"), leaveClass)

router
  .route('/:id/users/:userId')
  .patch(checkClassExist, validate("userClass"), authorize("owner"), changeUserClass)
  .delete(checkClassExist, authorize("owner"), removeUserClass)

router.post('/join', joinClass)

router.get('/:id/permissions', checkUserClass)

export default router;