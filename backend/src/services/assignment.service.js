const pool = require("../config/database");
const historyService = require("./history.service");

async function checkHouseholdMembership(userId, householdId) {
  const result = await pool.query(
    `
      SELECT id, role
      FROM household_members
      WHERE household_id = $1
        AND user_id = $2
        AND active = true
    `,
    [householdId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error(
      "You are not a member of this household."
    );

    error.statusCode = 403;

    throw error;
  }

  return result.rows[0];
}

async function createAssignment(userId, householdId, data) {
  await checkHouseholdMembership(userId, householdId);

  const {
    choreId,
    assignedTo,
    assignedDate,
    dueDate,
    notes,
  } = data;

  // Check that the chore belongs to this household.
  const choreResult = await pool.query(
    `
      SELECT id
      FROM chores
      WHERE id = $1
        AND household_id = $2
        AND active = true
    `,
    [choreId, householdId]
  );

  if (choreResult.rows.length === 0) {
    const error = new Error(
      "Chore not found in this household."
    );

    error.statusCode = 404;

    throw error;
  }

  // Check that the assigned user belongs to this household.
  const memberResult = await pool.query(
    `
      SELECT id
      FROM household_members
      WHERE household_id = $1
        AND user_id = $2
        AND active = true
    `,
    [householdId, assignedTo]
  );

  if (memberResult.rows.length === 0) {
    const error = new Error(
      "Assigned user is not a member of this household."
    );

    error.statusCode = 400;

    throw error;
  }

  // Create assignment.
  const result = await pool.query(
    `
      INSERT INTO assignments (
        chore_id,
        household_id,
        assigned_to,
        assigned_by,
        assigned_date,
        due_date,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      choreId,
      householdId,
      assignedTo,
      userId,
      assignedDate,
      dueDate,
      notes || null,
    ]
  );

  const assignment = result.rows[0];

  // Record activity history.
  await historyService.createHistory({
    assignmentId: assignment.id,
    choreId: assignment.chore_id,
    userId,
    householdId: assignment.household_id,
    action: "ASSIGNED",
    oldStatus: null,
    newStatus: assignment.status,
  });

  return assignment;
}

async function getHouseholdAssignments(
  userId,
  householdId
) {
  await checkHouseholdMembership(
    userId,
    householdId
  );

  const result = await pool.query(
    `
      SELECT
        a.*,

        c.title AS chore_title,
        c.description AS chore_description,

        assigned_user.name AS assigned_to_name,
        assigned_user.email AS assigned_to_email,

        assigner.name AS assigned_by_name

      FROM assignments a

      INNER JOIN chores c
        ON c.id = a.chore_id

      INNER JOIN users assigned_user
        ON assigned_user.id = a.assigned_to

      LEFT JOIN users assigner
        ON assigner.id = a.assigned_by

      WHERE a.household_id = $1

      ORDER BY
        a.due_date ASC,
        a.created_at DESC
    `,
    [householdId]
  );

  return result.rows;
}

async function updateAssignmentStatus(
  userId,
  assignmentId,
  status
) {
  const assignmentResult = await pool.query(
    `
      SELECT *
      FROM assignments
      WHERE id = $1
    `,
    [assignmentId]
  );

  if (assignmentResult.rows.length === 0) {
    const error = new Error(
      "Assignment not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const assignment = assignmentResult.rows[0];

  const membership = await checkHouseholdMembership(
    userId,
    assignment.household_id
  );

  // Assigned user, owner, or admin can update.
  const canManage =
    assignment.assigned_to === userId ||
    membership.role === "OWNER" ||
    membership.role === "ADMIN";

  if (!canManage) {
    const error = new Error(
      "You do not have permission to update this assignment."
    );

    error.statusCode = 403;

    throw error;
  }

  // Save the current status BEFORE updating.
  const oldStatus = assignment.status;

  const completedAt =
    status === "COMPLETED"
      ? new Date()
      : null;

  const result = await pool.query(
    `
      UPDATE assignments
      SET
        status = $1,
        completed_at = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `,
    [
      status,
      completedAt,
      assignmentId,
    ]
  );

  const updatedAssignment = result.rows[0];

  // Only create history if the status actually changed.
  if (oldStatus !== updatedAssignment.status) {
    await historyService.createHistory({
      assignmentId: updatedAssignment.id,
      choreId: updatedAssignment.chore_id,
      userId,
      householdId: updatedAssignment.household_id,
      action: "STATUS_CHANGED",
      oldStatus,
      newStatus: updatedAssignment.status,
    });
  }

  return updatedAssignment;
}

async function deleteAssignment(
  userId,
  assignmentId
) {
  const assignmentResult = await pool.query(
    `
      SELECT *
      FROM assignments
      WHERE id = $1
    `,
    [assignmentId]
  );

  if (assignmentResult.rows.length === 0) {
    const error = new Error(
      "Assignment not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const assignment = assignmentResult.rows[0];

  const membership =
    await checkHouseholdMembership(
      userId,
      assignment.household_id
    );

  if (
    membership.role !== "OWNER" &&
    membership.role !== "ADMIN"
  ) {
    const error = new Error(
      "Only household owners or admins can delete assignments."
    );

    error.statusCode = 403;

    throw error;
  }

  // Record deletion before deleting because the assignment ID
  // may become NULL in chore_history due to the foreign key rule.
  await historyService.createHistory({
    assignmentId: assignment.id,
    choreId: assignment.chore_id,
    userId,
    householdId: assignment.household_id,
    action: "DELETED",
    oldStatus: assignment.status,
    newStatus: null,
  });

  await pool.query(
    `
      DELETE FROM assignments
      WHERE id = $1
    `,
    [assignmentId]
  );
}

module.exports = {
  createAssignment,
  getHouseholdAssignments,
  updateAssignmentStatus,
  deleteAssignment,
};