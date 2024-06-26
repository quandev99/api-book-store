import { ReasonPhrases, StatusCodes } from "../until/httpStatusCode";

class ErrorResponse extends Error {
  constructor(message,status){
    super(message);
    this.status = status;
  }
}

class ConflictResponse extends ErrorResponse {
  constructor(
    message = ReasonPhrases.CONFLICT,
    statusCode = StatusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}
class BAD_REQUEST extends ErrorResponse {
  constructor(
    message = ReasonPhrases.CONFLICT,
    statusCode = StatusCodes.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}
class AuthFailureError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.UNAUTHORIZED,
    statusCode = StatusCodes.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}
class NotFoundError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    statusCode = StatusCodes.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}

class ForBiddenError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.FORBIDDEN,
    statusCode = StatusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

export {
  ErrorResponse,
  ConflictResponse,
  BAD_REQUEST,
  AuthFailureError,
  NotFoundError,
  ForBiddenError,
};