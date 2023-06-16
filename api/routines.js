const express = require('express');
const router = express.Router();
const {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
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

  try {
    const routine = await createRoutine({ isPublic, name, goal });

    res.send(routine);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/routines/:routineId

router.patch('/:routineId', async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const { routineId } = req.params;
  console.log('hello ', req.body);
  console.log('hello2 ', req.params);

  try {
    const routine = await updateRoutine({
      id: routineId,
      creatorId,
      isPublic,
      name,
      goal,
    });

    res.send(routine);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// DELETE /api/routines/:routineId

router.delete('/:routineId', async (req, res, next) => {
  const { routineId } = req.params;

  console.log('hello2 ', req.params);

  try {
    const routine = await destroyRoutine(routineId);
    console.log('hello3 ', routine);

    res.send(routine);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/routines/:routineId/activities

module.exports = router;
