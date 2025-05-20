import { itemController } from "@/controllers/itemController";
import { asyncHandler } from "@/utils/asyncHandler";
import { Router } from "express";

const itemRoutes = Router();

//router.use(cache);

itemRoutes.get("/", itemController.getAllItems);

itemRoutes.get("/item-id/:item_id", asyncHandler(itemController.getItemById));
itemRoutes.get("/class-id/:class_id", asyncHandler(itemController.getItemByClassId));
itemRoutes.get("/name/:name", asyncHandler(itemController.getItemByName));

export default itemRoutes;