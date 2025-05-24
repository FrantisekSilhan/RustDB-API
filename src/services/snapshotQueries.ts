import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";

export const snapshotExists = async (snapshot_id: number): Promise<boolean> => {
  const snapshot = await db
    .select({ exists: eq(schema.itemSnapshot.snapshot_id, snapshot_id) })
    .from(schema.itemSnapshot)
    .where(eq(schema.itemSnapshot.snapshot_id, snapshot_id))
    .limit(1);

  return snapshot.length > 0;
};

export const getOrders = async (snapshot_id: number, orderType: "sell" | "buy") => {
  const orderGraphTable = orderType === "sell" ? schema.sellOrderGraph : schema.buyOrderGraph;

  const orders = await db
    .select({
      price: orderGraphTable.price,
      cumulative_quantity: orderGraphTable.cumulative_quantity,
    })
    .from(orderGraphTable)
    .where(eq(orderGraphTable.snapshot_id, snapshot_id))
    .orderBy(asc(orderGraphTable.cumulative_quantity));

  if (orders.length === 0) return null;

  const formattedOrders = orders.map((order, index) => {
    const quantity = index === 0 ? order.cumulative_quantity : order.cumulative_quantity - orders[index - 1].cumulative_quantity;
    return {
      price: order.price,
      quantity,
      cumulative_quantity: order.cumulative_quantity,
    };
  });

  return formattedOrders;
};