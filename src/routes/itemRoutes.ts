import { itemController } from "@/controllers/itemController";
import { asyncHandler } from "@/utils/asyncHandler";
import { Router } from "express";
import { itemListLimiter, itemDetailLimiter, minimalLimiter } from "@/middlewares/rateLimiter";

const itemRoutes = Router();

//router.use(cache);

itemRoutes.get("/", itemListLimiter, itemController.getAllItems);

itemRoutes.get("/item-id/:item_id", itemDetailLimiter, asyncHandler(itemController.getItemById));
itemRoutes.get("/class-id/:class_id", itemDetailLimiter, asyncHandler(itemController.getItemByClassId));
itemRoutes.get("/name/:name", itemDetailLimiter, asyncHandler(itemController.getItemByName));

itemRoutes.get("/item-id/:item_id/snapshot", itemDetailLimiter, asyncHandler(itemController.getItemSnapshotById));
itemRoutes.get("/class-id/:class_id/snapshot", itemDetailLimiter, asyncHandler(itemController.getItemSnapshotByClassId));
itemRoutes.get("/name/:name/snapshot", itemDetailLimiter, asyncHandler(itemController.getItemSnapshotByName));

itemRoutes.get("/item-id/:item_id/orderbook", itemDetailLimiter, asyncHandler(itemController.getItemOrderBookById));
itemRoutes.get("/class-id/:class_id/orderbook", itemDetailLimiter, asyncHandler(itemController.getItemOrderBookByClassId));
itemRoutes.get("/name/:name/orderbook", itemDetailLimiter, asyncHandler(itemController.getItemOrderBookByName));

itemRoutes.get("/recent", itemDetailLimiter, asyncHandler(itemController.getRecentItems));

itemRoutes.get("/minimal", minimalLimiter, asyncHandler(itemController.getItemsMinimal));
itemRoutes.get("/minimal/last", itemDetailLimiter, asyncHandler(itemController.getItemsMinimalLast));
itemRoutes.get("/minimal/diff", minimalLimiter, asyncHandler(itemController.getItemsMinimalDiff));

export default itemRoutes;