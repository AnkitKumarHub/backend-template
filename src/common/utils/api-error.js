//* Node js have already error class so we can use the error class

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badrequest(message = "Bad request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "you are not Authorized for this") {
    return new ApiError(401, message);
  }

  static conflict(message = "Conflict - Resource already exists") {
    return new ApiError(409, message);
  }
  static forbidden(message = "forbidden ") {
    return new ApiError(412, message); // here 412 or 403 both are fine but 403 is more commonly used for forbidden access. 412 is more specific to precondition failed, which is not exactly the same as forbidden access. so it's better to use 403 for forbidden access and 412 for precondition failed.
  }
  static notFound(message = "Not Found") {
    return new ApiError(404, message);
  }
}

//throw new Error now use => throw new ApiError.badRequest

export default ApiError;
