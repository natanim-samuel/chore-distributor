const pool = require("../config/database");

async function createHistory({
  assignmentId = null,
  choreId,
  userId,
  householdId,
  action,
  oldStatus = null,
  newStatus = null,
}) {
  const result = await pool.query(
    `
      INSERT INTO chore_history (
        assignment_id,
        chore_id,
        user_id,
        household_id,
        action,
        old_status,
        new_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      assignmentId,
      choreId,
      userId,
      householdId,
      action,
      oldStatus,
      newStatus,
    ]
  );

  return result.rows[0];
}

async function checkHouseholdMembership(userId, householdId) {
    console.log("=================================");
    console.log("CHECKING HISTORY MEMBERSHIP");
    console.log("USER ID:", userId);
    console.log("HOUSEHOLD ID:", householdId);
    console.log("=================================");

  const result = await pool.query(
    `
      SELECT
        id,
        household_id,
        user_id,
        role,
        active
      FROM household_members
      WHERE household_id = $1
        AND user_id = $2
        AND active = true
    `,
    [householdId, userId]
  );

  console.log("Membership result:", result.rows);

  if (result.rows.length === 0) {
    const error = new Error(
      "You are not a member of this household."
    );

    error.statusCode = 403;

    throw error;
  }

  return result.rows[0];
}

async function getHouseholdHistory(userId, householdId) {
  await checkHouseholdMembership(
    userId,
    householdId
  );

  const result = await pool.query(
    `
      SELECT
        ch.id,
        ch.assignment_id,
        ch.chore_id,
        ch.user_id,
        ch.household_id,
        ch.action,
        ch.old_status,
        ch.new_status,
        ch.created_at,

        u.name AS user_name,

        c.title AS chore_title

      FROM chore_history ch

      INNER JOIN users u
        ON u.id = ch.user_id

      INNER JOIN chores c
        ON c.id = ch.chore_id

      WHERE ch.household_id = $1

      ORDER BY ch.created_at DESC
    `,
    [householdId]
  );

  return result.rows;
}

module.exports = {
  createHistory,
  checkHouseholdMembership,
  getHouseholdHistory,
};