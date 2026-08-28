function validateCreateHouseholdInput({ name }) {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name =
      "Household name must be at least 2 characters.";
  }

  if (name && name.trim().length > 100) {
    errors.name =
      "Household name cannot exceed 100 characters.";
  }

  return errors;
}

function validateJoinHouseholdInput({ inviteCode }) {
  const errors = {};

  if (!inviteCode || inviteCode.trim().length === 0) {
    errors.inviteCode = "Invite code is required.";
  }

  return errors;
}

module.exports = {
  validateCreateHouseholdInput,
  validateJoinHouseholdInput,
};