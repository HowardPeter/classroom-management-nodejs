import express from 'express'
import { authorize, validate, checkClassExist } from '../middlewares/index.js'
import { getUserClasses, addUserClass, joinClass, changeUserClass, removeUserClass, leaveClass, checkUserClass } from '../controllers/userClassController.js'

const router = express.Router()

router.param('id', checkClassExist);

router
  .route('/:id/users')
  .get(authorize("owner", "manager"), getUserClasses)
  .post(validate("userClass"), authorize("owner"), addUserClass)

router.delete('/:id/users/me', authorize("manager", "viewer"), leaveClass)

router
  .route('/:id/users/:userId')
  .patch(validate("userClass"), authorize("owner"), changeUserClass)
  .delete(authorize("owner"), removeUserClass)

router.post('/join', joinClass)

router.get('/:id/permissions', checkUserClass)

export default router;