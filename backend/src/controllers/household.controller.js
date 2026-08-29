const householdService = require(
  "../services/household.service"
);

const {
  validateCreateHouseholdInput,
  validateJoinHouseholdInput,
} = require("../validators/household.validator");

async function create(req, res, next) {
  try {
    const errors = validateCreateHouseholdInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    const household = await householdService.createHousehold(
      req.user.id,
      req.body.name
    );

    return res.status(201).json({
      success: true,
      message: "Household created successfully.",
      data: {
        household,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const households = await householdService.getUserHouseholds(
      req.user.id
    );

    return res.json({
      success: true,
      data: {
        households,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const household = await householdService.getHouseholdById(
      req.user.id,
      req.params.id
    );

    return res.json({
      success: true,
      data: {
        household,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function join(req, res, next) {
  try {
    const errors = validateJoinHouseholdInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    const household = await householdService.joinHousehold(
      req.user.id,
      req.body.inviteCode
    );

    return res.json({
      success: true,
      message: "Successfully joined household.",
      data: {
        household,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getMembers(req, res, next) {
  try {
    const members = await householdService.getHouseholdMembers(
      req.user.id,
      req.params.id
    );

    return res.json({
      success: true,
      data: {
        members,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  join,
  getMembers,
};