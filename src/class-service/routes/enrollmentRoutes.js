import express from 'express'
import { authorize, validate, checkClassExist } from '../middlewares/index.js'
import { getStudentsInClass, addStudentToClass, changeStudentClass, removeStudentFromClass, checkStudentEnrollment } from '../controllers/enrollmentController.js'

const router = express.Router()

router.param('id', checkClassExist);

router
  .route('/:id/students')
  .get(getStudentsInClass)
  .post(validate("enrollment"), authorize("owner", "manager"), addStudentToClass)

router
  .route('/:id/students/:studentId')
  .get(checkStudentEnrollment)
  .patch(authorize("owner", "manager"), changeStudentClass)
  .delete(authorize("owner", "manager"), removeStudentFromClass)

export default router;