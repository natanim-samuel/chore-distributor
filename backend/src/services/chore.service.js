const pool = require("../config/database");

// Check whether the user belongs to a household
async function getMembership(householdId, userId) {
  const result = await pool.query(
    `
      SELECT *
      FROM household_members
      WHERE household_id = $1
        AND user_id = $2
        AND active = true
    `,
    [householdId, userId]
  );

  return result.rows[0];
}

async function createChore(householdId, userId, data) {
  const membership = await getMembership(
    householdId,
    userId
  );

  if (!membership) {
    const error = new Error(
      "You are not a member of this household."
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    title,
    description = null,
    categoryId = null,
    difficulty = 2,
    priority = "MEDIUM",
    frequency = "ONCE",
    estimatedMinutes = null,
    dueTime = null,
    startDate = null,
  } = data;

  const result = await pool.query(
    `
      INSERT INTO chores (
        household_id,
        category_id,
        created_by,
        title,
        description,
        difficulty,
        priority,
        frequency,
        estimated_minutes,
        due_time,
        start_date
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11
      )
      RETURNING *
    `,
    [
      householdId,
      categoryId,
      userId,
      title.trim(),
      description,
      difficulty,
      priority,
      frequency,
      estimatedMinutes,
      dueTime,
      startDate,
    ]
  );

  return result.rows[0];
}

async function getHouseholdChores(householdId, userId) {
  const membership = await getMembership(
    householdId,
    userId
  );

  if (!membership) {
    const error = new Error(
      "You are not a member of this household."
    );
    error.statusCode = 403;
    throw error;
  }

  const result = await pool.query(
    `
      SELECT
        chores.*,
        categories.name AS category_name,
        categories.icon AS category_icon,
        users.name AS created_by_name
      FROM chores
      LEFT JOIN categories
        ON chores.category_id = categories.id
      JOIN users
        ON chores.created_by = users.id
      WHERE chores.household_id = $1
        AND chores.active = true
      ORDER BY chores.created_at DESC
    `,
    [householdId]
  );

  return result.rows;
}

async function getChoreById(choreId, userId) {
  const result = await pool.query(
    `
      SELECT
        chores.*,
        categories.name AS category_name,
        categories.icon AS category_icon,
        users.name AS created_by_name
      FROM chores
      LEFT JOIN categories
        ON chores.category_id = categories.id
      JOIN users
        ON chores.created_by = users.id
      JOIN household_members
        ON household_members.household_id =
           chores.household_id
      WHERE chores.id = $1
        AND household_members.user_id = $2
        AND household_members.active = true
    `,
    [choreId, userId]
  );

  if (!result.rows[0]) {
    const error = new Error(
      "Chore not found or access denied."
    );
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

async function updateChore(choreId, userId, data) {
  const chore = await getChoreById(choreId, userId);

  const membership = await getMembership(
    chore.household_id,
    userId
  );

  // Only OWNER or ADMIN can edit chores
  if (
    membership.role !== "OWNER" &&
    membership.role !== "ADMIN"
  ) {
    const error = new Error(
      "Only household owners or admins can edit chores."
    );
    error.statusCode = 403;
    throw error;
  }

  const updated = {
    title:
      data.title !== undefined
        ? data.title.trim()
        : chore.title,

    description:
      data.description !== undefined
        ? data.description
        : chore.description,

    categoryId:
      data.categoryId !== undefined
        ? data.categoryId
        : chore.category_id,

    difficulty:
      data.difficulty !== undefined
        ? data.difficulty
        : chore.difficulty,

    priority:
      data.priority !== undefined
        ? data.priority
        : chore.priority,

    frequency:
      data.frequency !== undefined
        ? data.frequency
        : chore.frequency,

    estimatedMinutes:
      data.estimatedMinutes !== undefined
        ? data.estimatedMinutes
        : chore.estimated_minutes,

    dueTime:
      data.dueTime !== undefined
        ? data.dueTime
        : chore.due_time,

    startDate:
      data.startDate !== undefined
        ? data.startDate
        : chore.start_date,

    active:
      data.active !== undefined
        ? data.active
        : chore.active,
  };

  const result = await pool.query(
    `
      UPDATE chores
      SET
        title = $1,
        description = $2,
        category_id = $3,
        difficulty = $4,
        priority = $5,
        frequency = $6,
        estimated_minutes = $7,
        due_time = $8,
        start_date = $9,
        active = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `,
    [
      updated.title,
      updated.description,
      updated.categoryId,
      updated.difficulty,
      updated.priority,
      updated.frequency,
      updated.estimatedMinutes,
      updated.dueTime,
      updated.startDate,
      updated.active,
      choreId,
    ]
  );

  return result.rows[0];
}

async function deleteChore(choreId, userId) {
  const chore = await getChoreById(choreId, userId);

  const membership = await getMembership(
    chore.household_id,
    userId
  );

  if (
    membership.role !== "OWNER" &&
    membership.role !== "ADMIN"
  ) {
    const error = new Error(
      "Only household owners or admins can delete chores."
    );
    error.statusCode = 403;
    throw error;
  }

  await pool.query(
    `
      UPDATE chores
      SET active = false,
          updated_at = NOW()
      WHERE id = $1
    `,
    [choreId]
  );
}

module.exports = {
  createChore,
  getHouseholdChores,
  getChoreById,
  updateChore,
  deleteChore,
};