import { getOrders, snapshotExists } from "./snapshotQueries";

export const snapshotService = {
  async getOrders({ snapshot_id }: { snapshot_id: number }) {
    const exists = await snapshotExists(snapshot_id);
    if (!exists) {
      return null;
    }
    const sellOrders = await getOrders(snapshot_id, "sell");
    const buyOrders = await getOrders(snapshot_id, "buy");

    return {
      "sell_orders": sellOrders,
      "buy_orders": buyOrders,
    }
  },
};