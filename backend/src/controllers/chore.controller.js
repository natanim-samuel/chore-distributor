const choreService = require(
  "../services/chore.service"
);

async function createChore(req, res, next) {
  try {
    const chore = await choreService.createChore(
      req.params.householdId,
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Chore created successfully.",
      data: {
        chore,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getHouseholdChores(req, res, next) {
  try {
    const chores =
      await choreService.getHouseholdChores(
        req.params.householdId,
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: {
        chores,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getChore(req, res, next) {
  try {
    const chore =
      await choreService.getChoreById(
        req.params.id,
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: {
        chore,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateChore(req, res, next) {
  try {
    const chore =
      await choreService.updateChore(
        req.params.id,
        req.user.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Chore updated successfully.",
      data: {
        chore,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteChore(req, res, next) {
  try {
    await choreService.deleteChore(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Chore deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createChore,
  getHouseholdChores,
  getChore,
  updateChore,
  deleteChore,
};