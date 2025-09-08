import insertUrlParams from 'inserturlparams';

import UnitRepo from '@src/repos/UnitRepo';
import Unit, { IUnit, UnitStatus, Type } from '@src/models/Unit';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { UNIT_NOT_FOUND_ERR } from '@src/services/UnitService';

import Paths from './common/Paths';
import { agent } from './support/setup';


/******************************************************************************
                               Constants
******************************************************************************/

// Note: Unit.new always initializes status to Available regardless of provided override.
// We'll create two units then manually set one to Occupied for transition tests.
const DB_UNITS = [
  { name: 'Test-Capsule', type: Type.Capsule },
  { name: 'Test-Cabin', type: Type.Cabin },
] as const;


/******************************************************************************
                                 Tests
******************************************************************************/

describe('Unit status transitions', () => {

  let dbUnits: IUnit[] = [];

  beforeEach(async () => {
    await UnitRepo.deleteAllUnits();
    // Create fresh units (all start as Available)
    for (const u of DB_UNITS) {
      const unitObj = Unit.new({ name: u.name, type: u.type });
      await UnitRepo.create(unitObj as IUnit);
    }
    dbUnits = await UnitRepo.getAll();
    // Set first unit to Occupied to test transitions
    const first = dbUnits[0];
    await UnitRepo.update(first.id, { status: UnitStatus.Occupied });
    dbUnits = await UnitRepo.getAll();
  });

  // Helper to build update path
  const updatePath = (id: string) => insertUrlParams(Paths.Units.Update, { id });

  it('should forbid making an Occupied unit directly Available', async () => {
    const occupied = dbUnits.find(u => u.status === UnitStatus.Occupied)!;
    const res = await agent.put(updatePath(occupied.id)).send({ unit: { status: UnitStatus.Available } });
    expect(res.status).toBe(HttpStatusCodes.BAD_REQUEST);
  });

  it('should allow changing Occupied to Cleaning In Progress', async () => {
    const occupied = dbUnits.find(u => u.status === UnitStatus.Occupied)!;
    const res = await agent.put(updatePath(occupied.id)).send({ unit: { status: UnitStatus.CleaningInProgress } });
    expect(res.status).toBe(HttpStatusCodes.OK);
    expect(res.body.unit.status).toBe(UnitStatus.CleaningInProgress);
  });

  it('should allow changing Occupied to Maintenance Needed', async () => {
    const occupied = dbUnits.find(u => u.status === UnitStatus.Occupied)!;
    const res = await agent.put(updatePath(occupied.id)).send({ unit: { status: UnitStatus.MaintenanceNeeded } });
    expect(res.status).toBe(HttpStatusCodes.OK);
    expect(res.body.unit.status).toBe(UnitStatus.MaintenanceNeeded);
  });

  it('should return NOT_FOUND for non-existent unit id', async () => {
    const res = await agent.put(updatePath('non-existent-id')).send({ unit: { status: UnitStatus.Available } });
    expect(res.status).toBe(HttpStatusCodes.NOT_FOUND);
    // Service returns RouteError which the server converts to an error string body
    expect(res.body.error).toBe(UNIT_NOT_FOUND_ERR);
  });

});
