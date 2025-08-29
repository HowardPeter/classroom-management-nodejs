import express from 'express'
import { getClasses, getClass, createNewClass, updateClass, deleteClass } from '../controllers/classController.js'
import validate from '../middleware/validate-field.js'

const router = express.Router()

router
  .route('/')
  .get(getClasses)
  .post(validate("class"), createNewClass)

router
  .route('/:id')
  .get(getClass)
  .patch(updateClass)
  .delete(deleteClass)

export default router;