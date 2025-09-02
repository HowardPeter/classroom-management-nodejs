import { checkPermission } from '../utils/index.js'

export const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const classId = req.params.id;
      const userId = req.user.userId;

      const allowed = await checkPermission(userId, classId, allowedRoles);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          msg: "User does not have permission to perform this action!",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
