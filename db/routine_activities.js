const client = require('./client');

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routines],
    } = await client.query(
      `
        INSERT INTO routine_activities("routineId", "activityId", duration, count)
        VALUES($1, $2, $3, $4)
        RETURNING *
      `,
      [routineId, activityId, duration, count]
    );
    return routines;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(`
      SELECT *
      FROM routine_activities as ra
      WHERE ra.id=${id};
    `);

    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routine } = await client.query(`
      SELECT *
      FROM routine_activities as ra
      WHERE ra."routineId"=${id};
    `);

    return routine;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    let updateParam = [];
    const { count } = fields;
    const { duration } = fields;

    if (count !== undefined) {
      updateParam.push(`count=${count}`);
    }

    if (duration !== undefined) {
      updateParam.push(`duration='${duration}'`);
    }

    const { rows: routine } = await client.query(`
    UPDATE routine_activities 
    SET ${updateParam.join(',')}
    WHERE id=${id}
    RETURNING *;
    `);
    return routine[0];
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const routine = getRoutineActivityById(id);

    await client.query(`
    DELETE FROM routine_activities
    WHERE id=${id};
    `);
    return routine;
  } catch (error) {
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: routines } = await client.query(`
      SELECT r.id, r."creatorId", r."isPublic", r.name, r.goal, u.username as "creatorName"
      FROM routines as r LEFT JOIN routine_activities as ra ON ra."routineId"=r.id JOIN users as u ON r."creatorId"=u.id
      WHERE u.id = '${userId}' AND ra.id=${routineActivityId};
    `);

    if (routines.length > 0) return true;
    else return false;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
