import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import UnitRoutes from './UnitRoutes';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();


// ** Add UnitRouter ** //

// Init router
const unitRouter = Router();

// Get all units
unitRouter.get(Paths.Units.Get, UnitRoutes.getAll);
unitRouter.get(Paths.Units.GetOne, UnitRoutes.getOne);
unitRouter.post(Paths.Units.Create, UnitRoutes.create);
unitRouter.put(Paths.Units.Update, UnitRoutes.update);

// Add UnitRouter
apiRouter.use(Paths.Units.Base, unitRouter);


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
