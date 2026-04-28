import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import ApiError from "../../common/utils/api-error.js";
import User from "./auth.model.js"; // this is the model which we will use to interact with the database and perform operations like creating a new user, finding a user, etc. The User model is defined in the auth.model.js file and it represents the structure of the user data in the MongoDB database. By importing it here, we can use it to perform various operations related to user authentication and management in our application.
import { sendVerificationEmail } from "../../common/config/email.js";
//and we will call User model not userSchema directly because userSchema is just a blueprint for the structure of the user data, while User is the actual model that we can use to create, read, update, and delete user documents in the database. The User model provides methods and functionalities to interact with the database based on the defined schema.

const hashToken = (token) => {
  // a small fun who will take token and return the hashed token
  crypto.createHash("sha256").update(token).digest("hex");
};

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw ApiError.conflict("User with this email already exists");
  }

  //Verification token-send to user email for verification & in DB will save hashed version of the token when user clicks verification link in email we will hash the token from the link and compare it with the hashed token in the database to verify the user's email.
  const { rawToken, hashedToken } = generateResetToken(); // in DB we prefer to keep hashed token

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken: hashedToken,
  });

  //TODO: send mail to the client with rawToken to verify email
  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (error) {
    console.error("error sending Verification email: ", error);
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;

  //* first save into DB now => userSchema
};

const login = async ({ email, password }) => {
  //1. check with the email that the user exist or not
  //2. if user exist then check for the password
  //3. check the user is verified or not

  const user = await User.findOne({ email }).select("+password"); //If a user with email exists in DB => return user document else null
  // now here password will not come because we have set select: false in the userSchema for password field. so we need to explicitly select the password field to compare it with the provided password. we can do this by using the select method of mongoose like this: User.findOne({email}).select("+password") which will include the password field in the returned user document

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  //somehow i will check password
  const isMatch = user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  if (!user.isVerified) {
    throw ApiError.forbidden("Please verify your email before logging in");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashToken(refreshToken); // but we will not keep the plain refresh token we have to hash the refresh token for the DB

  await user.save({ validateBeforeSave: false }); // here we are saving the user document with the hashed refresh token but we are setting validateBeforeSave to false because we don't want to run the validation for the user document again when we are just updating the refresh token. this is because the user document is already valid and we don't want to run the validation again which might cause some issues if there are some required fields that are not being updated in this case. so by setting validateBeforeSave to false, we can skip the validation and just update the refresh token without any issues.

  const userObj = user.toObject(); // here we are converting the user document to a plain JavaScript object using the toObject method. this is because the user document is a Mongoose document which has some additional properties and methods that we don't want to include in the response. by converting it to a plain JavaScript object, we can remove those additional properties and methods and just return the relevant user data in the response.

  delete userObj.password; // here we are deleting the password field from the user object before returning it in the response. this is because we don't want to expose the password field in the response for security reasons. by deleting it, we can ensure that the password is not included in the response and is kept secure.
  delete userObj.verificationToken;
  delete userObj.refreshToken;

  //here we will send the accessToken & refreshToken in cookies
  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

const refresh = async (token) => {
  //token check karlet hu exist karta hai ya nahi
  //token ko decode karna hai
  //usme se user._id nikal leta hu
  //fir db ko call lgake findbyId(user._id) se user find karlo fir check if the refreshtoekn matches aur not
  //if it matches then regenerate the access & refresh token
  //save in the db(refresh token) & send it to the user also

  if (!token) throw ApiError.unauthorized("Refresh Token Missing");

  const decoded = verifyRefreshToken(token); // mere hi eco system ka hai yaa mtlb mere hi secret se hua hai ya nahi =. apne ilake ka aadmi hai kyaa

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) throw ApiError.unauthorized("User not found");

  if (user.refreshToken !== hashToken(token)) {
    // we have to match wiht the hash token bcuz in db we have saved the token after hashing

    throw ApiError.unauthorized("Invalid Refresh Token");
  }

  const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id });

  await user.save({ validateBeforeSave: false });

  return {
    newAccessToken,
    newRefreshToken,
  };
};

const logout = async (userId) => {
  // const user = User.findById(userId);
  // if(!user) throw ApiError.unauthorized("User not found");

  // user.refreshToken = undefined // or null which one to choose and why??
  // await user.save({validateBeforeSave: false})

  // res.clearCookie("refreshToken");
  // res.clearCookie("accessToken");

  await User.findByIdAndUpdate(
    userId,
    { refreshToken: undefined }, //by undefined means it will remove the refreshToken field from the user document in the database. and null will set the refreshToken field to null but it will still exist in the user document.
  );
};

const forgotPassword = async (emailId) => {
  const user = User.findOne({ email });

  if (!user) throw ApiError.notFound("User with this email does not exist");

  const { rawToken, hashedToken } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetpasswordExpires = Date.now() + 5 * 60 * 1000; // 5-min

  await user.save();

  //TODO: send mail to the client
};

const verifyEmail = async (token) => {
  const hashedToken = hashToken(token);
  const user = await User.findOne({ verificationToken: hashedToken }).select(
    "+verificationToken",
  );

  if (!user) throw ApiError.notFound("Invalid verification token");

  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();
  return user;
};

const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw ApiError.notFound("User not found");

  return user;
};

export { register, login, refresh, logout, forgotPassword, verifyEmail, getMe };
