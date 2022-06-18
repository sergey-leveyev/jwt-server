const ApiError = require("../exceptions/api.error");
const tokenService = require("../service/token.service");

module.exports = function (req, res, next) {
  try {
    const AuthorizationHeader = req.headers.authorization;

    if (!AuthorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = AuthorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    //In case if statement of accessToken  returns null
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};
