import express from 'express'
import { getClassMonthlyTuitionReport, getStudentTuitionReport } from '../controllers/reportController.js'

const router = express.Router();

router.get('/class/:classId', getClassMonthlyTuitionReport);
router.get('/student/:studentId', getStudentTuitionReport);

export default router;