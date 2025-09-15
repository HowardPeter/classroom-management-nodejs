import express from 'express'
import { authorize, validate } from '../middlewares/index.js'
import { getClasses, getClass, createNewClass, updateClass, deleteClass } from '../controllers/classController.js'

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

export default router;