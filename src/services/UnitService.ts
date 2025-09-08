import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

import UnitRepo from '@src/repos/UnitRepo';
import { IUnit, UnitStatus } from '@src/models/Unit';


/******************************************************************************
                                Constants
******************************************************************************/

export const UNIT_NOT_FOUND_ERR = 'Unit not found!';


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all units.
 */
type IUnitFilters = Partial<Pick<IUnit, 'name' | 'status' | 'type'>>;

function getAll(filters?: IUnitFilters): Promise<IUnit[]> {
  return UnitRepo.getAll(filters);
}

/**
 * Add one unit.
 */
function createOne(unit: IUnit): Promise<void> {
  return UnitRepo.create(unit);
}

/**
 * Update one unit.
 */
async function updateOne(id: string, unit: Partial<IUnit>): Promise<void> {
  const existingUnit = await UnitRepo.getOne(id);
  if (!existingUnit) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      UNIT_NOT_FOUND_ERR,
    );
  }

  // Business rule: Occupied unit cannot be made Available directly, 
  // must be either Cleaning In Progress or Maintenance Needed.
  if (existingUnit?.status === UnitStatus.Occupied && 
    unit.status === UnitStatus.Available
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Occupied unit cannot be made Available directly, must be either ' +
      'Cleaning In Progress or Maintenance Needed.',
    );
  }

  unit.lastUpdated = new Date().toISOString();

  // Return unit
  return UnitRepo.update(id, unit);
}

/**
 * Get one unit.
 */
function getOne(id: string): Promise<IUnit | null> {
  return UnitRepo.getOne(id);
}


/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAll,
  createOne,
  updateOne,
  getOne,
} as const;
