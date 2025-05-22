import { snapshotService } from "@/services/snapshotService";
import type { NextFunction, Request, Response } from "express";

export const snapshotController = {
  async getSnapshotById(req: Request, res: Response, _: NextFunction) {
    const snapshot_id = Number(req.params.snapshot_id);
    if (isNaN(snapshot_id)) {
      return res.status(400).json({ error: "Invalid snapshot_id" });
    }

    const result = await snapshotService.getOrders({ snapshot_id });
    if (!result) {
      return res.status(404).json({ error: "Snapshot not found" });
    }

    res.json(result);
  },
};