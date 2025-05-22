import { itemController } from "@/controllers/itemController";
import { asyncHandler } from "@/utils/asyncHandler";
import { Router } from "express";
import { itemListLimiter, itemDetailLimiter } from "@/middlewares/rateLimiter";

const itemRoutes = Router();

//router.use(cache);

itemRoutes.get("/", itemListLimiter, itemController.getAllItems);

itemRoutes.get("/item-id/:item_id", itemDetailLimiter, asyncHandler(itemController.getItemById));
itemRoutes.get("/class-id/:class_id", itemDetailLimiter, asyncHandler(itemController.getItemByClassId));
itemRoutes.get("/name/:name", itemDetailLimiter, asyncHandler(itemController.getItemByName));

itemRoutes.get("/item-id/:item_id/snapshot", itemDetailLimiter, asyncHandler(itemController.getItemSnapshotById));
itemRoutes.get("/class-id/:class_id/snapshot", itemDetailLimiter, asyncHandler(itemController.getItemSnapshotByClassId));
itemRoutes.get("/name/:name/snapshot", itemDetailLimiter, asyncHandler(itemController.getItemSnapshotByName));

export default itemRoutes;