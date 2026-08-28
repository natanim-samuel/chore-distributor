function validateCreateChore(req, res, next) {
  const {
    title,
    difficulty,
    priority,
    frequency,
    estimatedMinutes,
  } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Chore title is required.",
    });
  }

  if (title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      message: "Chore title cannot exceed 150 characters.",
    });
  }

  if (
    difficulty !== undefined &&
    (!Number.isInteger(Number(difficulty)) ||
      Number(difficulty) < 1 ||
      Number(difficulty) > 5)
  ) {
    return res.status(400).json({
      success: false,
      message: "Difficulty must be between 1 and 5.",
    });
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH"];

  if (
    priority !== undefined &&
    !validPriorities.includes(priority)
  ) {
    return res.status(400).json({
      success: false,
      message: "Priority must be LOW, MEDIUM, or HIGH.",
    });
  }

  const validFrequencies = [
    "ONCE",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
  ];

  if (
    frequency !== undefined &&
    !validFrequencies.includes(frequency)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Frequency must be ONCE, DAILY, WEEKLY, or MONTHLY.",
    });
  }

  if (
    estimatedMinutes !== undefined &&
    estimatedMinutes !== null &&
    (!Number.isInteger(Number(estimatedMinutes)) ||
      Number(estimatedMinutes) <= 0)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Estimated minutes must be greater than 0.",
    });
  }

  next();
}

function validateUpdateChore(req, res, next) {
  const {
    title,
    difficulty,
    priority,
    frequency,
    estimatedMinutes,
  } = req.body;

  if (
    title !== undefined &&
    (!title || title.trim().length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Chore title cannot be empty.",
    });
  }

  if (
    title !== undefined &&
    title.trim().length > 150
  ) {
    return res.status(400).json({
      success: false,
      message: "Chore title cannot exceed 150 characters.",
    });
  }

  if (
    difficulty !== undefined &&
    (!Number.isInteger(Number(difficulty)) ||
      Number(difficulty) < 1 ||
      Number(difficulty) > 5)
  ) {
    return res.status(400).json({
      success: false,
      message: "Difficulty must be between 1 and 5.",
    });
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH"];

  if (
    priority !== undefined &&
    !validPriorities.includes(priority)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid priority.",
    });
  }

  const validFrequencies = [
    "ONCE",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
  ];

  if (
    frequency !== undefined &&
    !validFrequencies.includes(frequency)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid frequency.",
    });
  }

  if (
    estimatedMinutes !== undefined &&
    estimatedMinutes !== null &&
    (!Number.isInteger(Number(estimatedMinutes)) ||
      Number(estimatedMinutes) <= 0)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Estimated minutes must be greater than 0.",
    });
  }

  next();
}

module.exports = {
  validateCreateChore,
  validateUpdateChore,
};