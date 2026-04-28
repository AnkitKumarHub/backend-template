import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  //something
  const user = await authService.register(req.body);
  ApiResponse.created(res, "User registered successfully", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 60 * 1000, //15 min
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });

  ApiResponse.ok(res, "Login Successful", { user });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  ApiResponse.ok(res, "Logut successfully!"); // now redirect to login/home page done by fronted
};

const getMe = async (rq, res) => {
  const user = await authService.getMe(req.user.id);
  ApiResponse.ok(res, "User details fetched successfully", user);
};

const verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  ApiResponse.ok(res, "Email verified successfully", user);
};



export { register, login, logout, getMe, verifyEmail };
