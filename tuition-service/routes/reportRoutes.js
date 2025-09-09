import express from 'express'
import { getClassMonthlyTuitionReport, getStudentTuitionReport } from '../controllers/reportController.js'
import { authorize } from '../middlewares/index.js'

const router = express.Router();

router.get('/class/:classId', authorize("owner", "manager"), getClassMonthlyTuitionReport);
router.get('/student/:studentId', getStudentTuitionReport);

export default router;