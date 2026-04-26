import ApiError from "../utils/api-error.js";

// yha validity check karenge ki jo data aaya hai wo Dto class ke schema ke according hai ya nahi, agar nahi hai to error message bhejenge

//yha pe hum ek middleware function banayenge jo Dto class ko as a parameter lega aur uske schema ke according data ko validate karega, agar validation fail hua to error message bhejenge lekin koi bhi error thodi standardized error bhjeunga

// validate middleware function will take a Dto class as a parameter and return a middleware function that will validate the request body against the schema defined in the Dto class, if validation fails it will throw an ApiError with the validation errors

// in utils folder Error class already exist karti thi 
const validate = (Dtoclass) => {
    return (req, res, next) => {
        const { errors, value } = Dtoclass.validate(req.body);
        if (errors) {
            // return next(new ApiError(400, "Validation Error", errors));
            throw ApiError.badRequest(errors.join("; "));
        }
        req.body = value; // to get the validated and sanitized data
        next();
    }
};

export default validate;
