const {
  registerUser,
  loginUser,
  getUserById,
} = require("../services/auth.service");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../validators/auth.validator");

async function register(req, res, next) {
  try {
    const errors = validateRegisterInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLoginInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.userId);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me,
};
