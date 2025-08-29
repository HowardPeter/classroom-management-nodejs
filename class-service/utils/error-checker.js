import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js";

class ErrorChecker {
  notFound(value, message) {
    if (!value) throw new NotFoundError(message);
  }

  badRequest(value, message) {
    if (!value) throw new BadRequestError(message);
  }
  
  conflict(value, message) {
    if (!value) throw new ConflictError(message);
  }
};

export default new ErrorChecker;