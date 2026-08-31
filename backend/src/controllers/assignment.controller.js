const assignmentService = require(
  "../services/assignment.service"
);

const VALID_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "OVERDUE",
  "SKIPPED",
];

async function create(req, res, next) {
  try {
    const {
      choreId,
      assignedTo,
      assignedDate,
      dueDate,
    } = req.body;

    if (
      !choreId ||
      !assignedTo ||
      !assignedDate ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "choreId, assignedTo, assignedDate and dueDate are required.",
      });
    }

    const assignment =
      await assignmentService.createAssignment(
        req.user.userId,
        req.params.householdId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Chore assigned successfully.",
      data: {
        assignment,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const assignments =
      await assignmentService.getHouseholdAssignments(
        req.user.userId,
        req.params.householdId
      );

    return res.json({
      success: true,
      data: {
        assignments,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment status.",
      });
    }

    const assignment =
      await assignmentService.updateAssignmentStatus(
        req.user.userId,
        req.params.id,
        status
      );

    return res.json({
      success: true,
      message: "Assignment status updated.",
      data: {
        assignment,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await assignmentService.deleteAssignment(
      req.user.userId,
      req.params.id
    );

    return res.json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getAll,
  updateStatus,
  remove,
};