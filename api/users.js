/* eslint-disable no-useless-catch */
const express = require('express');
const router = express.Router();

// POST /api/users/register

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
} = require('../db/users');

const {
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
} = require('../db/routines');

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, JWT_SECRET);
};

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  // Check if the username is already taken
  const existingUser = await getUserByUsername(username);
  if (password && password.length < 8) {
    res.send({
      error: 'Error',
      message: 'Password Too Short!',
      name: username,
    });
  } else if (existingUser) {
    res.send({
      error: 'Error',
      message: `User ${existingUser.username} is already taken.`,
      name: username,
    });
  } else {
    // new user account
    const newUser = await createUser({ username, password });

    // Generate a JSON Web Token (JWT) for authentication
    const token = generateToken(newUser.id, newUser.username);

    res.send({
      message: 'Thanks for signing up for our service.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  }
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists in the database
    const user = await getUserByUsername(username);
    // Check if the password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!user) {
      // If the user doesn't exist, send an appropriate error response
      return next({
        message: 'Invalid username',
      });
    }

    if (isPasswordMatch) {
      // If the password doesn't match, send an appropriate error response
      return next({
        message: 'Invalid password',
      });
    }

    const token = generateToken(user.id, user.username);

    // Return the response
    res.send({
      message: "you're logged in!",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        password: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me
router.get('/me', async (req, res, next) => {
  try {
    // Get the current user based on the authentication token
    if (!req.headers.authorization) {
      res.status(401).send({
        error: 'error',
        message: 'You must be logged in to perform this action',
        name: 'undefined',
      });
      return;
    } else {
      const user = jwt.decode(
        req.headers.authorization.replace('Bearer ', ''),
        {
          complete: true,
        }
      );

      res.send({
        id: user.payload.id,
        username: user.payload.username,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/:username/routines', getUserRoutines);

async function getUserRoutines(req, res, next) {
  try {
    const { username } = req.params;

    const [publicRoutines, allRoutines] = await Promise.all([
      getPublicRoutinesByUser({ username }),
      getAllRoutinesByUser({ username }),
    ]);

    if (req.user && req.user.username === username) {
      res.send(allRoutines);
    } else {
      res.send(publicRoutines);
    }
  } catch (error) {
    next(error);
  }
}

module.exports = router;
