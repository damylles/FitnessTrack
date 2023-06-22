const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const {
  getRoutineById,
  getRoutinesWithoutActivities,
  getRoutineActivitiesByRoutine,
  getAllRoutines,
  getAllPublicRoutines,
  destroyRoutineActivity,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  addActivityToRoutine,
} = require('../db');

// GET /api/routines
router.get('/', async (req, res, next) => {
  try {
    const activities = await getAllPublicRoutines();

    res.send(activities);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/routines
router.post('/', async (req, res, next) => {
  const { isPublic, name, goal } = req.body;

  if (!req.headers.authorization) {
    res.send({
      error: 'Error',
      message: 'You must be logged in to perform this action',
      name: 'Logged in error',
    });
  } else {
    const user = jwt.decode(req.headers.authorization.replace('Bearer ', ''), {
      complete: true,
    });

    const routine = await createRoutine({
      creatorId: user.payload.id,
      isPublic,
      name,
      goal,
    });

    res.send(routine);
  }
});

// PATCH /api/routines/:routineId

router.patch('/:routineId', async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const { routineId } = req.params;

  if (!req.headers.authorization) {
    res.send({
      error: 'Error',
      message: 'You must be logged in to perform this action',
      name: 'Logged in error',
    });
  } else {
    const rTest = await getRoutineById(routineId);
    const user = jwt.decode(req.headers.authorization.replace('Bearer ', ''), {
      complete: true,
    });
    if (rTest.creatorId != user.payload.id) {
      res.status(403).send({
        error: 'Error',
        message: `User ${user.payload.username} is not allowed to update Every day`,
        name: 'Logged in error',
      });
    }

    const routine = await updateRoutine({
      id: routineId,
      isPublic,
      name,
      goal,
    });

    res.send(routine);
  }
});

// DELETE /api/routines/:routineId

router.delete('/:routineId', async (req, res, next) => {
  const { routineId } = req.params;

  const rTest = await getRoutineById(routineId);
  const user = jwt.decode(req.headers.authorization.replace('Bearer ', ''), {
    complete: true,
  });
  if (rTest[0].creatorId != user.payload.id) {
    res.status(403).send({
      error: 'Error',
      message: `User ${user.payload.username} is not allowed to delete On even days`,
      name: 'Logged in error',
    });
  } else {
    const routine = await getRoutineById(routineId);
    const deleted = await destroyRoutine(routineId);

    res.send(routine);
  }
});

// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId } = req.body;

  try {
    const routines = await addActivityToRoutine(req.body);
    res.send(routines);
  } catch (error) {
    res.send({
      error: '',
      message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
      name: '',
    });
  }
});

module.exports = router;
