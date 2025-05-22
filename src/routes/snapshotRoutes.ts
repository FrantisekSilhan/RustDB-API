import { snapshotController } from "@/controllers/snapshotController";
import { snapshotLimiter } from "@/middlewares/rateLimiter";
import { asyncHandler } from "@/utils/asyncHandler";
import { Router } from "express";

const snapshotRoutes = Router();

//router.use(cache);

snapshotRoutes.get("/:snapshot_id", snapshotLimiter, asyncHandler(snapshotController.getSnapshotById));

export default snapshotRoutes;