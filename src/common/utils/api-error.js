//* Node js have already error class so we can use the error class 

class ApiError extends Error{

    constructor(statusCode, message){
        super(message)
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor)

    }

    static badrequest(message="Bad request"){
        return new ApiError(400, message)
    }

    static unauthorized(message = "you are not Authorized for this"){
        return new ApiError(401, message);
    }

    static conflict(message = "Conflict - Resource already exists"){
        return new ApiError(409, message);
    }


}

//throw new Error now use => throw new ApiError.badRequest

export default ApiError;
