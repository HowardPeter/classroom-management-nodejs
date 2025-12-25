import express from "express";
import multer from 'multer';
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { validate } from "../middlewares/index.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // max 20MB
});

router
  .route('/')
  .get(getTeachers)
  .post(validate, upload.single('avatar'), createTeacher)

router
  .route('/:id')
  .get(getTeacher)
  .patch(validate, upload.single('avatar'), updateTeacher)
  .delete(deleteTeacher)

export default router;