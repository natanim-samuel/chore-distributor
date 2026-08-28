const pool = require("../config/database");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password");
const { generateAccessToken } = require("../utils/jwt");

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, profile_image, created_at
    `,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const user = result.rows[0];

  const accessToken = generateAccessToken(user);

  return {
    user,
    accessToken,
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        profile_image,
        created_at
      FROM users
      WHERE email = $1
    `,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  const passwordIsValid = await comparePassword(
    password,
    user.password_hash
  );

  if (!passwordIsValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  delete user.password_hash;

  const accessToken = generateAccessToken(user);

  return {
    user,
    accessToken,
  };
}

async function getUserById(userId) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        profile_image,
        created_at
      FROM users
      WHERE id = $1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};