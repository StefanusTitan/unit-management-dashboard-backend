import { isString } from 'jet-validators';
import { parseObject, TParseOnError } from 'jet-validators/utils';
import { uuid } from 'uuidv4';

import { isRelationalKey, transIsDate } from '@src/common/util/validators';
import { IModel } from './common/types';


/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_UNIT_VALS = (): IUnit => ({
  id: uuid(),
  name: '',
  type: Type.Capsule,
  status: UnitStatus.Available,
  lastUpdated: new Date().toISOString(),
});


/******************************************************************************
                                  Types
******************************************************************************/

export interface IUnit extends IModel {
  name: string;
  type: Type;
  status: UnitStatus;
}


export enum UnitStatus {
  Available = 'Available',
  Occupied = 'Occupied',
  CleaningInProgress = 'Cleaning In Progress',
  MaintenanceNeeded = 'Maintenance Needed',
}

export enum Type {
  Capsule = 'capsule',
  Cabin = 'cabin',
}


/******************************************************************************
                                  Setup
******************************************************************************/

// Custom validator for UnitStatus enum
const isUnitStatus = (val: unknown): val is UnitStatus => {
  return typeof val === 'string' && Object.values(UnitStatus).includes(val as UnitStatus);
};

const isType = (val: unknown): val is Type => {
  return typeof val === 'string' && Object.values(Type).includes(val as Type);
}

// Initialize the "parseUnit" function
const parseUnit = parseObject<IUnit>({
  id: isRelationalKey,
  name: isString,
  type: isType,
  status: isUnitStatus,
  lastUpdated: transIsDate,
});

// Parser for incoming create payload
const parseUnitCreate = parseObject<Pick<IUnit, 'name' | 'type' | 'status'>>({
  name: isString,
  type: isType,
  status: isUnitStatus,
});


/******************************************************************************
                                 Functions
******************************************************************************/

/**
 * New unit object.
 */
function __new__(unit?: Partial<IUnit>): IUnit {
  const retVal = { ...DEFAULT_UNIT_VALS(), ...unit };
  return parseUnit(retVal, errors => {
    throw new Error('Setup new unit failed ' + JSON.stringify(errors, null, 2));
  });
}

/**
 * Check is a unit object. For the route validation.
 */
function test(arg: unknown, errCb?: TParseOnError): arg is IUnit {
  return !!parseUnit(arg, errCb);
}

/**
 * Validate raw create request payload (without id/lastUpdated).
 */
function testCreate(arg: unknown, errCb?: TParseOnError): arg is Pick<IUnit, 'name' | 'type' | 'status'> {
  return !!parseUnitCreate(arg, errCb);
}


/******************************************************************************
                                Export default
******************************************************************************/

export default {
  new: __new__,
  test,
  testCreate,
} as const;