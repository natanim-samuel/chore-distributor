const express = require("express");

const router = express.Router();

const choreController = require("../controllers/chore.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  validateCreateChore,
  validateUpdateChore,
} = require("../validators/chore.validator");


console.log({
  authenticate: typeof authenticate,
  validateCreateChore: typeof validateCreateChore,
  createChore: typeof choreController.createChore,
});


router.post(
  "/households/:householdId/chores",
  authenticate,
  validateCreateChore,
  choreController.createChore
);


router.get(
  "/households/:householdId/chores",
  authenticate,
  choreController.getHouseholdChores
);


router.get(
  "/chores/:id",
  authenticate,
  choreController.getChore
);


router.patch(
  "/chores/:id",
  authenticate,
  validateUpdateChore,
  choreController.updateChore
);


router.delete(
  "/chores/:id",
  authenticate,
  choreController.deleteChore
);


module.exports = router;