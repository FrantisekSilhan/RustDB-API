import { itemService } from "@/services/itemService";
import { getPaginationParams } from "@/utils/pagination";
import type { NextFunction, Request, Response } from "express";

export const itemController = {
  async getAllItems(req: Request, res: Response, _: NextFunction) {
    const { page, limit } = getPaginationParams(req);
    const search = req.query.search as string | undefined;

    const result = await itemService.getAllItems({
      page,
      limit,
      search,
    });

    res.json(result);
  },

  async getItemByClassId(req: Request, res: Response, _: NextFunction) {
    const class_id = Number(req.params.class_id);
    if (isNaN(class_id)) {
      return res.status(400).json({ error: "Invalid class_id" });
    }

    const result = await itemService.getItemByClassId({ class_id });
    if (!result) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result);
  },

  async getItemById(req: Request, res: Response, _: NextFunction) {
    const item_id = Number(req.params.item_id);
    if (isNaN(item_id)) {
      return res.status(400).json({ error: "Invalid item_id" });
    }

    const result = await itemService.getItemById({ item_id });
    if (!result) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result);
  },

  async getItemByName(req: Request, res: Response, _: NextFunction) {
    const name = req.params.name;
    if (!name) {
      return res.status(400).json({ error: "Invalid name" });
    }

    const result = await itemService.getItemByName({ name });
    if (!result) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result);
  },
};