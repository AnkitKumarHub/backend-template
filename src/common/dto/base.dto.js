import Joi from "joi";

class BaseDto {
  static schema = Joi.object({}); // to be overridden by child classes

  // to validate the data against the schema defined in the child class and return the validated data or errors
  static validate(data) {
    const { error, value } = this.schema.validate(data, {
      abortEarly: false, // to get all the validation errors at once
      stripUnknown: true, // to remove any unknown fields from the data
    });

    if (error) {
      const errors = error.details.map((d) => {
        return d.message;
      });
      return { errors, value: null };
    }

    return { errors: null, value};
  }
}

export default BaseDto;
