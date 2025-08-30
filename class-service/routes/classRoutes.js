import express from 'express'
import { getClasses, getClass, createNewClass, updateClass, deleteClass } from '../controllers/classController.js'
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

export default router;