const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const router = express.Router();
const {
  addActivityToRoutine,
  getRoutineActivityById,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
} = require('../db');

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', async (req, res, next) => {
  const { count, duration } = req.body;
  const { routineActivityId } = req.params;
  const user = jwt.decode(req.headers.authorization.replace('Bearer ', ''), {
    complete: true,
  });

  try {
    const canEdit = await canEditRoutineActivity(
      routineActivityId,
      user.payload.id
    );
    if (!canEdit) {
      res.status(403).send({
        error: 'Error deletting.',
        message: `User ${user.payload.username} is not allowed to update In the evening`,
        name: 'Not allowed',
      });
      return;
    }

    const activities = await updateRoutineActivity({
      id: routineActivityId,
      count,
      duration,
    });
    res.send(activities);
  } catch ({ name, message }) {
    res.send({
      error: 'Duplicate error',
      name,
      message: 'An activity with name Push Ups already exists',
    });
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId', async (req, res, next) => {
  const { routineActivityId } = req.params;
  const user = jwt.decode(req.headers.authorization.replace('Bearer ', ''), {
    complete: true,
  });

  try {
    const canEdit = await canEditRoutineActivity(
      routineActivityId,
      user.payload.id
    );
    if (!canEdit) {
      res.status(403).send({
        error: 'Error deletting.',
        message: `User ${user.payload.username} is not allowed to delete In the afternoon`,
        name: 'Not allowed',
      });
      return;
    }

    const activities = await destroyRoutineActivity(routineActivityId);
    res.send(activities);
  } catch ({ name, message }) {
    res.send({
      error: 'Duplicate error',
      name,
      message: 'An activity with name Push Ups already exists',
    });
  }
});

module.exports = router;
