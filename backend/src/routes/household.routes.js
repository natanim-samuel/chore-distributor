const express = require("express");

const {
  create,
  getAll,
  getById,
  join,
  getMembers,
} = require("../controllers/household.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

// All household routes require authentication.
router.use(authenticate);

// GET /api/households
router.get("/", getAll);

// POST /api/households
router.post("/", create);

// POST /api/households/join
router.post("/join", join);

// GET /api/households/:id
router.get("/:id", getById);

// GET /api/households/:id/members
router.get("/:id/members", getMembers);

module.exports = router;