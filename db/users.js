const client = require("./client");
//const bcrypt = require('bcrypt');

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    INSERT INTO users(username, password)
    VALUES($1, $2)
    ON CONFLICT (USERNAME) DO NOTHING
    RETURNING *
    `,
      [username, password]
    );

    user.password = undefined;
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const {
      rows: [user],
    } = await client.query(`
      SELECT id, username
      FROM users WHERE username='${username}' and password='${password}'
    `);
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(`
      SELECT id, username
      FROM users WHERE id =${userId} 
    `);
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function getUserByUsername(userName) {
  try {
    const {
      rows: [user],
    } = await client.query(`
      SELECT id, username, password
      FROM users WHERE username ='${userName}' 
    `);
    return user;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
