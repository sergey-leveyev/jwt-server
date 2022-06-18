const UserModel = require("../models/user.model");

const bcrypt = require("bcrypt");
const uuid = require("uuid");

const mailService = require("./mail.service");
const tokenService = require("./token.service");
const UserDto = require("../dtos/user.dto");
const ApiError = require("../exceptions/api.error");

module.exports.userRegistrationService = async (email, password) => {
  const candidate = await UserModel.findOne({ email });

  if (candidate) {
    throw ApiError.BadRequest(`User already exists with at address : ${email}`);
  }

  const hashPassword = await bcrypt.hash(password, 3);
  const activationLink = uuid.v4();
  const user = await UserModel.create({
    email,
    password: hashPassword,
    activationLink,
  });

  await mailService.sendActivationMail(
    email,
    `${process.env.API_URL}/api/activate/${activationLink}`
  );

  const userDto = new UserDto(user);
  const tokens = tokenService.generateTokens({ ...userDto });

  await tokenService.saveToken(userDto.id, tokens.refreshToken);

  return {
    ...tokens,
    user: userDto,
  };
};

module.exports.activate = async (activationLink) => {
  const user = await UserModel.findOne({ activationLink });
  if (!user) {
    throw ApiError.BadRequest("User is inactive");
  }

  user.isActivated = true;
  await user.save();
};

module.exports.login = async (email, password) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw ApiError.BadRequest("The username or password is incorrect");
  }

  const isPassEquals = await bcrypt.compare(password, user.password);
  if (!isPassEquals) {
    throw ApiError.BadRequest("The username or password is incorrect");
  }
  const userDto = new UserDto(user);
  const tokens = tokenService.generateTokens({ ...userDto });

  await tokenService.saveToken(userDto.id, tokens.refreshToken);

  return {
    ...tokens,
    user: userDto,
  };
};

module.exports.logout = async (refreshToken) => {
  const token = await tokenService.removeTokens(refreshToken);
  return token;
};

module.exports.refresh = async (refreshToke) => {
  if (!refreshToke) {
    throw ApiError.UnauthorizedError();
  }

  const userData = tokenService.validateRefreshToken(refreshToke);
  const tokenFromDb = await tokenService.findToken(refreshToke);
  if (!userData || !tokenFromDb) {
    throw ApiError.UnauthorizedError();
  }

  const user = await UserModel.findById(userData.id);
  const userDto = new UserDto(user);
  const tokens = tokenService.generateTokens({ ...userDto });

  await tokenService.saveToken(userDto.id, tokens.refreshToken);

  return {
    ...tokens,
    user: userDto,
  };
};

module.exports.getAllUsers = async () => {
  const users = await UserModel.find();
  return users;
};
