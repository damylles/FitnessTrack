const client = require('./client');

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routines],
    } = await client.query(
      `
      INSERT INTO routines(name, "creatorId", "isPublic", goal )
      VALUES($1, $2, $3, $4)
      RETURNING *
    `,
      [name, creatorId, isPublic, goal]
    );

    return routines;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: routine } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal 
      FROM routines as r WHERE r.id=${id};
    `);
    return routine[0];
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal 
      FROM routines as r LEFT JOIN routine_activities as ra ON r.id = ra."routineId"
      WHERE ra."activityId" IS NULL ;
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal, u.username as "creatorName"
      FROM routines as r JOIN users as u ON r."creatorId"=u.id;
    `);

    return await Promise.all(
      routines.map(async (routine) => {
        const { rows: activities } = await client.query(`
          SELECT a.id, a.name, a.description, ra.duration, ra.count, ra."routineId", ra.id as "routineActivityId"
          FROM activities as a LEFT JOIN routine_activities as ra ON a.id = ra."activityId"
          WHERE ra."routineId"=${routine.id}
        `);
        routine.activities = activities;
        return routine;
      })
    );
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal, u.username as "creatorName"
      FROM routines as r JOIN users as u ON r."creatorId"=u.id
      WHERE r."isPublic"=true;
    `);

    return await Promise.all(
      routines.map(async (routine) => {
        const { rows: activities } = await client.query(`
          SELECT a.id, a.name, a.description, ra.duration, ra.count, ra."routineId", ra.id as "routineActivityId"
          FROM activities as a LEFT JOIN routine_activities as ra ON a.id = ra."activityId"
          WHERE ra."routineId"=${routine.id}
        `);
        routine.activities = activities;
        return routine;
      })
    );
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal, u.username as "creatorName"
      FROM routines as r JOIN users as u ON r."creatorId"=u.id
      WHERE u.username = '${username}';
    `);

    return await Promise.all(
      routines.map(async (routine) => {
        const { rows: activities } = await client.query(`
          SELECT a.id, a.name, a.description, ra.duration, ra.count, ra."routineId", ra.id as "routineActivityId"
          FROM activities as a LEFT JOIN routine_activities as ra ON a.id = ra."activityId"
          WHERE ra."routineId"=${routine.id}
        `);
        routine.activities = activities;
        return routine;
      })
    );
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal, u.username as "creatorName"
      FROM routines as r JOIN users as u ON r."creatorId"=u.id
      WHERE r."isPublic"=true AND u.username = '${username}';
    `);

    return await Promise.all(
      routines.map(async (routine) => {
        const { rows: activities } = await client.query(`
          SELECT a.id, a.name, a.description, ra.duration, ra.count, ra."routineId", ra.id as "routineActivityId"
          FROM activities as a LEFT JOIN routine_activities as ra ON a.id = ra."activityId"
          WHERE ra."routineId"=${routine.id}
        `);
        routine.activities = activities;
        return routine;
      })
    );
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal, u.username as "creatorName"
      FROM routines as r LEFT JOIN routine_activities as ra ON ra."routineId"=r.id JOIN users as u ON r."creatorId"=u.id
      WHERE r."isPublic"=true AND ra."activityId"=${id};
    `);

    return await Promise.all(
      routines.map(async (routine) => {
        const { rows: activities } = await client.query(`
          SELECT a.id, a.name, a.description, ra.duration, ra.count, ra."routineId", ra.id as "routineActivityId"
          FROM activities as a LEFT JOIN routine_activities as ra ON a.id = ra."activityId"
          WHERE ra."routineId"=${routine.id}
        `);
        routine.activities = activities;
        return routine;
      })
    );
    return true;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    let updateParam = [];
    const { isPublic } = fields;
    const { name } = fields;
    const { goal } = fields;

    if (isPublic !== undefined) {
      updateParam.push(`"isPublic"=${isPublic}`);
    }

    if (name !== undefined) {
      updateParam.push(`name='${name}'`);
    }

    if (goal !== undefined) {
      updateParam.push(`goal='${goal}'`);
    }

    const { rows: routine } = await client.query(`
    UPDATE routines 
    SET ${updateParam.join(',')}
    WHERE id=${id}
    RETURNING *;
    `);
    return routine[0];
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(`
    DELETE FROM routine_activities
    WHERE "routineId"=${id};
    `);

    await client.query(`
    DELETE FROM routines 
    WHERE id=${id};
    `);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
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
};
