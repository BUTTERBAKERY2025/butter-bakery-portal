import { Router, type IRouter } from "express";
import healthRouter from "./health";
import staffRouter from "./staff";
import designsRouter from "./designs";
import shareRouter from "./share";

const router: IRouter = Router();

router.use(healthRouter);
router.use(staffRouter);
router.use(designsRouter);
router.use(shareRouter);

export default router;
