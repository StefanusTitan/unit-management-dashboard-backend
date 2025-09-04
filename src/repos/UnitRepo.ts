import { IUnit } from '@src/models/Unit';
import { getRandomInt } from '@src/common/util/misc';

import orm from './MockOrm';


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * See if a user with the given id exists.
 */
async function persists(id: string): Promise<boolean> {
  const db = await orm.openDb();
  for (const unit of db.units) {
    if (unit.id === id) {
      return true;
    }
  }
  return false;
}

/**
 * Get all units.
 */
async function getAll(): Promise<IUnit[]> {
  const db = await orm.openDb();
  return db.units;
}

/**
 * Add one unit.
 */
async function create(unit: IUnit): Promise<void> {
  const db = await orm.openDb();
  db.units.push(unit);
  return orm.saveDb(db);
}

/**
 * Update a unit.
 */
async function update(id: string, unit: Partial<IUnit>): Promise<void> {
  const db = await orm.openDb();
  for (let i = 0; i < db.units.length; i++) {
    if (db.units[i].id === id) {
      const dbUnit = db.units[i];
      db.units[i] = {
        ...dbUnit,
        ...unit,
      };
      return orm.saveDb(db);
    }
  }
}

/**
 * Get one unit.
 */
async function getOne(id: string): Promise<IUnit | null> {
  const db = await orm.openDb();
  for (const unit of db.units) {
    if (unit.id === id) {
      return unit;
    }
  }
  return null;
}

// **** Unit-Tests Only **** //

/**
 * Delete every unit record.
 */
async function deleteAllUnits(): Promise<void> {
  const db = await orm.openDb();
  db.units = [];
  return orm.saveDb(db);
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getOne,
  persists,
  getAll,
  create,
  update,
  deleteAllUnits,
} as const;
