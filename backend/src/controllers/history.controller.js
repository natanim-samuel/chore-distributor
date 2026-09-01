const {
  getHouseholdHistory,
} = require("../services/history.service");

async function getHistory(req, res, next) {
  try {
    const history = await getHouseholdHistory(
      req.user.userId,
      req.params.householdId
    );

    return res.status(200).json({
      success: true,
      data: {
        history,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHistory,
};