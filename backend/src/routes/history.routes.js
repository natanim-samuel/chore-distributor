const express = require("express");

const {
  getHistory,
} = require("../controllers/history.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/households/:householdId/history",
  authenticate,
  getHistory
);

module.exports = router;