import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  //something

  const user = await authService.register(req.body);

  ApiResponse.created(res, "User registered successfully", user);
};

export { register };
