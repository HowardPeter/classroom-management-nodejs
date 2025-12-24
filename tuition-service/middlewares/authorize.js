import { checkPermission } from '../utils/index.js'
import { getBearer } from '#shared/utils/index.js'
import { ForbiddenError } from "#shared/errors/errors.js"

export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const classId = req.query.class_id || req.params.classId;
      const userId = req.user.userId;
      const token = getBearer(req);

      const allowed = await checkPermission(classId, userId, token, allowedRoles);

      if (!allowed)
        throw new ForbiddenError("User does not have permission to perform this action!");

      next();
    } catch (err) {
      next(err);
    }
  };
};
