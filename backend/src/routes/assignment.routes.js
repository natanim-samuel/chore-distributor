const express = require("express");

const router = express.Router();

const { authenticate } = require(
  "../middleware/auth.middleware"
);

const assignmentController = require(
  "../controllers/assignment.controller"
);

// Get all assignments in a household
router.get(
  "/households/:householdId/assignments",
  authenticate,
  assignmentController.getAll
);

// Create an assignment
router.post(
  "/households/:householdId/assignments",
  authenticate,
  assignmentController.create
);

// Update assignment status
router.patch(
  "/assignments/:id/status",
  authenticate,
  assignmentController.updateStatus
);

// Delete assignment
router.delete(
  "/assignments/:id",
  authenticate,
  assignmentController.remove
);

module.exports = router;