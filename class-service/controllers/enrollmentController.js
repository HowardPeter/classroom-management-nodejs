import ClassRepository from '../repositories/classRepository.js'
import EnrollmentRepository from '../repositories/enrollmentRepository.js'
import { asyncWrapper } from "../middleware/index.js"
import { getBearer } from '../utils/index.js'
import { StudentServiceClient } from '../api/index.js'
import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js"

export const getStudentsInClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const classExist = await ClassRepository.findOne({ class_id: classId });
  if (!classExist)
    return res.status(404).json({
      success: false,
      msg: "Wrong class Id! Class does not exist."
    })

  const token = getBearer(req);

  const enrollments = await EnrollmentRepository.findByClassId(classId);

  if (enrollments.length === 0)
    return res.status(200).json({
      success: true,
      msg: "There are no student in this class!"
    })

  const ids = enrollments.map(e => e.student_id).join(",");
  const students = await StudentServiceClient.getStudentByIds(ids, token);

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
      msg: "Wrong class Id! Class does not exist."
    })

  const token = getBearer(req);

  const { student_id } = req.body;
  if (!student_id) throw new BadRequestError("Cannot get student Id!");

  // Kiểm tra student tồn tại
  await StudentServiceClient.getStudentById(student_id, token);

  const newEnrollment = {
    class_id: classId,
    student_id: student_id
  }

  const hasEnrollment = await EnrollmentRepository.findOne({
    class_id: classId,
    student_id: student_id
  })
  if (hasEnrollment) throw new ConflictError("This student has enrolled the class!");

  const result = await EnrollmentRepository.createOne(newEnrollment);

  res.status(201).json({
    success: true,
    data: result
  });
})

export const changeStudentClass = asyncWrapper(async (req, res) => {
  const oldClassId = req.params.id;
  const classExist = await ClassRepository.findOne({ class_id: oldClassId });
  if (!classExist)
    return res.status(404).json({
      success: false,
      msg: "Wrong class Id! Class does not exist."
    })

  const studentId = req.params.studentId;
  const { class_id: newClassId } = req.body;
  if (!newClassId) throw new BadRequestError("Require new class Id!");

  const token = getBearer(req);

  const isClass = await ClassRepository.findOne({ class_id: newClassId });
  if (!isClass) throw new NotFoundError("Class not found!");

  // Kiểm tra student tồn tại
  await StudentServiceClient.getStudentById(studentId, token);

  const hasEnrollment = await EnrollmentRepository.findOne({
    class_id: newClassId,
    student_id: studentId
  })
  if (hasEnrollment) throw new ConflictError("This student has enrolled the class!");

  const result = await EnrollmentRepository.updateMany({
    student_id: studentId,
    class_id: oldClassId
  }, { class_id: newClassId });

  res.status(200).json({
    success: true,
    data: result
  });
})

export const removeStudentFromClass = asyncWrapper(async (req, res) => {
  const classId = req.params.id;
  const classExist = await ClassRepository.findOne({ class_id: classId });
  if (!classExist)
    return res.status(404).json({
      success: false,
      msg: "Wrong class Id! Class does not exist."
    })

  const studentId = req.params.studentId;
  const token = getBearer(req);

  // Kiểm tra student tồn tại
  await StudentServiceClient.getStudentById(studentId, token);

  const enrollment = await EnrollmentRepository.findOne({
    student_id: studentId,
    class_id: classId
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      msg: "Student is not enrolled in this class"
    });
  }

  await EnrollmentRepository.deleteMany({
    student_id: studentId,
    class_id: classId
  });

  res.status(200).json({
    success: true,
    msg: "Remove student from class successfully"
  });
})