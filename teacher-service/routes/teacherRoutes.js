import express from "express";
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { validate } from "../middlewares/index.js";

const router = express.Router();

router
  .route('/')
  .get(getTeachers)
  .post(validate, createTeacher)

router
  .route('/:id')
  .get(getTeacher)
  .patch(validate, updateTeacher)
  .delete(deleteTeacher)

export default router;