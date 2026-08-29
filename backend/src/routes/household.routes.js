const express = require("express");

const {
  create,
  getAll,
  getById,
  join,
  getMembers,
} = require("../controllers/household.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, create);

router.get("/", authenticate, getAll);

router.post("/join", authenticate, join);

router.get("/:id", authenticate, getById);

router.get("/:id/members", authenticate, getMembers);

module.exports = router;