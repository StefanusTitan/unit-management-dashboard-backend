import { isString } from 'jet-validators';
import { transform } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import UnitService from '@src/services/UnitService';
import Unit from '@src/models/Unit';

import { IReq, IRes } from './common/types';
import { parseReq } from './common/util';


/******************************************************************************
                                Constants
******************************************************************************/

const Validators = {
  create: parseReq({ unit: Unit.testCreate }),
  update: parseReq({
    params: { id: transform(String, isString) },
    body: { unit: Unit.testUpdate },
  }),
  getOne: parseReq({ id: transform(String, isString) }),
  // Optional query filters for getAll
  getAll: parseReq({
    query: {
      name: (val: unknown) => val === undefined || isString(val),
      status: (val: unknown) => val === undefined || isString(val),
      type: (val: unknown) => val === undefined || isString(val),
    },
  }),
} as const;


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all units.
 */
async function getAll(_: IReq, res: IRes) {
  // Validate and extract optional query filters
  const { query } = Validators.getAll({ query: _.query || {} });
  // Only forward provided filters
  const filters: Record<string, unknown> = {};
  if (query?.name) filters.name = query.name;
  if (query?.status) filters.status = query.status;
  if (query?.type) filters.type = query.type;

  const units = await UnitService.getAll(filters);
  res.status(HttpStatusCodes.OK).json({ units });
}

/**
 * Create one unit.
 */
async function create(req: IReq, res: IRes) {
  const { unit } = Validators.create(req.body);
  const unitObj = Unit.new(unit);
  await UnitService.createOne(unitObj);
  res.status(HttpStatusCodes.CREATED).json({ unit: unitObj }).end();
}

/**
 * Update one unit (status).
 */
async function update(req: IReq, res: IRes) {
  const { 
    params: { id }, 
    body: { unit }, 
  } = Validators.update({ params: req.params, body: req.body });
  await UnitService.updateOne(id, unit);
  res.status(HttpStatusCodes.OK).json({ unit: { id, ...unit } }).end();
}

/**
 * Get one unit.
 */
async function getOne(req: IReq, res: IRes) {
  const { id } = Validators.getOne(req.params);
  const unit = await UnitService.getOne(id);
  if (!unit) {
    res.status(HttpStatusCodes.NOT_FOUND).end();
    return;
  }
  res.status(HttpStatusCodes.OK).json({ unit });
}


/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAll,
  create,
  update,
  getOne,
} as const;
