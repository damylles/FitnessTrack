const express = require('express');
const {
  updateActivity,
  createActivity,
  getAllActivities,
  getActivityById,
  getRoutineActivityById,
  getPublicRoutinesByActivity,
} = require('../db');
const router = express.Router();

// GET /api/activities
router.get('/', async (req, res, next) => {
  try {
    const activities = await getAllActivities();

    res.send(activities);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// GET /api/activities/:activityId/routines

router.get('/:activityId/routines', async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const getById = await getActivityById(activityId);
    if (!getById) {
      res.send({
        error: 'Error updating',
        name,
        message: `Activity ${activityId} not found`,
      });
      return;
    }

    const activities = await getPublicRoutinesByActivity(activityId);

    res.send(activities);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/activities
router.post('/', async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const activities = await createActivity({ name, description });

    res.send(activities);
  } catch ({ name, message }) {
    res.send({
      error: 'Duplicate error',
      name,
      message: 'An activity with name Push Ups already exists',
    });
  }
});

// PATCH /api/activities/:activityId
router.patch('/:activityId', async (req, res, next) => {
  const { name, description } = req.body;
  const { activityId } = req.params;
  try {
    const getById = await getActivityById(activityId);
    if (!getById) {
      res.send({
        error: 'Error updating',
        name,
        message: `Activity ${activityId} not found`,
      });
      return;
    }

    const activity = await updateActivity({
      id: activityId,
      name,
      description,
    });

    res.send(activity);
  } catch ({ name, message }) {
    res.send({
      error: 'Error updating',
      name,
      message: 'An activity with name Aerobics already exists',
    });
  }
});

module.exports = router;
