import { ReasonPhrases, StatusCodes } from "../until/httpStatusCode";

class SuccessResponse {
  constructor(
    {message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metaData}
  ) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metaData = metaData;
  }
  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}
class OK extends SuccessResponse{
  constructor({message,metaData}){
    super(message,metaData)
  }
}
class CREATED extends SuccessResponse {
  constructor({ message, statusCode = StatusCodes.CREATED,reasonStatusCode =ReasonPhrases.CREATED, metaData,options }) {
    super( {message, statusCode,reasonStatusCode, metaData} );
    if (options !== undefined) {
      this.options = options;
    }
  }
}


export { OK, CREATED, SuccessResponse };
