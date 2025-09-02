import ClassRepository from '../repositories/classRepository.js'
import UserClassRepository from '../repositories/userClassRepository.js'
import { asyncWrapper } from "../middleware/index.js"
import { getBearer } from '../utils/index.js'
import { StudentServiceClient } from '../api/index.js'
import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js"

export const getUserClasses = asyncWrapper(async (req, res) => {

})

export const addUserClass = asyncWrapper(async (req, res) => {

})

export const joinClass = asyncWrapper(async (req, res) => {

})

export const changeUserClass = asyncWrapper(async (req, res) => {

})

export const removeUserClass = asyncWrapper(async (req, res) => {

})