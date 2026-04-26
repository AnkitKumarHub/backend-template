import { generateResetToken } from "../../common/utils/jwt.utils.js";
import ApiError from "../../utils/ApiError.js";
import User from "./auth.model.js"; // this is the model which we will use to interact with the database and perform operations like creating a new user, finding a user, etc. The User model is defined in the auth.model.js file and it represents the structure of the user data in the MongoDB database. By importing it here, we can use it to perform various operations related to user authentication and management in our application.
//and we will call User model not userSchema directly because userSchema is just a blueprint for the structure of the user data, while User is the actual model that we can use to create, read, update, and delete user documents in the database. The User model provides methods and functionalities to interact with the database based on the defined schema.

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw ApiError.conflict("User with this email already exists");
  }

  //token
  const { rawToken, hashedToken } = generateResetToken(); // in DB we prefer to keep hashed token

  const user =  await User.create({
    name,
    email,
    password,
    role,
    verificationToken: hashedToken,
  });

  //TODO: send an email to user with token: rawToken

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;


  return userObj;

  //* first save into DB now => userSchema
};

export { register };
