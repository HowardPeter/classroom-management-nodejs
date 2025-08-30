import ClassRepository from '../repositories/classRepository.js'
import UserClassRepository from '../repositories/userClassRepository.js'
import EnrollmentRepository from '../repositories/enrollmentRepository.js'
import { asyncWrapper } from "../middleware/index.js"
import { paginate, getBearer } from '../utils/index.js'
import { StudentServiceClient } from '../api/index.js'
import { NotFoundError } from "../errors/errors.js"

export const getStudentsInClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const token = getBearer(req);

  const enrollments = await EnrollmentRepository.findByClassId(classId);

  if (enrollments.length === 0)
    return res.status(200).json({
      success: true,
      msg: "There are no student in this class!"
    })

  const ids = enrollments.map(e => e.student_id).join(",");
  const students = await StudentServiceClient.getStudentsByIds(ids, token);

  res.status(200).json({
    success: true,
    data: students
  })
})

export const addStudentToClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;

  const classExist = await ClassRepository.findOne({ class_id: classId });
  if (!classExist)
    return res.status(404).json({
      success: false,
      msg: "Class does not exist!"
    })

  const { student_id } = req.body;
  if (!student_id) throw new NotFoundError("Cannot get student Id!");

  const newEnrollment = {
    class_id: classId,
    student_id: student_id
  }

  const result = await EnrollmentRepository.createOne(newEnrollment);

  res.status(201).json({
    success: true,
    data: result
  });
})

export const changeStudentClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;

  const classExist = await ClassRepository.findOne({ class_id: classId });
  if (!classExist)
    return res.status(404).json({
      success: false,
      msg: "Class does not exist!"
    })

  const { student_id, class_id } = req.body;
  if (!student_id || !class_id) throw new NotFoundError("Require student Id and class Id!");

  const newClassRef = {
    student_id: student_id,
    class_id: class_id
  }

  const result = await EnrollmentRepository.updateOne({ student_id: student_id }, newClassRef);

  res.status(200).json({
    success: true,
    data: result
  });
})

export const removeStudentFromClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const studentId = req.params.studentId;
  const token = getBearer(req);

  if (!studentId || classId) throw new NotFoundError("Require class id and student id!");

  const classExist = await ClassRepository.findOne({ class_id: classId });
  if (!classExist)
    return res.status(404).json({
      success: false,
      msg: "Class does not exist!"
    })
  
  const studentExist = await StudentServiceClient.getStudentById(studentId, token);
  if(!studentExist)
    return res.status(404).json({
      success: false,
      msg: "Student does not exist!"
    })

  await EnrollmentRepository.deleteOne({
    student_id: studentId,
    class_id: classId
  });

  await StudentServiceClient.deleteStudentById(studentId, token);

  res.status(200).json({
    success: true,
    msg: "Remove student from class successfully"
  });
})

// export const removeManyStudentsFromClass = asyncWrapper(async (req, res) => {
//   const classId = req.params.id;

//   const classExist = await ClassRepository.findOne({ class_id: classId });
//   if (!classExist)
//     return res.status(404).json({
//       success: false,
//       msg: "Class not found!"
//     })

//   const { student_ids } = req.body || {};
//   if (!student_ids || student_ids.length === 0)
//     return res.status(400).json({
//       success: false,
//       msg: "Student has not been chosen yet!"
//     });
  
//   // Chuẩn hoá danh sách id (loại rỗng, trùng)
//   const ids = [...new Set(student_ids.map(String).filter(Boolean))];

//   const { count } = await EnrollmentRepository.deleteMany({
//     class_id: classId,
//     student_id: { in: ids }
//   });

//   return res.status(200).json({
//     success: true,
//     requested: ids.length,
//     deleted_count: count,
//     not_found: ids.length - count
//   });
// })