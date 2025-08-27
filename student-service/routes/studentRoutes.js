import express from 'express'
import { getStudents } from '../controllers/studentController.js'

const router = express.Router()

router
  .route('/')
  .get(getStudents)

export default router;
