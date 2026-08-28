const pool = require("../config/database");

function generateInviteCode() {
  return Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();
}

async function generateUniqueInviteCode(client = pool) {
  let inviteCode;
  let exists = true;

  while (exists) {
    inviteCode = generateInviteCode();

    const result = await client.query(
      "SELECT id FROM households WHERE invite_code = $1",
      [inviteCode]
    );

    exists = result.rows.length > 0;
  }

  return inviteCode;
}

async function createHousehold(userId, name) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const inviteCode = await generateUniqueInviteCode(client);

    const householdResult = await client.query(
      `
        INSERT INTO households (
          name,
          owner_id,
          invite_code
        )
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [name.trim(), userId, inviteCode]
    );

    const household = householdResult.rows[0];

    await client.query(
      `
        INSERT INTO household_members (
          household_id,
          user_id,
          role
        )
        VALUES ($1, $2, 'OWNER')
      `,
      [household.id, userId]
    );

    await client.query("COMMIT");

    return household;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getUserHouseholds(userId) {
  const result = await pool.query(
    `
      SELECT
        h.id,
        h.name,
        h.owner_id,
        h.invite_code,
        h.created_at,
        h.updated_at,
        hm.role,
        (
          SELECT COUNT(*)
          FROM household_members hm2
          WHERE hm2.household_id = h.id
          AND hm2.active = true
        ) AS member_count
      FROM households h
      INNER JOIN household_members hm
        ON hm.household_id = h.id
      WHERE hm.user_id = $1
        AND hm.active = true
      ORDER BY h.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

async function getHouseholdById(userId, householdId) {
  const result = await pool.query(
    `
      SELECT
        h.id,
        h.name,
        h.owner_id,
        h.invite_code,
        h.created_at,
        h.updated_at,
        hm.role
      FROM households h
      INNER JOIN household_members hm
        ON hm.household_id = h.id
      WHERE h.id = $1
        AND hm.user_id = $2
        AND hm.active = true
    `,
    [householdId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Household not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

async function joinHousehold(userId, inviteCode) {
  const householdResult = await pool.query(
    `
      SELECT id, name
      FROM households
      WHERE invite_code = $1
    `,
    [inviteCode.trim().toUpperCase()]
  );

  if (householdResult.rows.length === 0) {
    const error = new Error("Invalid invite code.");
    error.statusCode = 404;
    throw error;
  }

  const household = householdResult.rows[0];

  const existingMember = await pool.query(
    `
      SELECT id, active
      FROM household_members
      WHERE household_id = $1
        AND user_id = $2
    `,
    [household.id, userId]
  );

  if (existingMember.rows.length > 0) {
    if (existingMember.rows[0].active) {
      const error = new Error(
        "You are already a member of this household."
      );
      error.statusCode = 409;
      throw error;
    }

    await pool.query(
      `
        UPDATE household_members
        SET active = true,
            role = 'MEMBER'
        WHERE id = $1
      `,
      [existingMember.rows[0].id]
    );
  } else {
    await pool.query(
      `
        INSERT INTO household_members (
          household_id,
          user_id,
          role
        )
        VALUES ($1, $2, 'MEMBER')
      `,
      [household.id, userId]
    );
  }

  return getHouseholdById(userId, household.id);
}

async function getHouseholdMembers(userId, householdId) {
  // First confirm the requesting user belongs to this household.
  await getHouseholdById(userId, householdId);

  const result = await pool.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.profile_image,
        hm.role,
        hm.joined_at,
        hm.active
      FROM household_members hm
      INNER JOIN users u
        ON u.id = hm.user_id
      WHERE hm.household_id = $1
        AND hm.active = true
      ORDER BY
        CASE hm.role
          WHEN 'OWNER' THEN 1
          WHEN 'ADMIN' THEN 2
          ELSE 3
        END,
        hm.joined_at
    `,
    [householdId]
  );

  return result.rows;
}

module.exports = {
  createHousehold,
  getUserHouseholds,
  getHouseholdById,
  joinHousehold,
  getHouseholdMembers,
};