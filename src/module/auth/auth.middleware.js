import ApiError from "../../common/utils/api-error.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";

const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // token = Bearer <tokenValue>
  }

  // if token is in cookies then first we have to install cookie-parser middleware and then we can access the token from req.cookies.token

  if (!token) {
    throw ApiError.unauthorized("Not authorized, token missing");
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    throw ApiError.unauthorized("Not authorized, invalid token");
  }

  const user = await User.findById(decoded.id);

  if (!user) throw ApiError.unauthorized("User no longer exist");

  req.user = {
    id: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("You are not Authorized to perform this action");
    }
    next();
  };
};

export {authenticate, authorize}
